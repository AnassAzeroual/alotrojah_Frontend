// Daily design screenshots — NOT part of the e2e suite (testDir never picks
// up scripts/). Usage:
//   npm run shots                  → the default page set below
//   npm run shots -- /students      → just that page (name or path; both themes)
//   npm run shots -- students scoring levels
// Boots its OWN backend (verify DB via env, never dev) + frontend, refuses to
// run if :8002/:4202 are busy (a foreign server there means "hands off"),
// captures the pages in both themes, then tears everything down. Read-only:
// login POST is the only write.
import { execSync, spawn } from 'node:child_process';
import { mkdirSync } from 'node:fs';
import net from 'node:net';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { chromium, expect } from '@playwright/test';

const BACKEND = 'http://127.0.0.1:8002';
const FRONTEND = 'http://127.0.0.1:4202';
const BACKEND_PORT = Number(new URL(BACKEND).port);
const FRONTEND_PORT = Number(new URL(FRONTEND).port);
const ROOT = path.dirname(fileURLToPath(import.meta.url));
const PAGES = [
  { path: '/', name: 'dashboard', readySelector: '.kpi' },
  { path: '/centers', name: 'centers', ready: 'تعديل' },
  { path: '/levels', name: 'levels', ready: 'المستوى الأول' },
  { path: '/students', name: 'students', ready: 'بدون حلقة' },
  { path: '/students/new', name: 'students-new', ready: 'الاسم الكامل' },
  { path: '/users', name: 'users', ready: 'بدون حلقة نشطة' },
  { path: '/users/new', name: 'users-new', ready: 'الاسم الكامل' },
  { path: '/groups', name: 'groups', ready: 'تصدير CSV' },
  { path: '/groups/new', name: 'groups-new', ready: 'الحلقة' },
  { path: '/entry', name: 'entry', ready: 'اختر الحلقة والأسبوع والحصة للبدء' },
  // Seasons render as cards when ≥1 exists (verify seed keeps one; the empty
  // state would fail loudly here instead of shooting blank — by design).
  { path: '/planning', name: 'planning', ready: 'الفصول' },
  { path: '/planning/new', name: 'planning-new', ready: 'موسم جديد' },
  { path: '/planning/plans', name: 'planning-plans', ready: 'خطط الفصول' },
  { path: '/scoring', name: 'scoring', ready: 'المجموع الأسبوعي' },
  { path: '/exams', name: 'exams', ready: 'النوع' },
  { path: '/exams/new', name: 'exams-new', ready: 'اختبار جديد' },
  // Picker-gated with no picker-independent content marker: the pathname
  // assert + settle below carry it (sidebar text would match vacuously).
  { path: '/reviews', name: 'reviews', ready: 'المراجعة' },
  { path: '/results/term', name: 'results-term', ready: 'نتائج الفصل' },
  { path: '/results/season', name: 'results-season', ready: 'نتائج الموسم' },
  { path: '/reports/term', name: 'reports-term', ready: 'تقرير الفصل' },
  { path: '/reports/season', name: 'reports-season', ready: 'تقرير الموسم' },
  { path: '/news', name: 'news', ready: 'نشر' },
  { path: '/delegate', name: 'delegate', ready: 'توليد الرابط' },
  { path: '/notifications', name: 'notifications', ready: 'إضافة' },
  { path: '/registrations', name: 'registrations', readySelector: '.req-card, .empty' },
  { path: '/settings', name: 'settings', ready: 'تحرير النطاق' },
  // NOTE: volatile :id detail pages stay out of the defaults (ids drift as
  // e2e creates/deletes rows) — shoot them explicitly, e.g. `students/5`.
];

/** CLI page filter: names or paths (`students`, `/students`), else the default set.
 *  Anything goto accepts works: nested routes (`/planning/terms/1` — use real
 *  ids from the verify seed), query strings (`/students?status=active`),
 *  fragments. Unknown paths fail fast instead of shooting the redirect target. */
function selectedPages() {
  const args = process.argv.slice(2).filter((a) => !a.startsWith('-'));
  if (args.length === 0) return PAGES;
  return args.map((arg) => {
    const known = PAGES.find((p) => p.path === arg || p.name === arg.replace(/^\//, ''));
    if (known) return known;
    const cut = arg.search(/[?#]/);
    const raw = cut < 0 ? arg : arg.slice(0, cut);
    const suffix = cut < 0 ? '' : arg.slice(cut);
    const clean = raw.startsWith('/') ? raw : `/${raw}`;
    const name = clean.replace(/^\//, '').replace(/[^a-zA-Z0-9_-]+/g, '-') || 'root';
    return { path: clean + suffix, name, ready: null };
  });
}

function portBusy(port) {
  return new Promise((resolve) => {
    const s = net.connect(port, '127.0.0.1');
    s.once('connect', () => {
      s.end();
      resolve(true);
    });
    s.once('error', () => resolve(false));
  });
}

async function waitFor(url, label, tries = 90) {
  for (let i = 0; i < tries; i++) {
    try {
      const r = await fetch(url);
      if (r.ok) return;
    } catch {
      /* not up yet */
    }
    if (i > 0 && i % 10 === 0) console.log(`... still waiting on ${label} (${i * 2}s)`);
    await new Promise((r) => setTimeout(r, 2000));
  }
  throw new Error(`${label} never came up: ${url}`);
}

/**
 * Hardened login (twin of e2e/api.ts loginAs + fillStable — kept in sync by
 * hand, plain node cannot import TS): fresh forms can wipe mid-fill fields,
 * so verify every fill and re-verify the email post-password before clicking.
 */
async function stableFill(locator, value) {
  for (let i = 0; i < 3; i++) {
    await locator.fill(value);
    try {
      await expect(locator).toHaveValue(value, { timeout: 2000 });
      return;
    } catch {
      // wiped beneath us — refill
    }
  }
  await expect(locator).toHaveValue(value);
}

async function login(page, email, password) {
  const mail = page.getByTestId('auth-email');
  const pw = page.getByTestId('auth-password');
  const submit = page.getByTestId('auth-submit');
  for (let i = 0; i < 2; i++) {
    await page.goto(`${FRONTEND}/login`);
    await stableFill(mail, email);
    await stableFill(pw, password);
    try {
      await expect(mail).toHaveValue(email, { timeout: 2000 });
      await submit.click();
      return;
    } catch {
      // wiped again after verify — one full refill, then fail loudly below
    }
  }
  await expect(mail).toHaveValue(email);
  await submit.click();
}

async function main() {
  try {
    execSync('php --version', { stdio: 'ignore' });
  } catch {
    throw new Error('php not found on PATH — install PHP 8.4 or fix PATH.');
  }
  if (await portBusy(BACKEND_PORT))
    throw new Error(
      `Port ${BACKEND_PORT} busy — refusing to drive an unknown server. Kill node first, then retry.`,
    );
  if (await portBusy(FRONTEND_PORT))
    throw new Error(
      `Port ${FRONTEND_PORT} busy — refusing to reuse an unknown frontend. Kill node first, then retry.`,
    );

  const backendDir = path.join(ROOT, '..', '..', 'alotrojah_Backend');
  // NOTE: no `shell: true` with arg arrays (DEP0190 + it orphans servers on
  // win32). php spawns directly; ng goes through one cmd string so the tree
  // kill below still reaps everything and ports are free next run.
  const api = spawn('php', ['artisan', 'serve', `--host=127.0.0.1`, `--port=${BACKEND_PORT}`], {
    cwd: backendDir,
    env: {
      ...process.env,
      DB_DATABASE: 'alotrojah_verify',
      FRONTEND_URLS: FRONTEND,
    },
    stdio: 'ignore',
  });
  const web = spawn(
    'cmd.exe',
    [
      '/d',
      '/s',
      '/c',
      `npx ng serve --port ${FRONTEND_PORT} --host 127.0.0.1 --configuration shots`,
    ],
    { env: process.env, stdio: 'ignore' },
  );
  // NOTE: plain child.kill() only takes the cmd wrapper on win32 and orphans
  // the real servers — always tree-kill so ports are free next run.
  const kill = () => {
    for (const p of [api, web]) {
      try {
        if (process.platform === 'win32' && p.pid) execSync(`taskkill /PID ${p.pid} /T /F`);
        else p.kill();
      } catch {}
    }
  };
  process.on('SIGINT', () => {
    kill();
    process.exit(1);
  });

  let browser;
  try {
    await waitFor(`${BACKEND}/up`, 'backend');
    await waitFor(`${FRONTEND}/`, 'frontend');

    const day = new Date().toISOString().slice(0, 10);
    const outDir = path.join(ROOT, '..', 'screenshots', day);
    mkdirSync(outDir, { recursive: true });
    const JOBS = selectedPages();

    browser = await chromium.launch();
    const page = await browser.newPage({
      viewport: { width: 1440, height: 900 },
      reducedMotion: 'reduce',
    });
    await login(page, 'admin@example.org', 'password123');
    await page.waitForURL(`${FRONTEND}/`, { timeout: 30000 });

    for (const theme of ['dark', 'light']) {
      // Deterministic theme (never a UI toggle race): the service boots its
      // signal from localStorage, so seed + reload, then prove data-theme.
      await page.evaluate((t) => localStorage.setItem('alotrojah_theme', t), theme);
      await page.reload();
      await expect(page.locator('html')).toHaveAttribute('data-theme', theme, {
        timeout: 30000,
      });
      for (const [i, p] of JOBS.entries()) {
        await page.goto(`${FRONTEND}${p.path}`);
        const landed = new URL(page.url()).pathname;
        const want = new URL(p.path, FRONTEND).pathname;
        if (landed !== want) {
          throw new Error(
            `"${p.path}" landed on "${landed}" (guard/redirect?) — fix the path, not the shot.`,
          );
        }
        if (p.ready) {
          await page.getByText(p.ready, { exact: false }).first().waitFor({ timeout: 30000 });
        }
        if (p.readySelector) {
          await page.locator(p.readySelector).first().waitFor({ timeout: 30000 });
        }
        // Let layout settle (fonts, charts, late rows) before capturing.
        await page.waitForTimeout(3000);
        const n = `${String(i).padStart(2, '0')}-${p.name}-${theme}.png`;
        await page.screenshot({ path: path.join(outDir, n), fullPage: true });
        console.log(`shot: screenshots/${day}/${n}`);
      }
    }
  } finally {
    // browser first (releases the profile lock), then the servers.
    await browser?.close().catch(() => undefined);
    kill();
  }
}

main().catch((e) => {
  console.error(e.message);
  process.exit(1);
});

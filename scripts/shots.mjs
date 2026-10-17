// Daily design screenshots — NOT part of the e2e suite (testDir never picks
// up scripts/). Usage:
//   npm run shots                  → the default page set below
//   npm run shots -- /students      → just that page (name or path; both themes)
//   npm run shots -- students scoring levels
//   npm run shots -- --jobs 4       → 4 parallel capture contexts (default 3)
//   npm run shots -- --reuse        → drive already-running :8002/:4202
//   npm run shots -- --retries 3    → total attempts per capture (default 2)
//   npm run shots -- --timeout 45   → readiness-gate seconds (default 30)
//   npm run shots -- --viewport phone   → 390×844 into screenshots/<day>/phone/
//   npm run shots -- --viewport tablet  → 768×1024 into screenshots/<day>/tablet/
//   (default viewport: desktop 1440×900 → screenshots/<day>/ flat, as before)
// Boots its OWN backend (verify DB via env, never dev) + frontend, refuses to
// run if :8002/:4202 are busy (a foreign server there means "hands off"),
// captures the pages in both themes, then tears everything down. Read-only:
// login POST is the only write. One bad page never kills the run: every
// capture retries (with session recovery), failures are collected, and the
// script exits 1 with a per-page table and a failure list if anything failed.
import { execSync, spawn } from 'node:child_process';
import { mkdirSync, renameSync, rmSync, writeFileSync } from 'node:fs';
import net from 'node:net';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { chromium, expect } from '@playwright/test';

const BACKEND = 'http://127.0.0.1:8002';
const FRONTEND = 'http://127.0.0.1:4202';
const BACKEND_PORT = Number(new URL(BACKEND).port);
const FRONTEND_PORT = Number(new URL(FRONTEND).port);
const ADMIN_EMAIL = 'admin@example.org';
const ADMIN_PASSWORD = 'password123';
// Tunables (--retries N / --timeout N, clamped in parseArgs). attempts = tries
// per page+theme before a capture is recorded as failed — the run itself never
// stops for a single bad page. readyTimeoutMs caps the HARD functional gate
// only; every settle layer stays fail-open regardless of it.
const RUN = { attempts: 2, readyTimeoutMs: 30000 };
// Named capture viewports (--viewport). Desktop stays the default AND keeps
// the flat output dir; phone/tablet write into their own subdirs so the same
// page+theme filenames never clobber each other across viewports.
const VIEWPORTS = {
  phone: { width: 390, height: 844 },
  tablet: { width: 768, height: 1024 },
  desktop: { width: 1440, height: 900 },
};
// Injected just before each shot: freeze animations/transitions and hide the
// caret so every capture is deterministic (no mid-animation/blink frames).
const FREEZE_CSS =
  '*, *::before, *::after { animation-play-state: paused !important; transition: none !important; caret-color: transparent !important; }';
const ROOT = path.dirname(fileURLToPath(import.meta.url));
// Readiness caps: every probe fails OPEN (shoot anyway) so a slow widget can
// never wedge the run — the fixed 3s sleep this replaces had no cap either.
const SETTLE_CAP = 8000;
const QUIET_WINDOW = 400;
const POLL_STEP = 150;
const PAGES = [
  { path: '/', name: 'dashboard', readySelector: '.kpi' },
  { path: '/centers', name: 'centers', ready: 'تعديل' },
  { path: '/levels', name: 'levels', ready: 'المستوى الأول' },
  { path: '/students', name: 'students', ready: 'بدون قسم' },
  { path: '/students/new', name: 'students-new', ready: 'الاسم الكامل' },
  { path: '/users', name: 'users', ready: 'بدون قسم نشط' },
  { path: '/users/new', name: 'users-new', ready: 'الاسم الكامل' },
  { path: '/groups', name: 'groups', ready: 'تصدير CSV' },
  { path: '/groups/new', name: 'groups-new', ready: 'إضافة قسم' },
  { path: '/entry', name: 'entry', ready: 'اختر القسم والأسبوع والحصة للبدء' },
  // Seasons render as cards when ≥1 exists (verify seed keeps one; the empty
  // state would fail loudly here instead of shooting blank — by design).
  { path: '/planning', name: 'planning', ready: 'الفصول' },
  { path: '/planning/new', name: 'planning-new', ready: 'موسم جديد' },
  { path: '/planning/plans', name: 'planning-plans', ready: 'خطط الفصول' },
  { path: '/planning/calendar', name: 'calendar', readySelector: '.cal-month-view' },
  { path: '/scoring', name: 'scoring', ready: 'المجموع الأسبوعي' },
  { path: '/exams', name: 'exams', ready: 'النوع' },
  { path: '/exams/new', name: 'exams-new', ready: 'اختبار جديد' },
  // Picker-gated: the h1 alone carries the wait (nav.reviews label is the
  // same string; its hidden phone-drawer match is filtered out).
  { path: '/reviews', name: 'reviews', ready: 'المراجعة' },
  { path: '/results/term', name: 'results-term', ready: 'نتائج الفصل' },
  { path: '/results/season', name: 'results-season', ready: 'نتائج الموسم' },
  { path: '/reports/term', name: 'reports-term', ready: 'تقرير الفصل' },
  { path: '/reports/season', name: 'reports-season', ready: 'تقرير الموسم' },
  { path: '/news', name: 'news', ready: 'نشر' },
  // Picker-gated like reviews: the generate button ('توليد الرابط') only
  // renders after picking a group, so the h1 text carries the wait and the
  // pathname assert + settle carry the capture.
  { path: '/delegate', name: 'delegate', ready: 'التفويض' },
  { path: '/notifications', name: 'notifications', ready: 'إضافة' },
  { path: '/registrations', name: 'registrations', readySelector: '.req-card, .empty' },
  { path: '/settings', name: 'settings', ready: 'تحرير النطاق' },
  // NOTE: volatile :id detail pages stay out of the defaults (ids drift as
  // e2e creates/deletes rows) — shoot them explicitly, e.g. `students/5`.
];

/**
 * CLI flags: --jobs N (1..8, default 3), --reuse, --retries N (total attempts
 * per capture, default 2, clamp 1..5), --timeout N (readiness-gate seconds,
 * default 30, clamp 5..120), --viewport phone|tablet|desktop (default
 * desktop; unknown values fail fast). The rest are page filters.
 */
function parseArgs() {
  const raw = process.argv.slice(2);
  let jobs = 3;
  let retries = RUN.attempts;
  let timeout = RUN.readyTimeoutMs / 1000;
  let reuse = false;
  let viewport = 'desktop';
  const pages = [];
  for (let i = 0; i < raw.length; i++) {
    const a = raw[i];
    if (a === '--reuse') reuse = true;
    else if (a === '--jobs' && i + 1 < raw.length) jobs = Number(raw[++i]);
    else if (a.startsWith('--jobs=')) jobs = Number(a.slice('--jobs='.length));
    else if (a === '--retries' && i + 1 < raw.length) retries = Number(raw[++i]);
    else if (a.startsWith('--retries=')) retries = Number(a.slice('--retries='.length));
    else if (a === '--timeout' && i + 1 < raw.length) timeout = Number(raw[++i]);
    else if (a.startsWith('--timeout=')) timeout = Number(a.slice('--timeout='.length));
    else if (a === '--viewport' && i + 1 < raw.length) viewport = raw[++i];
    else if (a.startsWith('--viewport=')) viewport = a.slice('--viewport='.length);
    else if (!a.startsWith('-')) pages.push(a);
  }
  if (!Number.isFinite(jobs) || jobs < 1) jobs = 1;
  if (!Number.isFinite(retries) || retries < 1) retries = 1;
  if (!Number.isFinite(timeout) || timeout < 5) timeout = 5;
  if (!VIEWPORTS[viewport]) {
    throw new Error(
      `--viewport must be one of ${Object.keys(VIEWPORTS).join(' | ')} (got "${viewport}")`,
    );
  }
  return {
    jobs: Math.min(8, Math.floor(jobs)),
    retries: Math.min(5, Math.floor(retries)),
    timeout: Math.min(120, Math.floor(timeout)),
    reuse,
    viewport,
    pages,
  };
}

/** CLI page filter: names or paths (`students`, `/students`), else the default set.
 *  Anything goto accepts works: nested routes (`/planning/terms/1` — use real
 *  ids from the verify seed), query strings (`/students?status=active`),
 *  fragments. Unknown paths fail fast instead of shooting the redirect target. */
function selectedPages(filters) {
  if (filters.length === 0) return PAGES;
  return filters.map((arg) => {
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

/**
 * True page readiness instead of a fixed sleep. Layers, cheapest first, every
 * layer after the functional gate fails OPEN (shoot anyway) so nothing here
 * can wedge the run:
 *  1. functional gate — the page's own ready text/selector (hard, --timeout s)
 *  2. document.readyState complete (initial document really loaded)
 *  3. webfonts loaded (no late glyph/CLS swaps after the shot)
 *  4. Angular settled (empty testability list = zoneless/stable = ready)
 *  5. scroll-through — trips lazy-loaded content, then back to top
 *  6. images decoded (complete covers broken loads — data issues don't block)
 *  7. network quiet — zero in-flight requests for QUIET_WINDOW ms
 *  8. two animation frames (one last paint lands before capture)
 */
async function awaitReady(page, p, pending) {
  if (p.ready) {
    // Visible-only: below $bp-md the sidebar stays in the DOM but hidden, and
    // nav-label ready texts (reviews/delegate) match its link first — a hidden
    // first match would hang even though the page h1 carries the same text.
    await page
      .getByText(p.ready, { exact: false })
      .filter({ visible: true })
      .first()
      .waitFor({ timeout: RUN.readyTimeoutMs });
  }
  if (p.readySelector) {
    await page.locator(p.readySelector).first().waitFor({ timeout: RUN.readyTimeoutMs });
  }
  try {
    await page.waitForFunction(() => document.readyState === 'complete', null, { timeout: 5000 });
  } catch {
    /* slow widget — shoot anyway */
  }
  const deadline = Date.now() + SETTLE_CAP;
  try {
    await page.evaluate(() => document.fonts?.ready, { timeout: 5000 });
  } catch {
    /* fonts API missing or too slow — shoot anyway */
  }
  while (Date.now() < deadline) {
    let stable = true;
    try {
      stable = await page.evaluate(
        () =>
          typeof window.getAllAngularTestabilities !== 'function' ||
          window.getAllAngularTestabilities().every((t) => t.isStable()),
        { timeout: 2000 },
      );
    } catch {
      stable = true;
    }
    if (stable) break;
    await page.waitForTimeout(POLL_STEP);
  }
  // Scroll through the page to wake lazy-loaded content, then return to top —
  // bounded steps so an infinite-scroll page can't stretch this out; the
  // image + network layers below cover whatever the trip initiated.
  try {
    await page.evaluate(async () => {
      const delay = (ms) => new Promise((r) => setTimeout(r, ms));
      const step = Math.max(400, Math.floor(window.innerHeight / 2));
      const max = Math.max(
        document.body.scrollHeight,
        document.documentElement.scrollHeight,
        window.innerHeight,
      );
      const steps = Math.min(60, Math.ceil(max / step));
      for (let i = 1; i <= steps; i++) {
        window.scrollTo(0, i * step);
        await delay(40);
      }
      window.scrollTo(0, 0);
    });
  } catch {
    /* custom-scroll or wedged page — shoot anyway */
  }
  try {
    await page.waitForFunction(() => [...document.images].every((i) => i.complete), null, {
      timeout: 5000,
    });
  } catch {
    /* image stragglers — shoot anyway */
  }
  let quietSince = 0;
  while (Date.now() < deadline) {
    if (pending() === 0) {
      if (!quietSince) quietSince = Date.now();
      if (Date.now() - quietSince >= QUIET_WINDOW) break;
    } else {
      quietSince = 0;
    }
    await page.waitForTimeout(POLL_STEP);
  }
  try {
    await page.evaluate(
      () => new Promise((r) => requestAnimationFrame(() => requestAnimationFrame(r))),
      {
        timeout: 3000,
      },
    );
  } catch {
    /* headless hiccup — shoot anyway */
  }
}

/**
 * One screenshot attempt with an atomic write: capture to a buffer, stage the
 * bytes at `file.tmp`, then rename — a crash mid-write (or Ctrl+C) can never
 * leave a half-written PNG at the final name. The screenshot must NOT pass
 * `path:` itself — Playwright infers the format from the extension and a
 * `.tmp` name dies with "unsupported mime type". One immediate in-place retry
 * covers transient compositor hiccups without re-navigating. Returns size.
 */
async function shootFile(page, file) {
  const tmp = `${file}.tmp`;
  let lastErr;
  for (let i = 0; i < 2; i++) {
    try {
      const buf = await page.screenshot({ fullPage: true });
      if (!buf.length) throw new Error('screenshot captured 0 bytes');
      writeFileSync(tmp, buf);
      renameSync(tmp, file);
      return buf.length;
    } catch (e) {
      lastErr = e;
      rmSync(tmp, { force: true });
      if (i === 0) await page.waitForTimeout(300);
    }
  }
  throw lastErr;
}

/**
 * One page+theme capture with bounded retries. Navigation failure, a dead
 * session (landed back on /login → re-login first) or a redirect to an
 * unexpected path each consume an attempt; after RUN.attempts the error is
 * rethrown for the caller to record. The run never stops for one bad page.
 */
async function capturePage(page, p, theme, pending, outDir, relOut, pageErrors) {
  let lastErr;
  for (let attempt = 1; attempt <= RUN.attempts; attempt++) {
    pageErrors.length = 0;
    try {
      await page.goto(`${FRONTEND}${p.path}`);
      if (new URL(page.url()).pathname === '/login') {
        // Session expired mid-run — re-auth in this context, then re-approach.
        console.log(`    re-login (session lost) before "${p.name}" [${theme}]`);
        await login(page, ADMIN_EMAIL, ADMIN_PASSWORD);
        await page.waitForURL(`${FRONTEND}/`, { timeout: 30000 });
        await page.goto(`${FRONTEND}${p.path}`);
      }
      const landed = new URL(page.url()).pathname;
      const want = new URL(p.path, FRONTEND).pathname;
      if (landed !== want) {
        throw new Error(
          `"${p.path}" landed on "${landed}" (guard/redirect?) — fix the path, not the shot.`,
        );
      }
      await awaitReady(page, p, pending);
      // Deterministic pixels: freeze animations/transitions + hide the caret
      // just before the shot (fresh <style> per capture — goto reloads docs).
      await page.addStyleTag({ content: FREEZE_CSS }).catch(() => undefined);
      const n = `${String(p.i).padStart(2, '0')}-${p.name}-${theme}.png`;
      const bytes = await shootFile(page, path.join(outDir, n));
      console.log(`shot: ${relOut}/${n} (${(bytes / 1024).toFixed(0)} KB)`);
      if (pageErrors.length) {
        console.log(
          `    note: "${p.name}" [${theme}] logged ${pageErrors.length} console/page error(s):`,
        );
        for (const e of pageErrors.slice(0, 3)) console.log(`      - ${e}`);
      }
      return;
    } catch (e) {
      lastErr = e;
      if (attempt < RUN.attempts) {
        const msg = e?.message?.split('\n')[0] ?? String(e);
        // net::/chunk-load noise usually means ng serve is mid-rebuild — the
        // next goto IS the reload, it just needs a longer beat to land.
        const rebuilding = /net::|ERR_|chunk|Failed to fetch/i.test(msg);
        const wait = rebuilding ? 2000 : 1000;
        console.log(
          `    "${p.name}" [${theme}] attempt ${attempt} failed${rebuilding ? ' (dev-server rebuild?)' : ''} — retry in ${wait}ms: ${msg}`,
        );
        await page.waitForTimeout(wait);
      }
    }
  }
  throw lastErr;
}

async function main() {
  const { jobs, reuse, pages, retries, timeout, viewport } = parseArgs();
  RUN.attempts = retries;
  RUN.readyTimeoutMs = timeout * 1000;
  try {
    execSync('php --version', { stdio: 'ignore' });
  } catch {
    throw new Error('php not found on PATH — install PHP 8.4 or fix PATH.');
  }
  const backendBusy = await portBusy(BACKEND_PORT);
  const frontendBusy = await portBusy(FRONTEND_PORT);
  if (!reuse) {
    if (backendBusy)
      throw new Error(
        `Port ${BACKEND_PORT} busy — refusing to drive an unknown server. Kill node first, then retry.`,
      );
    if (frontendBusy)
      throw new Error(
        `Port ${FRONTEND_PORT} busy — refusing to reuse an unknown frontend. Kill node first, then retry.`,
      );
  }

  const backendDir = path.join(ROOT, '..', '..', 'alotrojah_Backend');
  // NOTE: no `shell: true` with arg arrays (DEP0190 + it orphans servers on
  // win32). php spawns directly; ng goes through one cmd string so the tree
  // kill below still reaps everything and ports are free next run.
  const spawned = [];
  const api = reuse
    ? null
    : spawn('php', ['artisan', 'serve', `--host=127.0.0.1`, `--port=${BACKEND_PORT}`], {
        cwd: backendDir,
        env: {
          ...process.env,
          DB_DATABASE: 'alotrojah_verify',
          FRONTEND_URLS: FRONTEND,
        },
        stdio: 'ignore',
      });
  const web = reuse
    ? null
    : spawn(
        'cmd.exe',
        [
          '/d',
          '/s',
          '/c',
          `npx ng serve --port ${FRONTEND_PORT} --host 127.0.0.1 --configuration shots`,
        ],
        { env: process.env, stdio: 'ignore' },
      );
  if (api) spawned.push(api);
  if (web) spawned.push(web);
  // NOTE: plain child.kill() only takes the cmd wrapper on win32 and orphans
  // the real servers — always tree-kill what WE spawned (never a --reuse
  // server we don't own) so ports are free next run.
  const kill = () => {
    for (const p of spawned) {
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
    // Both waits are independent — boot them together, not back to back.
    await Promise.all([waitFor(`${BACKEND}/up`, 'backend'), waitFor(`${FRONTEND}/`, 'frontend')]);

    const day = new Date().toISOString().slice(0, 10);
    // Desktop keeps the legacy flat dir; other viewports get a subdir so the
    // identical page+theme filenames never overwrite the desktop set.
    const sub = viewport === 'desktop' ? '' : viewport;
    const outDir = path.join(ROOT, '..', 'screenshots', day, sub);
    mkdirSync(outDir, { recursive: true });
    const relOut = sub ? `screenshots/${day}/${sub}` : `screenshots/${day}`;
    console.log(
      `viewport: ${viewport} ${VIEWPORTS[viewport].width}×${VIEWPORTS[viewport].height} → ${relOut}/`,
    );
    const JOBS = selectedPages(pages).map((p, i) => ({ ...p, i }));
    const workers = Math.min(jobs, JOBS.length);
    const failures = [];
    let okCount = 0;
    // Pre-created so a dead worker leaves its pages visible as '—' (never
    // attempted) in the end-of-run table instead of silently missing.
    const results = new Map(
      JOBS.map((p) => [
        p.i,
        { name: `${String(p.i).padStart(2, '0')}-${p.name}`, dark: '—', light: '—' },
      ]),
    );

    browser = await chromium.launch();
    const started = Date.now();
    // One context per worker (isolated storage/cookies). Pages are dealt
    // round-robin so every worker gets a mix; each worker runs its pages for
    // one theme, reloads once, then runs them for the other theme — the
    // global index in the filename keeps output identical to serial runs.
    await Promise.all(
      Array.from({ length: workers }, (_, w) =>
        (async () => {
          const context = await browser.newContext({
            viewport: VIEWPORTS[viewport],
            reducedMotion: 'reduce',
          });
          try {
            const page = await context.newPage();
            let pending = 0;
            page.on('request', () => pending++);
            page.on('requestfinished', () => pending--);
            page.on('requestfailed', () => pending--);
            // Diagnostic only — never gates a capture, just surfaces with it.
            const pageErrors = [];
            page.on('pageerror', (e) => {
              if (pageErrors.length < 20) pageErrors.push(`pageerror: ${e?.message ?? e}`);
            });
            page.on('console', (m) => {
              if (m.type() === 'error' && pageErrors.length < 20)
                pageErrors.push(`console.error: ${m.text()}`);
            });
            await login(page, ADMIN_EMAIL, ADMIN_PASSWORD);
            await page.waitForURL(`${FRONTEND}/`, { timeout: 30000 });
            for (const theme of ['dark', 'light']) {
              // Deterministic theme (never a UI toggle race): the service boots its
              // signal from localStorage, so seed + reload, then prove data-theme.
              await page.evaluate((t) => localStorage.setItem('alotrojah_theme', t), theme);
              await page.reload();
              await expect(page.locator('html')).toHaveAttribute('data-theme', theme, {
                timeout: 30000,
              });
              for (const p of JOBS.filter((_, j) => j % workers === w)) {
                const row = results.get(p.i);
                try {
                  await capturePage(page, p, theme, () => pending, outDir, relOut, pageErrors);
                  okCount++;
                  row[theme] = 'ok';
                } catch (e) {
                  const msg = e?.message?.split('\n')[0] ?? String(e);
                  const errs = pageErrors.slice(0, 2).join(' | ');
                  failures.push(`${p.name} [${theme}]: ${msg}${errs ? ` — console: ${errs}` : ''}`);
                  console.log(`FAIL: ${p.name} [${theme}] — ${msg}`);
                  row[theme] = 'FAIL';
                }
              }
            }
          } catch (e) {
            const msg = e?.message?.split('\n')[0] ?? String(e);
            failures.push(`worker ${w + 1} died: ${msg}`);
            console.error(`worker ${w + 1} died: ${msg} — its remaining pages are skipped`);
          } finally {
            await context.close().catch(() => undefined);
          }
        })(),
      ),
    );
    const width = Math.max(...[...results.values()].map((r) => r.name.length));
    console.log(`\n${'page'.padEnd(width)}   dark       light`);
    for (const r of [...results.values()].sort((a, b) => a.i - b.i)) {
      console.log(`${r.name.padEnd(width)}   ${r.dark.padEnd(11)}${r.light}`);
    }
    console.log(
      `\nshots done: ${okCount}/${JOBS.length * 2} captures across ${workers} worker(s) in ${((Date.now() - started) / 1000).toFixed(1)}s (servers excluded)`,
    );
    if (failures.length) {
      console.error(`\n${failures.length} failed capture(s):`);
      for (const f of failures) console.error(`  - ${f}`);
      throw new Error('shots run finished with failures');
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

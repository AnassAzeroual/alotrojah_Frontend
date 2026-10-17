// Responsive audit — companion to shots.mjs (same boot/login/layered-settle
// discipline, no screenshots). For every route it measures, at the chosen
// viewport: horizontal overflow (documentElement.scrollWidth - innerWidth) and
// sub-44px interactive targets. Boots its OWN backend (verify DB via env,
// never dev) + frontend on :8002/:4202, refusing busy ports. Read-only.
// Usage:
//   node scripts/audit-responsive.mjs                 → phone 390×844
//   node scripts/audit-responsive.mjs --viewport tablet
//   node scripts/audit-responsive.mjs /students       → single route
// Writes JSON next to the day's screenshots: screenshots/<day>/audit-<viewport>.json
// NOTE: phase-0/1 companion; delete or promote to npm script once the
// responsive redesign lands (kept out of package.json on purpose).
import { execSync, spawn } from 'node:child_process';
import { mkdirSync, writeFileSync } from 'node:fs';
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
const VIEWPORTS = {
  phone: { width: 390, height: 844 },
  tablet: { width: 768, height: 1024 },
  desktop: { width: 1440, height: 900 },
};
const ROOT = path.dirname(fileURLToPath(import.meta.url));
// Same route set as shots.mjs PAGES (paths only — the audit gates on Angular
// stability + network quiet, not per-page ready text).
const ROUTES = [
  { path: '/', name: 'dashboard' },
  { path: '/centers', name: 'centers' },
  { path: '/levels', name: 'levels' },
  { path: '/students', name: 'students' },
  { path: '/students/new', name: 'students-new' },
  { path: '/users', name: 'users' },
  { path: '/users/new', name: 'users-new' },
  { path: '/groups', name: 'groups' },
  { path: '/groups/new', name: 'groups-new' },
  { path: '/entry', name: 'entry' },
  { path: '/planning', name: 'planning' },
  { path: '/planning/new', name: 'planning-new' },
  { path: '/planning/plans', name: 'planning-plans' },
  { path: '/planning/calendar', name: 'calendar' },
  { path: '/scoring', name: 'scoring' },
  { path: '/exams', name: 'exams' },
  { path: '/exams/new', name: 'exams-new' },
  { path: '/reviews', name: 'reviews' },
  { path: '/results/term', name: 'results-term' },
  { path: '/results/season', name: 'results-season' },
  { path: '/reports/term', name: 'reports-term' },
  { path: '/reports/season', name: 'reports-season' },
  { path: '/news', name: 'news' },
  { path: '/delegate', name: 'delegate' },
  { path: '/notifications', name: 'notifications' },
  { path: '/registrations', name: 'registrations' },
  { path: '/settings', name: 'settings' },
];

function parseArgs() {
  const raw = process.argv.slice(2);
  let viewport = 'phone';
  const filters = [];
  for (let i = 0; i < raw.length; i++) {
    const a = raw[i];
    if (a === '--viewport' && i + 1 < raw.length) viewport = raw[++i];
    else if (a.startsWith('--viewport=')) viewport = a.slice('--viewport='.length);
    else if (!a.startsWith('-')) filters.push(a);
  }
  if (!VIEWPORTS[viewport]) {
    throw new Error(
      `--viewport must be one of ${Object.keys(VIEWPORTS).join(' | ')} (got "${viewport}")`,
    );
  }
  const routes = filters.length
    ? filters.map((f) => {
        const known = ROUTES.find((r) => r.path === f || r.name === f.replace(/^\//, ''));
        return (
          known ?? {
            path: f.startsWith('/') ? f : `/${f}`,
            name: f.replace(/[^a-zA-Z0-9_-]+/g, '-'),
          }
        );
      })
    : ROUTES;
  return { viewport, routes };
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
    await new Promise((r) => setTimeout(r, 2000));
  }
  throw new Error(`${label} never came up: ${url}`);
}

// Twin of shots.mjs stableFill/login (plain node cannot import TS).
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
 * The measurement itself, run in-page. Overflow = documentElement.scrollWidth
 * minus innerWidth (>0 → horizontal scrollbar). Offenders are the OUTERMOST
 * elements sticking out (children of an offender are folded into their
 * parent), skipping anything clipped by an ancestor (bg orbs etc). Small
 * targets = <44px in either axis, deduped by signature. All fail-open: a
 * broken page still yields a result row.
 */
function auditInPage() {
  const vw = window.innerWidth;
  const desc = (el) => {
    const cls = el.getAttribute('class');
    const short = cls ? '.' + cls.trim().split(/\s+/).slice(0, 2).join('.') : '';
    const tid = el.getAttribute('data-testid');
    return el.tagName.toLowerCase() + (el.id ? '#' + el.id : '') + short + (tid ? `[${tid}]` : '');
  };
  const clipped = (el) => {
    if (getComputedStyle(el).position === 'fixed') return true;
    for (let a = el.parentElement; a && a !== document.documentElement; a = a.parentElement) {
      const s = getComputedStyle(a);
      if (/hidden|clip|auto|scroll/.test(s.overflowX + s.overflowY)) return true;
    }
    return false;
  };
  const overflows = (r) => r.width > vw + 2 || r.right > vw + 2 || r.left < -2;
  const offenders = [];
  for (const el of document.querySelectorAll('body *')) {
    const r = el.getBoundingClientRect();
    if (r.width < 1 || r.height < 1) continue;
    if (!overflows(r)) continue;
    if (clipped(el)) continue;
    const p = el.parentElement;
    if (p && p !== document.body) {
      const pr = p.getBoundingClientRect();
      if (overflows(pr) && !clipped(p)) continue;
    }
    const severity = Math.round(Math.max(r.width - vw, r.right - vw, -r.left));
    offenders.push({
      el: desc(el),
      w: Math.round(r.width),
      left: Math.round(r.left),
      sev: severity,
    });
  }
  offenders.sort((a, b) => b.sev - a.sev);
  const seenSig = new Map();
  for (const el of document.querySelectorAll(
    'a, button, input, select, textarea, [role="button"]',
  )) {
    const r = el.getBoundingClientRect();
    if (r.width < 1 || r.height < 1) continue;
    const s = getComputedStyle(el);
    if (s.visibility === 'hidden' || s.display === 'none') continue;
    if (r.width >= 44 && r.height >= 44) continue;
    const sig = desc(el);
    const key = `${sig}|${Math.round(r.width)}x${Math.round(r.height)}`;
    if (!seenSig.has(key))
      seenSig.set(key, { sig, size: `${Math.round(r.width)}x${Math.round(r.height)}`, n: 0 });
    seenSig.get(key).n++;
  }
  const small = [...seenSig.values()].sort((a, b) => b.n - a.n).slice(0, 10);
  return {
    vw,
    scrollW: Math.max(document.documentElement.scrollWidth, document.body.scrollWidth),
    overflow: Math.max(document.documentElement.scrollWidth, document.body.scrollWidth) - vw,
    offenders: offenders.slice(0, 6),
    offenderCount: offenders.length,
    small,
    smallCount: [...seenSig.values()].reduce((acc, v) => acc + v.n, 0),
  };
}

async function settle(page) {
  // HARD gate: never measure an unbooted page. The Angular stability check
  // below passes vacuously while the app has not bootstrapped yet (the
  // testability fn does not exist), which once produced phantom 0px readings.
  await page
    .locator('.shell')
    .first()
    .waitFor({ timeout: 20000 })
    .catch(() => undefined);
  try {
    await page.waitForFunction(() => document.readyState === 'complete', null, { timeout: 5000 });
  } catch {
    /* audit anyway */
  }
  // Data-gated pages (centers, levels) render their rows after the shell shows —
  // Angular's stability check can pass between fetches, so an early measure
  // undercounts (a 271px centers table once read 0px). Wait for network quiet
  // first; fail-open so a polling page can't wedge the audit.
  try {
    await page.waitForLoadState('networkidle', { timeout: 8000 });
  } catch {
    /* audit anyway */
  }
  const deadline = Date.now() + 6000;
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
    await page.waitForTimeout(200);
  }
  await page.waitForTimeout(600);
}

async function main() {
  const { viewport, routes } = parseArgs();
  const vp = VIEWPORTS[viewport];
  try {
    execSync('php --version', { stdio: 'ignore' });
  } catch {
    throw new Error('php not found on PATH — install PHP 8.4 or fix PATH.');
  }
  if (await portBusy(BACKEND_PORT))
    throw new Error(`Port ${BACKEND_PORT} busy — refusing to drive an unknown server.`);
  if (await portBusy(FRONTEND_PORT))
    throw new Error(`Port ${FRONTEND_PORT} busy — refusing to reuse an unknown frontend.`);

  const backendDir = path.join(ROOT, '..', '..', 'alotrojah_Backend');
  const spawned = [];
  const api = spawn('php', ['artisan', 'serve', '--host=127.0.0.1', `--port=${BACKEND_PORT}`], {
    cwd: backendDir,
    env: { ...process.env, DB_DATABASE: 'alotrojah_verify', FRONTEND_URLS: FRONTEND },
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
  spawned.push(api, web);
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
    await Promise.all([waitFor(`${BACKEND}/up`, 'backend'), waitFor(`${FRONTEND}/`, 'frontend')]);
    browser = await chromium.launch();
    const context = await browser.newContext({
      viewport: vp,
      reducedMotion: 'reduce',
    });
    const page = await context.newPage();
    await login(page, ADMIN_EMAIL, ADMIN_PASSWORD);
    await page.waitForURL(`${FRONTEND}/`, { timeout: 30000 });

    console.log(`\naudit @ ${viewport} ${vp.width}×${vp.height} — ${routes.length} route(s)\n`);
    console.log('route                           overflow   worst offenders / small targets');
    const results = [];
    for (const r of routes) {
      const row = { route: r.path, name: r.name };
      try {
        await page.goto(`${FRONTEND}${r.path}`);
        if (new URL(page.url()).pathname === '/login') {
          await login(page, ADMIN_EMAIL, ADMIN_PASSWORD);
          await page.waitForURL(`${FRONTEND}/`, { timeout: 30000 });
          await page.goto(`${FRONTEND}${r.path}`);
        }
        await settle(page);
        Object.assign(row, await page.evaluate(auditInPage));
        const off = row.offenders
          .slice(0, 3)
          .map((o) => `${o.el}(${o.w}w)`)
          .join(' ');
        const small = row.small
          .slice(0, 2)
          .map((s) => `${s.sig} ${s.size}×${s.n}`)
          .join(' ');
        console.log(
          `${r.path.padEnd(30)} ${String(row.overflow).padStart(5)}px   ${off || '—'}${small ? '  ‖ ' + small : ''}`,
        );
      } catch (e) {
        row.error = e?.message?.split('\n')[0] ?? String(e);
        console.log(`${r.path.padEnd(30)}   ERROR   ${row.error}`);
      }
      results.push(row);
    }
    const day = new Date().toISOString().slice(0, 10);
    const outDir = path.join(ROOT, '..', 'screenshots', day);
    mkdirSync(outDir, { recursive: true });
    const outFile = path.join(outDir, `audit-${viewport}.json`);
    writeFileSync(
      outFile,
      JSON.stringify({ viewport, vp, when: new Date().toISOString(), results }, null, 2),
    );
    console.log(`\nJSON: screenshots/${day}/audit-${viewport}.json`);
  } finally {
    await browser?.close().catch(() => undefined);
    kill();
  }
}

main().catch((e) => {
  console.error(e.message);
  process.exit(1);
});

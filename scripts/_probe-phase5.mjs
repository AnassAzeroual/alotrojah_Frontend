// TEMP Phase-5 probe. Boots like audit-responsive (verify DB backend :8002 +
// shots frontend :4202), logs in, then drives the data-entry pages that the
// audit route set cannot reach without picks:
//   /entry      -> pick group/week/session, check the phone card reflow
//   /exams/weekly -> pick a group, check the phone card reflow
// plus a tablet spot-check that both keep their grid/table layouts (scroll
// inside .table-wrap / .table-scroll, no page overflow). Read-only; delete
// after the Phase-5 work lands.
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
const ROOT = path.dirname(fileURLToPath(import.meta.url));
const OUT = path.join(
  ROOT,
  '..',
  'screenshots',
  new Date().toISOString().slice(0, 10),
  'verification',
);

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
    } catch {}
    await new Promise((r) => setTimeout(r, 2000));
  }
  throw new Error(`${label} never came up: ${url}`);
}

async function stableFill(locator, value) {
  for (let i = 0; i < 3; i++) {
    await locator.fill(value);
    try {
      await expect(locator).toHaveValue(value, { timeout: 2000 });
      return;
    } catch {}
  }
  await expect(locator).toHaveValue(value);
}

async function login(page) {
  await stableFill(page.getByTestId('auth-email'), 'admin@example.org');
  await stableFill(page.getByTestId('auth-password'), 'password123');
  await page.getByTestId('auth-submit').click();
  await page.waitForURL(`${FRONTEND}/`, { timeout: 30000 });
}

/** Open the nth dropdown inside the page toolbar and click option `idx`. */
async function pickOption(page, dd, idx) {
  await dd.locator('.dd-btn').click();
  await page.waitForTimeout(350);
  const opts = page.locator('.dd.open .dd-list button');
  const n = await opts.count();
  if (idx >= n) throw new Error(`pickOption ${idx} >= ${n} options`);
  await opts.nth(idx).click();
  await page.waitForTimeout(900);
}

async function optionCount(page, dd) {
  await dd.locator('.dd-btn').click();
  await page.waitForTimeout(350);
  const list = page.locator('.dd.open .dd-list button');
  const n = await list.count();
  const labels = await list.allInnerTexts();
  await page.keyboard.press('Escape');
  await page.waitForTimeout(350);
  return { n, labels: labels.map((s) => s.trim().slice(0, 24)) };
}

const results = [];
function check(label, pass, detail) {
  results.push({ label, pass, detail });
  console.log(`${pass ? 'PASS' : 'FAIL'}  ${label}${detail ? ` — ${detail}` : ''}`);
}

function measureEntry() {
  const etable = document.querySelector('.etable');
  const ehead = document.querySelector('.erow.ehead');
  const line = document.querySelector('.erow.line');
  const cell = document.querySelector('.ecell[data-label]');
  const pupil = document.querySelector('.ecell.pupil');
  const scroll = document.querySelector('.table-scroll');
  const before = cell ? getComputedStyle(cell, '::before') : null;
  const r = (el) => (el ? Math.round(el.getBoundingClientRect().width) : null);
  const heights = [
    ...document.querySelectorAll('.erow.line .ecell input, .erow.line .ecell .dd-btn'),
  ]
    .slice(0, 12)
    .map((el) => Math.round(el.getBoundingClientRect().height));
  return {
    vw: window.innerWidth,
    docSW: document.documentElement.scrollWidth,
    rows: document.querySelectorAll('.erow.line').length,
    etableW: r(etable),
    etableMinWidth: etable ? getComputedStyle(etable).minWidth : null,
    eheadDisplay: ehead ? getComputedStyle(ehead).display : null,
    lineDisplay: line ? getComputedStyle(line).display : null,
    lineFlexDir: line ? getComputedStyle(line).flexDirection : null,
    labelCells: document.querySelectorAll('.ecell[data-label]').length,
    beforeContent: before ? String(before.content).slice(0, 40) : null,
    beforeDisplay: before ? before.display : null,
    pupilPosition: pupil ? getComputedStyle(pupil).position : null,
    scrollOverflowX: scroll ? getComputedStyle(scroll).overflowX : null,
    controlHeights: heights,
  };
}

function measureWeekly() {
  const thead = document.querySelector('.table-wrap thead');
  const row = document.querySelector('.table-wrap tbody tr');
  const cell = document.querySelector('.table-wrap tbody td[data-label]');
  const before = cell ? getComputedStyle(cell, '::before') : null;
  return {
    vw: window.innerWidth,
    docSW: document.documentElement.scrollWidth,
    rows: document.querySelectorAll('.table-wrap tbody tr').length,
    theadDisplay: thead ? getComputedStyle(thead).display : null,
    rowDisplay: row ? getComputedStyle(row).display : null,
    labelCells: document.querySelectorAll('.table-wrap tbody td[data-label]').length,
    beforeContent: before ? String(before.content).slice(0, 60) : null,
    empty: !!document.querySelector('app-empty-state'),
  };
}

async function main() {
  if (await portBusy(BACKEND_PORT)) throw new Error(`Port ${BACKEND_PORT} busy`);
  if (await portBusy(FRONTEND_PORT)) throw new Error(`Port ${FRONTEND_PORT} busy`);
  mkdirSync(OUT, { recursive: true });
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
  const dump = {};
  try {
    await Promise.all([waitFor(`${BACKEND}/up`, 'backend'), waitFor(`${FRONTEND}/`, 'frontend')]);
    browser = await chromium.launch();
    const context = await browser.newContext({ viewport: { width: 390, height: 844 } });
    const page = await context.newPage();
    page.on('pageerror', (e) => console.log('PAGEERROR', e.message.slice(0, 120)));
    await page.goto(`${FRONTEND}/login`);
    await login(page);

    /* ---------- /entry @ phone ---------- */
    await page.goto(`${FRONTEND}/entry`);
    await page.waitForTimeout(2500);
    const dds = page.locator('.toolbar app-dropdown');
    console.log('entry: dropdown hosts =', await dds.count());
    const g0 = await optionCount(page, dds.nth(0));
    console.log(`entry: groups=${g0.n} [${g0.labels.join(' | ')}]`);
    const groups = Math.min(g0.n, 12);
    let tableShown = false;
    for (let g = 1; g < groups && !tableShown; g++) {
      await pickOption(page, dds.nth(0), g);
      await page.waitForTimeout(1500);
      const weeks = await optionCount(page, dds.nth(1));
      console.log(`entry g#${g}: weeks=${weeks.n} [${weeks.labels.slice(0, 3).join(' | ')}]`);
      if (weeks.n < 2) continue;
      await pickOption(page, dds.nth(1), 1);
      await page.waitForTimeout(1500);
      const sessions = await optionCount(page, dds.nth(2));
      console.log(
        `entry g#${g}: sessions=${sessions.n} [${sessions.labels.slice(0, 3).join(' | ')}]`,
      );
      if (sessions.n < 2) continue;
      await pickOption(page, dds.nth(2), 1);
      await page.waitForTimeout(2500);
      const etableN = await page.locator('.etable').count();
      console.log(
        `entry g#${g}: etable=${etableN} comp=${await page.locator('app-entry-table').count()} empty=${await page.locator('app-empty-state').count()}`,
      );
      tableShown = etableN > 0;
      if (tableShown) console.log(`entry: group option #${g} produced a table`);
    }
    check('entry: a table could be reached via the toolbar', tableShown);
    if (tableShown) {
      const m = await page.evaluate(measureEntry);
      dump.entryPhone = m;
      console.log('\n--- /entry @390 ---');
      console.log(JSON.stringify(m, null, 1));
      await page.screenshot({ path: path.join(OUT, 'phase5-entry-phone.png'), fullPage: true });
      check('entry phone: no page overflow', m.docSW <= m.vw, `docSW=${m.docSW} vw=${m.vw}`);
      check(
        'entry phone: header row hidden',
        m.eheadDisplay === 'none',
        `display=${m.eheadDisplay}`,
      );
      check(
        'entry phone: rows are stacked cards',
        m.lineDisplay === 'flex' && m.lineFlexDir === 'column',
        `display=${m.lineDisplay} dir=${m.lineFlexDir}`,
      );
      check(
        'entry phone: cells carry ::before labels',
        m.labelCells > 0 && m.beforeContent && m.beforeContent !== 'none',
        `cells=${m.labelCells} before=${m.beforeContent}`,
      );
      check(
        'entry phone: pupil column is no longer sticky',
        m.pupilPosition === 'static',
        `position=${m.pupilPosition}`,
      );
      check(
        'entry phone: inputs hold the 44px touch floor',
        m.controlHeights.length > 0 && m.controlHeights.every((h) => h >= 44),
        `heights=${m.controlHeights.join(',')}`,
      );
    }

    /* ---------- /exams/weekly @ phone ---------- */
    await page.goto(`${FRONTEND}/exams/weekly`);
    await page.waitForTimeout(2500);
    // The dropdown component stamps testId on its inner .dd-btn, not the host.
    const wdd = page
      .locator('app-dropdown')
      .filter({ has: page.locator('[data-testid="weekly-group"]') });
    console.log('weekly: filtered dropdown hosts =', await wdd.count());
    const w0 = await optionCount(page, wdd);
    console.log(`weekly: groups=${w0.n} [${w0.labels.join(' | ')}]`);
    const wgroups = Math.min(w0.n, 12);
    let weeklyShown = false;
    for (let g = 0; g < wgroups && !weeklyShown; g++) {
      await pickOption(page, wdd, g);
      await page.waitForTimeout(1800);
      weeklyShown =
        (await page.locator('.table-wrap tbody tr').count()) > 0 ||
        (await page.locator('app-empty-state').count()) === 0;
      if (weeklyShown) console.log(`weekly: group option #${g} produced rows`);
    }
    check('weekly: a table could be reached via the group picker', weeklyShown);
    if (weeklyShown) {
      const m = await page.evaluate(measureWeekly);
      dump.weeklyPhone = m;
      console.log('\n--- /exams/weekly @390 ---');
      console.log(JSON.stringify(m, null, 1));
      await page.screenshot({ path: path.join(OUT, 'phase5-weekly-phone.png'), fullPage: true });
      check('weekly phone: no page overflow', m.docSW <= m.vw, `docSW=${m.docSW} vw=${m.vw}`);
      check(
        'weekly phone: header row hidden',
        m.theadDisplay === 'none',
        `display=${m.theadDisplay}`,
      );
      check(
        'weekly phone: rows are stacked cards',
        m.rowDisplay === 'block',
        `display=${m.rowDisplay}`,
      );
      check(
        'weekly phone: cells carry ::before labels',
        m.labelCells > 0 && m.beforeContent && m.beforeContent !== 'none',
        `cells=${m.labelCells} before=${m.beforeContent}`,
      );
    }

    /* ---------- tablet spot-check: layouts stay grid/table ---------- */
    await page.setViewportSize({ width: 768, height: 1024 });
    await page.goto(`${FRONTEND}/entry`);
    await page.waitForTimeout(1800);
    const ddsT = page.locator('.toolbar app-dropdown');
    const gT0 = await optionCount(page, ddsT.nth(0));
    const groupsT = Math.min(gT0.n, 12);
    let entryTableT = false;
    for (let g = 1; g < groupsT && !entryTableT; g++) {
      await pickOption(page, ddsT.nth(0), g);
      await page.waitForTimeout(1200);
      const weeks = await optionCount(page, ddsT.nth(1));
      if (weeks.n < 2) continue;
      await pickOption(page, ddsT.nth(1), 1);
      await page.waitForTimeout(1200);
      const sessions = await optionCount(page, ddsT.nth(2));
      if (sessions.n < 2) continue;
      await pickOption(page, ddsT.nth(2), 1);
      await page.waitForTimeout(2000);
      entryTableT = (await page.locator('.etable').count()) > 0;
    }
    if (entryTableT) {
      const m = await page.evaluate(measureEntry);
      dump.entryTablet = m;
      console.log('\n--- /entry @768 ---');
      console.log(JSON.stringify(m, null, 1));
      await page.screenshot({ path: path.join(OUT, 'phase5-entry-tablet.png') });
      check('entry tablet: grid layout kept (not cards)', m.eheadDisplay !== 'none');
      check(
        'entry tablet: wide grid scrolls inside .table-scroll',
        m.docSW <= m.vw && m.scrollOverflowX === 'auto',
        `docSW=${m.docSW} overflowX=${m.scrollOverflowX}`,
      );
    } else {
      check('entry tablet: a table could be reached', false);
    }

    writeFileSync(path.join(OUT, 'phase5-probe.json'), JSON.stringify(dump, null, 1));

    const failed = results.filter((r) => !r.pass);
    console.log(`\n=== ${results.length - failed.length}/${results.length} checks passed ===`);
    if (failed.length) process.exitCode = 1;
  } finally {
    await browser?.close().catch(() => undefined);
    kill();
  }
}

main().catch((e) => {
  console.error(e.message);
  process.exit(1);
});

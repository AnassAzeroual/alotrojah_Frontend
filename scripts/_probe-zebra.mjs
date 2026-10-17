// TEMP zebra probe. Boots like audit-responsive (verify DB backend :8002 +
// frontend :4202), logs in, then checks that every phone table surface paints
// the alternating row tint (--color-row-tint):
//   mixin surfaces  /centers /levels /scoring /
//   list-table      /users
//   groups          /groups /groups/1
//   reports         /reports/term /reports/season (needs picks)
// Also samples groups in dark mode. Read-only; delete once the review lands.
import { execSync, spawn } from 'node:child_process';
import { mkdirSync, writeFileSync } from 'node:fs';
import net from 'node:net';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { chromium } from '@playwright/test';

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

async function login(page) {
  await page.goto(`${FRONTEND}/login`);
  await page.getByTestId('auth-email').fill('admin@example.org');
  await page.getByTestId('auth-password').fill('password123');
  await page.getByTestId('auth-submit').click();
  await page.waitForURL(`${FRONTEND}/`, { timeout: 30000 });
}

const results = [];
function check(label, pass, detail) {
  results.push({ label, pass, detail });
  console.log(`${pass ? 'PASS' : 'FAIL'}  ${label}${detail ? ` — ${detail}` : ''}`);
}

const TRANSPARENT = new Set(['rgba(0, 0, 0, 0)', 'transparent']);

function measureRow(selector) {
  const row = document.querySelector(selector);
  if (!row) return null;
  return [...row.children].map((td, i) => ({
    i: i + 1,
    label: td.getAttribute('data-label') || '',
    bg: getComputedStyle(td).backgroundColor,
  }));
}

function measureReports() {
  return [...document.querySelectorAll('.print-sheet .table-wrap')].map((wrap, t) => {
    const rows = [...wrap.querySelectorAll('tr')]
      .filter((tr) => tr.querySelector('td'))
      .map((tr) => ({
        child: [...tr.parentElement.children].indexOf(tr) + 1,
        bg: getComputedStyle(tr.querySelector('td')).backgroundColor,
      }));
    return {
      table: t,
      wrapW: Math.round(wrap.clientWidth),
      tableSW: Math.round(wrap.querySelector('table')?.scrollWidth ?? 0),
      rows,
    };
  });
}

async function gotoStable(page, url, ready) {
  await page.goto(`${FRONTEND}${url}`);
  await page.waitForSelector(ready, { timeout: 30000 });
  await page.waitForTimeout(600);
}

/** Every even cell in the row carries a fill; odd cells stay unfilled. */
function rowZebraPass(cells) {
  if (!cells || cells.length < 2) return { pass: false, detail: 'no row cells' };
  const odd = cells.filter((c) => c.i % 2 === 1);
  const even = cells.filter((c) => c.i % 2 === 0);
  const evenFilled = even.every((c) => !TRANSPARENT.has(c.bg));
  const oddClear = odd.every((c) => TRANSPARENT.has(c.bg));
  return {
    pass: evenFilled && oddClear,
    detail: cells.map((c) => `${c.i}${c.label ? ':' + c.label : ''}=${c.bg}`).join(' | '),
  };
}

async function reportFlow(page, url, query, withTerm) {
  await page.goto(`${FRONTEND}${url}`);
  await page.waitForTimeout(1800);
  const search = page.locator('.card .field.search input');
  await search.fill(query);
  await search.dispatchEvent('change');
  await page.waitForSelector('.card .cluster .pick', { timeout: 30000 });
  await page.locator('.card .cluster .pick').first().click();
  const hasRows = () => page.locator('.print-sheet .table-wrap tr td').count();
  if (!withTerm) {
    for (let i = 0; i < 6; i++) {
      await page.waitForTimeout(1500);
      if ((await hasRows()) > 0) return;
      if (i === 2) {
        // widen the picker if the exact match carried no data
        const picks = page.locator('.card .cluster .pick');
        if ((await picks.count()) > 1) await picks.nth(1).click();
      }
    }
    await page.waitForSelector('.print-sheet', { timeout: 30000 });
    return;
  }
  // Term report: walk the term options until one returns scored rows
  // (verify DB has term data only for term 1 / students 1–7).
  await page.waitForTimeout(900);
  const dd = page.locator('.card app-dropdown').first();
  await dd.locator('.dd-btn').click();
  await page.waitForTimeout(400);
  const optCount = await page.locator('.dd.open .dd-list button').count();
  await page.keyboard.press('Escape');
  await page.waitForTimeout(300);
  for (let i = 1; i < optCount; i++) {
    await dd.locator('.dd-btn').click();
    await page.waitForTimeout(350);
    await page.locator('.dd.open .dd-list button').nth(i).click();
    await page.waitForTimeout(1600);
    if ((await hasRows()) > 0) return;
  }
  await page.waitForSelector('.print-sheet', { timeout: 30000 });
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
    ['/d', '/s', '/c', `npx ng serve --port ${FRONTEND_PORT} --host 127.0.0.1 --configuration shots`],
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
    await page.goto(`${FRONTEND}/`);
    await page.evaluate(() => localStorage.setItem('alotrojah_theme', 'light'));
    await login(page);

    const mixinRoutes = [
      ['dashboard', '/', '.table-wrap tbody tr'],
      ['centers', '/centers', '.centers-table tbody tr'],
      ['levels', '/levels', '.levels-table tbody tr'],
      ['scoring', '/scoring', '.scoring-table tbody tr'],
    ];
    for (const [name, url, ready] of mixinRoutes) {
      await gotoStable(page, url, ready);
      const cells = await page.evaluate(measureRow, ready);
      dump[name] = cells;
      const z = rowZebraPass(cells);
      check(`${name} phone: zebra cells tinted`, z.pass, z.detail);
      await page.screenshot({ path: path.join(OUT, `zebra-${name}-phone.png`), fullPage: true });
    }

    await gotoStable(page, '/users', '.lt-row');
    const userCells = await page.evaluate(measureRow, 'tbody tr.lt-row');
    dump.users = userCells;
    const uz = rowZebraPass(userCells);
    check('users phone: zebra cells tinted', uz.pass, uz.detail);

    await gotoStable(page, '/groups', 'tbody tr.row-link');
    const groupCells = await page.evaluate(measureRow, 'tbody tr.row-link');
    dump.groups = groupCells;
    const gz = rowZebraPass(groupCells);
    check('groups phone: zebra cells tinted', gz.pass, gz.detail);
    await page.screenshot({ path: path.join(OUT, 'zebra-groups-phone.png'), fullPage: true });

    await gotoStable(page, '/groups/1', 'tbody tr.row-link');
    const detailCells = await page.evaluate(measureRow, 'tbody tr.row-link');
    dump.groupDetail = detailCells;
    const dz = rowZebraPass(detailCells);
    check('group detail phone: zebra cells tinted', dz.pass, dz.detail);
    await page.screenshot({
      path: path.join(OUT, 'zebra-group-detail-phone.png'),
      fullPage: true,
    });

    // Student 1 has seeded term/season results in the verify DB; read the
    // exact name from its detail page to drive the report search.
    await gotoStable(page, '/students/1', '.hero h1');
    const reportQuery = (await page.locator('.hero h1').innerText()).trim();
    dump.reportQuery = reportQuery;

    await reportFlow(page, '/reports/term', reportQuery, true);
    const termTables = await page.evaluate(measureReports);
    dump.reportsTerm = termTables;
    const termRows = termTables.flatMap((t) => t.rows);
    const termTinted = termRows.filter((r) => !TRANSPARENT.has(r.bg));
    const termPass = termRows.length > 0 && termTinted.length > 0;
    check(
      'reports/term phone: body rows zebra tinted',
      termPass,
      termTables
        .map((t) => `t${t.table}:${t.rows.map((r) => `#${r.child}=${r.bg}`).join(',')}`)
        .join(' || '),
    );
    const termFit = termTables.every((t) => t.tableSW <= t.wrapW + 1);
    check(
      'reports/term phone: tables fit the width',
      termFit,
      termTables.map((t) => `t${t.table}:${t.tableSW}/${t.wrapW}`).join(' | '),
    );
    await page.screenshot({
      path: path.join(OUT, 'zebra-reports-term-phone.png'),
      fullPage: true,
    });

    await reportFlow(page, '/reports/season', reportQuery, false);
    const seasonTables = await page.evaluate(measureReports);
    dump.reportsSeason = seasonTables;
    const seasonRows = seasonTables.flatMap((t) => t.rows);
    const seasonTinted = seasonRows.filter((r) => !TRANSPARENT.has(r.bg));
    const seasonPass = seasonRows.length > 0 && seasonTinted.length > 0;
    check(
      'reports/season phone: body rows zebra tinted',
      seasonPass,
      seasonTables
        .map((t) => `t${t.table}:${t.rows.map((r) => `#${r.child}=${r.bg}`).join(',')}`)
        .join(' || '),
    );
    const seasonFit = seasonTables.every((t) => t.tableSW <= t.wrapW + 1);
    check(
      'reports/season phone: tables fit the width',
      seasonFit,
      seasonTables.map((t) => `t${t.table}:${t.tableSW}/${t.wrapW}`).join(' | '),
    );
    await page.screenshot({
      path: path.join(OUT, 'zebra-reports-season-phone.png'),
      fullPage: true,
    });

    /* ---------- dark mode spot-check on groups ---------- */
    await page.evaluate(() => localStorage.setItem('alotrojah_theme', 'dark'));
    await page.reload();
    await page.waitForTimeout(1500);
    await gotoStable(page, '/groups', 'tbody tr.row-link');
    dump.groupsDark = await page.evaluate(measureRow, 'tbody tr.row-link');
    const gdz = rowZebraPass(dump.groupsDark);
    check('groups phone dark: zebra cells tinted', gdz.pass, gdz.detail);
    await page.screenshot({ path: path.join(OUT, 'zebra-groups-phone-dark.png'), fullPage: true });
    await page.evaluate(() => localStorage.setItem('alotrojah_theme', 'light'));

    writeFileSync(path.join(OUT, 'zebra-probe.json'), JSON.stringify(dump, null, 1));

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

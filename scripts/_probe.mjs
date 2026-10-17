// TEMP Phase-1 phone verification probe. Boots like audit-responsive (verify
// DB backend :8002 + shots frontend :4202), logs in, then at 390×844:
//   - diagnoses the 26×44 date-chip measurement (span displays + texts)
//   - measures the real topbar height vs the --topbar-h token (61px)
//   - drives the drawer: open → focus, Escape → close + focus return
//   - flips language via the drawer switcher and re-checks RTL overflow
//   - flips theme via the drawer foot and checks the shell class
// Saves screenshots into screenshots/<day>/verification/. Delete after use.
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
  const mail = page.getByTestId('auth-email');
  const pw = page.getByTestId('auth-password');
  const submit = page.getByTestId('auth-submit');
  await page.goto(`${FRONTEND}/login`);
  await stableFill(mail, 'admin@example.org');
  await stableFill(pw, 'password123');
  await submit.click();
}

const results = [];
function check(label, pass, detail) {
  results.push({ label, pass, detail });
  console.log(`${pass ? 'PASS' : 'FAIL'}  ${label}${detail ? ` — ${detail}` : ''}`);
}

function measureChrome() {
  const r = (el) => {
    const b = el.getBoundingClientRect();
    return {
      l: Math.round(b.left),
      r: Math.round(b.right),
      w: Math.round(b.width),
      h: Math.round(b.height),
    };
  };
  const topbar = document.querySelector('.topbar');
  const shell = document.querySelector('.shell');
  const chips = [...document.querySelectorAll('.date-chip')].map((el) => ({
    text: el.textContent.trim(),
    rect: r(el),
    spans: [...el.querySelectorAll('span')].map((s) => ({
      cls: s.className,
      display: getComputedStyle(s).display,
      text: s.textContent.trim().slice(0, 20),
    })),
  }));
  const sb = document.querySelector('aside.sidebar');
  return {
    vw: window.innerWidth,
    docSW: document.documentElement.scrollWidth,
    dir: document.documentElement.dir,
    theme: document.documentElement.getAttribute('data-theme'),
    topbarH: topbar ? Math.round(topbar.getBoundingClientRect().height) : null,
    topbarPadTop: topbar ? getComputedStyle(topbar).paddingTop : null,
    topbarVar: shell ? getComputedStyle(shell).getPropertyValue('--topbar-h').trim() : null,
    chips,
    sidebar: sb
      ? {
          open: sb.classList.contains('open'),
          visibility: getComputedStyle(sb).visibility,
          rect: r(sb),
        }
      : null,
    active: document.activeElement
      ? `${document.activeElement.tagName.toLowerCase()}.${document.activeElement.className}`.slice(
          0,
          60,
        )
      : null,
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
  try {
    await Promise.all([waitFor(`${BACKEND}/up`, 'backend'), waitFor(`${FRONTEND}/`, 'frontend')]);
    browser = await chromium.launch();
    const context = await browser.newContext({ viewport: { width: 390, height: 844 } });
    const page = await context.newPage();
    await login(page);
    await page.waitForURL(`${FRONTEND}/`, { timeout: 30000 });
    // /students is content-clean at 390 (dashboard min-content is a phase-2
    // item — measuring shell chrome against it would always fail).
    await page.goto(`${FRONTEND}/students`);
    await page.waitForTimeout(1500); // clock/chips tick

    // 1 — topbar + chip diagnosis, drawer closed
    let m = await page.evaluate(measureChrome);
    console.log('\n--- chrome @390 (closed, pre-interaction) ---');
    console.log(JSON.stringify(m, null, 1));
    await page.screenshot({
      path: path.join(OUT, 'phone-topbar-closed.png'),
      clip: { x: 0, y: 0, width: 390, height: 110 },
    });
    check(
      'closed sidebar is visibility:hidden',
      m.sidebar?.visibility === 'hidden',
      `visibility=${m.sidebar?.visibility}`,
    );
    check(
      'closed sidebar is not focused/tabbable-reachable',
      m.sidebar?.open === false,
      `open=${m.sidebar?.open}`,
    );
    check('no horizontal overflow (shell chrome)', m.docSW <= m.vw, `docSW=${m.docSW} vw=${m.vw}`);
    check(
      'chips show the short form (visible, >44px wide)',
      m.chips.every(
        (c) =>
          c.spans.some((s) => s.cls.includes('chip-short') && s.display === 'inline') &&
          c.rect.w > 44,
      ),
      m.chips.map((c) => `"${c.text.slice(0, 18)}" ${c.rect.w}px`).join(' | '),
    );
    check(
      'topbar height matches --topbar-h token',
      Math.abs(m.topbarH - parseInt(m.topbarVar, 10)) <= 2,
      `height=${m.topbarH} var=${m.topbarVar}`,
    );

    // 2 — drawer open: visibility, position, focus
    await page.click('.menu-btn');
    await page.waitForTimeout(600);
    m = await page.evaluate(measureChrome);
    console.log('\n--- drawer OPEN (default lang) ---');
    console.log(
      JSON.stringify({ sidebar: m.sidebar, active: m.active, docSW: m.docSW, dir: m.dir }, null, 1),
    );
    await page.screenshot({ path: path.join(OUT, 'phone-drawer-open.png') });
    check(
      'drawer open: .open + visible',
      m.sidebar?.open === true && m.sidebar?.visibility === 'visible',
    );
    check(
      `drawer opens from inline-start (${m.dir})`,
      m.dir === 'rtl'
        ? Math.abs((m.sidebar?.rect.r ?? 0) - m.vw) <= 2
        : Math.abs(m.sidebar?.rect.l ?? -1) <= 2,
      `rect l=${m.sidebar?.rect.l} r=${m.sidebar?.rect.r} vw=${m.vw} dir=${m.dir}`,
    );
    check('focus moved into drawer', (m.active || '').startsWith('aside'), m.active);
    check('no horizontal overflow with drawer open', m.docSW <= m.vw, `docSW=${m.docSW}`);

    // 3 — Escape closes + focus returns to menu button
    await page.keyboard.press('Escape');
    await page.waitForTimeout(600);
    m = await page.evaluate(measureChrome);
    console.log('\n--- after ESCAPE ---');
    console.log(JSON.stringify({ sidebar: m.sidebar, active: m.active }, null, 1));
    check('Escape closed drawer', m.sidebar?.open === false && m.sidebar?.visibility === 'hidden');
    check('focus returned to menu button', (m.active || '').includes('menu-btn'), m.active);

    // 4 — language via drawer switcher → RTL
    await page.click('.menu-btn');
    await page.waitForTimeout(600);
    await page.click('.dd-btn[data-testid="lang-switcher-drawer"]');
    await page.getByRole('button', { name: 'العربية' }).click();
    await page.waitForTimeout(800);
    m = await page.evaluate(measureChrome);
    console.log('\n--- after switching to AR (drawer still open) ---');
    console.log(JSON.stringify({ dir: m.dir, docSW: m.docSW, sidebar: m.sidebar }, null, 1));
    await page.screenshot({ path: path.join(OUT, 'phone-drawer-open-rtl.png') });
    check('document is RTL', m.dir === 'rtl', `dir=${m.dir}`);
    check(
      'drawer open from inline-start (right edge in RTL)',
      m.sidebar?.rect.r >= m.vw - 2,
      `right=${m.sidebar?.rect.r} vw=${m.vw}`,
    );
    check('no overflow in RTL (drawer open)', m.docSW <= m.vw, `docSW=${m.docSW}`);

    // 5 — theme via drawer foot, then Escape close in RTL
    const themeBtn = page.locator('.side-foot button.foot-btn:not([data-testid="nav-logout"])');
    const themeBefore = m.theme;
    await themeBtn.click();
    await page.waitForTimeout(500);
    m = await page.evaluate(measureChrome);
    await page.screenshot({ path: path.join(OUT, 'phone-drawer-open-rtl-dark.png') });
    check(
      'theme flipped from drawer foot',
      m.theme !== themeBefore,
      `${themeBefore} -> ${m.theme}`,
    );
    await page.keyboard.press('Escape');
    await page.waitForTimeout(600);
    m = await page.evaluate(measureChrome);
    console.log('\n--- after plain close (RTL, dark) ---');
    console.log(
      JSON.stringify(
        { sidebar: m.sidebar, active: m.active, docSW: m.docSW, dir: m.dir, theme: m.theme },
        null,
        1,
      ),
    );
    await page.screenshot({
      path: path.join(OUT, 'phone-topbar-rtl-dark.png'),
      clip: { x: 0, y: 0, width: 390, height: 110 },
    });
    check('Escape closed drawer (RTL)', m.sidebar?.open === false);
    check('no overflow in RTL (closed, dark)', m.docSW <= m.vw, `docSW=${m.docSW}`);

    // 6 — a couple of overflow-clean routes for the record
    for (const route of ['/students', '/entry']) {
      await page.goto(`${FRONTEND}${route}`);
      await page.waitForTimeout(1800);
      const rm = await page.evaluate(measureChrome);
      check(`${route} no overflow (RTL, dark)`, rm.docSW <= rm.vw, `docSW=${rm.docSW}`);
    }

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

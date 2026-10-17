// TEMP Phase-3 tablet probe. Boots like audit-responsive (verify DB backend
// :8002 + shots frontend :4202), logs in, then measures the topbar piece by
// piece at 768/1023/1280 in ar (rtl) + a 768 en check. Read-only; delete after
// the tablet topbar work lands.
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
  await page.goto(`${FRONTEND}/login`);
  await stableFill(page.getByTestId('auth-email'), 'admin@example.org');
  await stableFill(page.getByTestId('auth-password'), 'password123');
  await page.getByTestId('auth-submit').click();
}

function measure() {
  const r = (el) => {
    const b = el.getBoundingClientRect();
    return { l: Math.round(b.left), r: Math.round(b.right), w: Math.round(b.width) };
  };
  const disp = (el) => (el ? getComputedStyle(el).display : null);
  const item = (el) =>
    el ? { cls: String(el.className).slice(0, 40), rect: r(el), display: disp(el) } : null;
  const topbar = document.querySelector('.topbar');
  const start = document.querySelector('.top-start');
  const end = document.querySelector('.top-end');
  const chip = (el) =>
    el
      ? {
          text: el.textContent.trim(),
          rect: r(el),
          full: disp(el.querySelector('.chip-full')),
          short: disp(el.querySelector('.chip-short')),
          spanW: Math.round(el.querySelector('span')?.getBoundingClientRect().width ?? 0),
        }
      : null;
  const lang = document.querySelector('.top-end app-language-switcher');
  return {
    vw: window.innerWidth,
    docSW: document.documentElement.scrollWidth,
    dir: document.documentElement.dir,
    topbar: topbar ? { ...r(topbar), scrollW: topbar.scrollWidth } : null,
    start: { ...item(start), scrollW: start?.scrollWidth },
    end: { ...item(end), scrollW: end?.scrollWidth },
    deskBtn: item(document.querySelector('.desk-btn')),
    chips: [...document.querySelectorAll('.clock .date-chip')].map(chip),
    clockSmall: item(document.querySelector('.clock small')),
    theme: item(document.querySelector('.theme-btn')),
    bell: item(document.querySelector('.icon-btn.dot')),
    lang: lang
      ? { rect: r(lang), btn: item(lang.querySelector('.dd-btn')) }
      : null,
    userChip: item(document.querySelector('.user-chip')),
    who: item(document.querySelector('.user-chip .who')),
    avatar: item(document.querySelector('.user-chip .avatar')),
    pad: topbar
      ? `${getComputedStyle(topbar).paddingLeft} / ${getComputedStyle(topbar).paddingRight}`
      : null,
  };
}

const results = [];
const snapshots = [];
function check(label, pass, detail) {
  results.push({ label, pass });
  console.log(`${pass ? 'PASS' : 'FAIL'}  ${label}${detail ? ` — ${detail}` : ''}`);
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
  try {
    await Promise.all([waitFor(`${BACKEND}/up`, 'backend'), waitFor(`${FRONTEND}/`, 'frontend')]);
    browser = await chromium.launch();
    const context = await browser.newContext({ viewport: { width: 768, height: 1024 } });
    const page = await context.newPage();
    await login(page);
    await page.waitForURL(`${FRONTEND}/`, { timeout: 30000 });
    await page.goto(`${FRONTEND}/students`); // content-clean at all widths
    await page.waitForTimeout(1500);

    for (const vp of [
      { width: 768, height: 1024 },
      { width: 900, height: 1024 },
      { width: 1023, height: 768 },
      { width: 1280, height: 800 },
    ]) {
      await page.setViewportSize(vp);
      await page.waitForTimeout(700);
      const m = await page.evaluate(measure);
      console.log(
        `SUMMARY ${vp.width}: docSW=${m.docSW} vw=${m.vw} over=${m.docSW - m.vw} topbarScrollW=${m.topbar?.scrollW} start=${m.start?.w} end=${m.end?.w}`,
      );
      console.log(`\n=== ${vp.width}×${vp.height} (ar/rtl) ===`);
      console.log(JSON.stringify(m, null, 1));
      snapshots.push({ vp: `${vp.width}x${vp.height}-ar`, m });
      check(
        `${vp.width}: topbar fits`,
        m.docSW <= m.vw,
        `docSW=${m.docSW} vw=${m.vw} topbarScrollW=${m.topbar?.scrollW}`,
      );
      await page.screenshot({
        path: path.join(OUT, `tablet-topbar-${vp.width}.png`),
        clip: { x: 0, y: 0, width: Math.min(vp.width, 1280), height: 120 },
      });
    }

    // en swap at 768 (shortest dates, longest navbar names? verify)
    await page.setViewportSize({ width: 768, height: 1024 });
    await page.locator('.top-end .dd-btn').click();
    await page.getByRole('button', { name: 'English' }).click();
    await page.waitForTimeout(800);
    const mEn = await page.evaluate(measure);
    console.log(
      `SUMMARY 768-en: docSW=${mEn.docSW} vw=${mEn.vw} over=${mEn.docSW - mEn.vw} topbarScrollW=${mEn.topbar?.scrollW} start=${mEn.start?.w} end=${mEn.end?.w}`,
    );
    console.log('\n=== 768×1024 (en/ltr) ===');
    console.log(JSON.stringify(mEn, null, 1));
    snapshots.push({ vp: '768x1024-en', m: mEn });
    check('768 en: topbar fits', mEn.docSW <= mEn.vw, `docSW=${mEn.docSW}`);
    await page.screenshot({
      path: path.join(OUT, 'tablet-topbar-768-en.png'),
      clip: { x: 0, y: 0, width: 768, height: 120 },
    });

    writeFileSync(path.join(OUT, 'tablet-probe.json'), JSON.stringify(snapshots, null, 1));

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

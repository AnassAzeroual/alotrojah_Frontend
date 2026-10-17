// Auth-page baseline shots — login/register at phone/tablet/desktop, both
// themes. shots.mjs logs in first (auth pages would redirect), so this small
// companion boots the same servers and captures the two PUBLIC pages plus
// their horizontal-overflow numbers. Throwaway for phase 0/1; delete with
// audit-responsive.mjs once the responsive redesign lands.
// Usage: node scripts/_auth-baseline.mjs
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
const VIEWPORTS = {
  phone: { width: 390, height: 844 },
  tablet: { width: 768, height: 1024 },
  desktop: { width: 1440, height: 900 },
};
const PAGES = [
  { path: '/login', name: 'login' },
  { path: '/register', name: 'register' },
];
const ROOT = path.dirname(fileURLToPath(import.meta.url));

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

async function main() {
  const spawned = [];
  const backendDir = path.join(ROOT, '..', '..', 'alotrojah_Backend');
  if (await portBusy(BACKEND_PORT))
    throw new Error(`Port ${BACKEND_PORT} busy — refusing to drive an unknown server.`);
  if (await portBusy(FRONTEND_PORT))
    throw new Error(`Port ${FRONTEND_PORT} busy — refusing to reuse an unknown frontend.`);
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
    const day = new Date().toISOString().slice(0, 10);
    const outDir = path.join(ROOT, '..', 'screenshots', day, 'auth');
    mkdirSync(outDir, { recursive: true });
    const rows = [];
    for (const [name, vp] of Object.entries(VIEWPORTS)) {
      const context = await browser.newContext({ viewport: vp, reducedMotion: 'reduce' });
      const page = await context.newPage();
      await page.goto(`${FRONTEND}/login`);
      for (const theme of ['dark', 'light']) {
        await page.evaluate((t) => localStorage.setItem('alotrojah_theme', t), theme);
        await page.reload();
        await expect(page.locator('html')).toHaveAttribute('data-theme', theme, { timeout: 30000 });
        for (const p of PAGES) {
          await page.goto(`${FRONTEND}${p.path}`);
          // Lighter settle than shots.mjs — auth pages are static; this is a
          // baseline record, not a design deliverable.
          await page.waitForTimeout(1200);
          const overflow = await page.evaluate(() => {
            const doc = document.documentElement;
            return {
              vw: window.innerWidth,
              scrollW: Math.max(doc.scrollWidth, document.body.scrollWidth),
            };
          });
          const file = path.join(outDir, `${name}-${p.name}-${theme}.png`);
          const tmp = `${file}.tmp`;
          const buf = await page.screenshot({ fullPage: true });
          writeFileSync(tmp, buf);
          renameSync(tmp, file);
          rmSync(tmp, { force: true });
          const ov = overflow.scrollW - overflow.vw;
          console.log(
            `shot: screenshots/${day}/auth/${name}-${p.name}-${theme}.png (${(buf.length / 1024).toFixed(0)} KB) overflow=${ov}px`,
          );
          rows.push({ viewport: name, page: p.path, theme, overflow: ov });
        }
      }
      await context.close();
    }
    writeFileSync(
      path.join(outDir, 'overflow.json'),
      JSON.stringify({ when: new Date().toISOString(), rows }, null, 2),
    );
  } finally {
    await browser?.close().catch(() => undefined);
    kill();
  }
}

main().catch((e) => {
  console.error(e.message);
  process.exit(1);
});

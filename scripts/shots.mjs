// Daily design screenshots — NOT part of the e2e suite (testDir never picks
// up scripts/). One command: `npm run shots`. Boots its OWN backend (verify
// DB via env, never dev) + frontend, refuses to run if :8002/:4202 are busy
// (a foreign server there means "hands off"), captures the key pages in both
// themes, then tears everything down. Read-only: login POST is the only write.
import { execSync, spawn } from 'node:child_process';
import { mkdirSync } from 'node:fs';
import net from 'node:net';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { chromium, expect } from '@playwright/test';

const BACKEND = 'http://127.0.0.1:8002';
const FRONTEND = 'http://127.0.0.1:4202';
const PAGES = [
  { path: '/', name: 'dashboard', ready: 'الطلاب' },
  { path: '/students', name: 'students', ready: 'بدون حلقة' },
  { path: '/centers', name: 'centers', ready: 'تعديل' },
  { path: '/scoring', name: 'scoring', ready: 'المجموع الأسبوعي' },
  { path: '/levels', name: 'levels', ready: 'المستويات' },
];

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
  if (await portBusy(8002))
    throw new Error(
      'Port 8002 busy — refusing to drive an unknown server. Kill node first, then retry.',
    );
  if (await portBusy(4202))
    throw new Error(
      'Port 4202 busy — refusing to reuse an unknown frontend. Kill node first, then retry.',
    );

  const backendDir = path.join(
    path.dirname(fileURLToPath(import.meta.url)),
    '..',
    '..',
    'alotrojah_Backend',
  );
  // NOTE: no `shell: true` with arg arrays (DEP0190 + it orphans servers on
  // win32). php spawns directly; ng goes through one cmd string so the tree
  // kill below still reaps everything and ports are free next run.
  const api = spawn('php', ['artisan', 'serve', '--host=127.0.0.1', '--port=8002'], {
    cwd: backendDir,
    env: {
      ...process.env,
      DB_DATABASE: 'alotrojah_verify',
      FRONTEND_URLS: 'http://127.0.0.1:4202',
    },
    stdio: 'ignore',
  });
  const web = spawn(
    'cmd.exe',
    ['/d', '/s', '/c', 'npx ng serve --port 4202 --host 127.0.0.1 --configuration shots'],
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

  try {
    await waitFor(`${BACKEND}/up`, 'backend');
    await waitFor(`${FRONTEND}/`, 'frontend');

    const day = new Date().toISOString().slice(0, 10);
    const outDir = path.join(
      path.dirname(fileURLToPath(import.meta.url)),
      '..',
      'screenshots',
      day,
    );
    mkdirSync(outDir, { recursive: true });

    const browser = await chromium.launch();
    const page = await browser.newPage({
      viewport: { width: 1440, height: 900 },
      reducedMotion: 'reduce',
    });
    await page.goto(`${FRONTEND}/login`);
    await page.getByTestId('auth-email').fill('admin@example.org');
    await page.getByTestId('auth-password').fill('password123');
    await page.getByTestId('auth-submit').click();
    await page.waitForURL(`${FRONTEND}/`, { timeout: 30000 });

    for (const theme of ['dark', 'light']) {
      // Deterministic theme (never a UI toggle race): the service boots its
      // signal from localStorage, so seed + reload, then prove data-theme.
      await page.evaluate((t) => localStorage.setItem('alotrojah_theme', t), theme);
      await page.reload();
      await expect(page.locator('html')).toHaveAttribute('data-theme', theme, {
        timeout: 30000,
      });
      for (const [i, p] of PAGES.entries()) {
        await page.goto(`${FRONTEND}${p.path}`);
        await page.getByText(p.ready, { exact: false }).first().waitFor({ timeout: 30000 });
        // Let layout settle (fonts, charts, late rows) before capturing.
        await page.waitForTimeout(3000);
        const n = `${String(i).padStart(2, '0')}-${p.name}-${theme}.png`;
        await page.screenshot({ path: path.join(outDir, n), fullPage: true });
        console.log(`shot: screenshots/${day}/${n}`);
      }
    }
    await browser.close();
  } finally {
    kill();
  }
}

main().catch((e) => {
  console.error(e.message);
  process.exit(1);
});

import { defineConfig } from '@playwright/test';

const PHP =
  'C:\\Users\\devtips\\AppData\\Local\\Microsoft\\WinGet\\Packages\\PHP.PHP.8.4_Microsoft.Winget.Source_8wekyb3d8bbwe\\php.exe';
const NG = 'C:\\Users\\devtips\\AppData\\Local\\Author Software\\nvm\\installs\\v24.21.0\\ng.cmd';
// Watch modes (menu modes 2/3) ask for a maximized run browser.
const MAXIMIZED = process.env.E2E_MAXIMIZED === '1';

export default defineConfig({
  testDir: './e2e',
  testMatch: '**/*.e2e.ts',
  workers: 1,
  timeout: 60000,
  use: {
    baseURL: 'http://127.0.0.1:4201',
    trace: 'retain-on-failure',
    // Maximized watch modes: scripts/e2e-menu.ps1 exports E2E_MAXIMIZED=1 for
    // headed/UI runs (cleared otherwise). viewport:null lets the page fill the
    // whole window; unset keeps Playwright's default 1280x720 viewport, so
    // headless/CI runs are unchanged.
    ...(MAXIMIZED ? { viewport: null } : {}),
    // Watchable clicks for the menu's headed mode: the Playwright CLI has no
    // --slow-mo flag, so scripts/e2e-menu.ps1 exports E2E_SLOW_MO=500 instead
    // (it clears the variable for headless/UI runs). Unset -> 0 = no delay.
    launchOptions: {
      slowMo: Number.parseInt(process.env.E2E_SLOW_MO ?? '', 10) || 0,
      ...(MAXIMIZED ? { args: ['--start-maximized'] } : {}),
    },
    // Disables the ApiClient GET cache in every e2e context (delta-count
    // assertions are stale-cache-sensitive). Key literal must stay in sync
    // with E2E_CACHE_BYPASS_KEY in src/app/core/api/api-client.ts — the config
    // can't import it (Angular deps).
    // Also suppresses the first-run setup guide auto-open: it is a real
    // first-login modal and would otherwise cover every admin flow on the
    // shared verify DB (whose setup is intentionally incomplete).
    storageState: {
      cookies: [],
      origins: [
        {
          origin: 'http://127.0.0.1:4201',
          localStorage: [
            { name: 'alotrojah_e2e_no_http_cache', value: '1' },
            { name: 'alotrojah_e2e_no_setup_guide', value: '1' },
          ],
        },
      ],
    },
  },
  webServer: [
    {
      command: `"${PHP}" artisan serve --host=127.0.0.1 --port=8000`,
      cwd: 'C:\\Users\\devtips\\Documents\\AlOtrojah\\alotrojah_Backend',
      url: 'http://127.0.0.1:8000/up',
      reuseExistingServer: true,
      timeout: 60000,
      // NOTE: DB routing lives in scripts/run-e2e.ps1 (.env swap, verified by
      // a pre-run check). Do NOT rely on webServer.env here: a reused server
      // keeps the DB it booted with, which once wrote e2e rows into dev.
    },
    {
      command: `"${NG}" serve --port 4201 --host 127.0.0.1`,
      url: 'http://127.0.0.1:4201/',
      reuseExistingServer: true,
      timeout: 180000,
    },
  ],
});

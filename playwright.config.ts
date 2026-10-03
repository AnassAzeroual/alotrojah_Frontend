import { defineConfig } from '@playwright/test';

const PHP =
  'C:\\Users\\devtips\\AppData\\Local\\Microsoft\\WinGet\\Packages\\PHP.PHP.8.4_Microsoft.Winget.Source_8wekyb3d8bbwe\\php.exe';
const NG = 'C:\\Users\\devtips\\AppData\\Local\\Author Software\\nvm\\installs\\v24.21.0\\ng.cmd';

export default defineConfig({
  testDir: './e2e',
  testMatch: '**/*.e2e.ts',
  workers: 1,
  timeout: 60000,
  use: {
    baseURL: 'http://127.0.0.1:4201',
    trace: 'retain-on-failure',
  },
  webServer: [
    {
      command: `"${PHP}" artisan serve --host=127.0.0.1 --port=8000`,
      cwd: 'C:\\Users\\devtips\\Documents\\AlOtrojah\\alotrojah_Backend',
      url: 'http://127.0.0.1:8000/up',
      reuseExistingServer: true,
      timeout: 60000,
    },
    {
      command: `"${NG}" serve --port 4201 --host 127.0.0.1`,
      url: 'http://127.0.0.1:4201/',
      reuseExistingServer: true,
      timeout: 180000,
    },
  ],
});

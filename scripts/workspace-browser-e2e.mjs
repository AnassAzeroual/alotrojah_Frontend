/**
 * Real-browser smoke for the unified workspace + timeline.
 * Requires the local frontend (:4200) and API (:8001) plus the seeded admin.
 *
 * Run: node scripts/workspace-browser-e2e.mjs
 */
import { chromium } from 'playwright';

const BASE = process.env.APP_BASE ?? 'http://localhost:4200';
let failures = 0;
const ok = (name, condition, detail = '') => {
  console.log(`${condition ? 'PASS' : 'FAIL'} ${name}${detail ? ` — ${detail}` : ''}`);
  if (!condition) failures++;
};

const browser = await chromium.launch({
  executablePath: 'C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe',
  headless: true,
});
const page = await browser.newPage({ viewport: { width: 1440, height: 1000 } });
const consoleErrors = [];
page.on('console', (m) => {
  if (m.type() === 'error') consoleErrors.push(m.text());
});

await page.goto(`${BASE}/login`, { waitUntil: 'networkidle' });
await page.locator('[data-testid="auth-email"]').fill('admin@example.org');
await page.locator('[data-testid="auth-password"]').fill('password123');
await page.locator('[data-testid="auth-submit"]').click();
await page.waitForTimeout(1200);
const close = page.locator('[data-testid="setup-guide-close"]');
if (await close.count()) await close.click();

await page.goto(`${BASE}/entry`, { waitUntil: 'networkidle' });
await page.waitForTimeout(1200);
ok('workspace renders', (await page.locator('.workspace-page').count()) === 1);
ok('workspace has student rows', (await page.locator('.student-row').count()) > 0);
ok('workspace has score fields', (await page.locator('.module-field').count()) >= 5);
ok('workspace has save action', (await page.locator('.save-bar button').count()) === 1);

const firstScore = page.locator('.module-field input').first();
const scoreValue = await firstScore.inputValue();
await firstScore.fill(scoreValue);
await page.locator('.save-bar button').click();
await page.waitForTimeout(900);
ok('successful save shows confirmation', (await page.locator('.saved-label').count()) === 1);

await page.locator('.notes-btn').first().click();
await page.waitForTimeout(350);
ok('note drawer opens', (await page.locator('.note-drawer').count()) === 1);
ok('note visibility controls render', (await page.locator('.visibility-row').count()) >= 1);
await page.locator('.note-foot button').click();

await page.locator('.add-session').click();
await page.waitForTimeout(350);
ok('add-session dialog opens', (await page.locator('.add-dialog').count()) === 1);
await page.locator('.add-dialog .icon-close').click();

await page.locator('.timeline-link').first().click();
await page.waitForTimeout(900);
ok('timeline route opens', /\/students\/\d+\/timeline$/.test(page.url()), page.url());
ok('timeline hero renders', (await page.locator('.timeline-hero').count()) === 1);
ok('timeline roadmap renders terms', (await page.locator('.term-block').count()) > 0);
ok('timeline opens one week', (await page.locator('.session-card').count()) > 0);

await page.goto(`${BASE}/students/999999/timeline`, { waitUntil: 'networkidle' });
await page.waitForTimeout(700);
ok(
  'timeline shows load error instead of no-data',
  (await page.locator('.timeline-error').count()) === 1,
);

await page.goto(`${BASE}/reviews`, { waitUntil: 'networkidle' });
await page.waitForTimeout(400);
ok('old /reviews redirects to /entry', /\/entry$/.test(page.url()), page.url());

await page.setViewportSize({ width: 390, height: 844 });
await page.goto(`${BASE}/entry`, { waitUntil: 'networkidle' });
await page.waitForTimeout(900);
const overflow = await page.evaluate(
  () => document.documentElement.scrollWidth - window.innerWidth,
);
ok('workspace mobile has no horizontal overflow', overflow <= 0, `${overflow}px`);

await page.screenshot({
  path: 'C:\\Users\\devtips\\Documents\\AlOtrojah\\workspace-browser-e2e.png',
  fullPage: true,
});
const unexpectedErrors = consoleErrors.filter((line) => !line.includes('status of 404'));
ok(
  'no unexpected browser console errors',
  unexpectedErrors.length === 0,
  unexpectedErrors.slice(0, 2).join(' | '),
);

await browser.close();
console.log(
  failures === 0
    ? '\nWORKSPACE BROWSER E2E: ALL PASS'
    : `\nWORKSPACE BROWSER E2E: ${failures} FAILURE(S)`,
);
process.exit(failures === 0 ? 0 : 1);

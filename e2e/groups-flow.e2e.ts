import { expect, test } from '@playwright/test';
import type { Page } from '@playwright/test';

/**
 * Groups overview → detail drill-down, dark mode, and locale switch
 * on seeded dev data, plus the create-group flow (writes one group per
 * run — collection counts are asserted as floors, never exact).
 * Backend + frontend are started by playwright.config webServer.
 */

async function login(page: Page): Promise<void> {
  await page.goto('/login');
  await page.getByLabel('البريد الإلكتروني', { exact: true }).fill('admin@example.org');
  await page.getByLabel('كلمة المرور', { exact: true }).fill('password123');
  await page.getByRole('button', { name: /دخول/ }).click();
  await expect(page).toHaveURL(/^http:\/\/127\.0\.0\.1:4201\/$/);
}

test('admin drills into a group, then flips theme and locale', async ({ page }) => {
  await login(page);

  // overview: KPI strip + table (5 seeded groups + any e2e-created ones)
  await page.getByRole('link', { name: /الحلقات/ }).click();
  await expect(page).toHaveURL(/\/groups$/);
  await expect(page.locator('.kpi')).toHaveCount(5);
  const rows = page.locator('tbody tr.row-link');
  await expect.poll(async () => rows.count()).toBeGreaterThanOrEqual(5);
  await expect(page.locator('canvas').first()).toBeVisible();

  // search narrows the table (the input binds `change` → commit with blur)
  const search = page.locator('.toolbar input[type="search"]');
  await search.fill('L3');
  await search.blur();
  await expect(page.locator('tbody tr.row-link')).toHaveCount(1);
  await search.fill('');
  await search.blur();
  await expect.poll(async () => rows.count()).toBeGreaterThanOrEqual(5);

  // expand the first row (expandable detail strip)
  await page.locator('tbody .expander').first().click();
  await expect(page.locator('tr.detail-row')).toBeVisible();

  // row click drills into the detail page
  await page.locator('tbody tr.row-link').first().click();
  await expect(page).toHaveURL(/\/groups\/\d+$/);
  await expect(page.locator('.teacher-card')).toBeVisible();
  await expect(page.locator('.table-wrap tbody tr.row-link').first()).toBeVisible();

  // back returns to the overview
  await page.locator('.back-btn').click();
  await expect(page).toHaveURL(/\/groups$/);

  // dark mode: theme attr flips and the KPI strip stays readable
  await page.getByRole('button', { name: 'المظهر', exact: true }).first().click();
  await expect(page.locator('html')).toHaveAttribute('data-theme', 'dark');
  await expect(page.locator('.kpi').first()).toBeVisible();

  // French: direction flips to LTR and the heading translates
  await page.locator('app-language-switcher .dd-btn').click();
  await page.getByRole('option', { name: 'Français' }).click();
  await expect(page.locator('html')).toHaveAttribute('dir', 'ltr');
  await expect(page.getByRole('heading', { name: 'Cercles' })).toBeVisible();
  await expect(page.locator('.kpi')).toHaveCount(5);
});

test('admin creates a group and finds it in the overview', async ({ page }) => {
  await login(page);

  await page.getByRole('link', { name: /الحلقات/ }).click();
  await expect(page).toHaveURL(/\/groups$/);

  await page.getByRole('link', { name: /إضافة مجموعة/ }).click();
  await expect(page).toHaveURL(/\/groups\/new$/);

  const stamp = Date.now();
  const name = `E2E Group ${stamp}`;
  await page.getByLabel('الحلقة', { exact: true }).fill(name);

  // admin picks the center; the teacher picker then lists that center only
  await page.getByRole('button', { name: 'المركز', exact: true }).click();
  await page.getByRole('option', { name: 'مركز النور القرآني' }).click();

  await page.getByRole('button', { name: 'المعلم', exact: true }).click();
  await expect(page.getByRole('option', { name: 'محفظ النور أ' })).toBeVisible();
  await expect(page.getByRole('option', { name: 'محفظ الفرقان' })).toHaveCount(0);
  await page.getByRole('option', { name: 'بدون معلم' }).click(); // keep it teacherless + close

  await page.getByRole('button', { name: 'المستوى', exact: true }).click();
  await page.getByRole('option', { name: /المستوى الأول/ }).click();

  await page.getByLabel('الطاقة', { exact: true }).fill('15');
  await page.locator('.day-pick .day-chip', { hasText: 'الجمعة' }).click();

  await page.getByRole('button', { name: /حفظ/ }).click();

  await expect(page).toHaveURL(/\/groups$/);
  const search = page.locator('.toolbar input[type="search"]');
  await search.fill(String(stamp));
  await search.blur();
  await expect(page.locator('tbody tr.row-link')).toHaveCount(1);
  await expect(page.locator('tbody tr.row-link').first()).toContainText(name);
});

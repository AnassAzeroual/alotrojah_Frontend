import { expect, test } from '@playwright/test';
import type { Page } from '@playwright/test';

/**
 * Groups overview → detail drill-down, dark mode, and locale switch
 * on seeded dev data. READ-ONLY (no writes, no cleanup).
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

  // overview: KPI strip + table over the 5 seeded groups
  await page.getByRole('link', { name: /الحلقات/ }).click();
  await expect(page).toHaveURL(/\/groups$/);
  await expect(page.locator('.kpi')).toHaveCount(5);
  await expect(page.locator('tbody tr.row-link')).toHaveCount(5);
  await expect(page.locator('canvas').first()).toBeVisible();

  // search narrows the table (the input binds `change` → commit with blur)
  const search = page.locator('.toolbar input[type="search"]');
  await search.fill('L3');
  await search.blur();
  await expect(page.locator('tbody tr.row-link')).toHaveCount(1);
  await search.fill('');
  await search.blur();
  await expect(page.locator('tbody tr.row-link')).toHaveCount(5);

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

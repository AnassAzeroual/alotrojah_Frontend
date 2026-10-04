import { expect, test } from '@playwright/test';
import type { Page } from '@playwright/test';
import { apiNames, apiToken } from './api';

/**
 * Groups overview → detail drill-down, dark mode, and locale switch
 * on seeded dev data, plus the create-group flow (writes one group per
 * run — collection counts are asserted as floors, never exact).
 * Backend + frontend are started by playwright.config webServer.
 */

async function login(page: Page): Promise<void> {
  await page.goto('/login');
  await page.getByTestId('auth-email').fill('admin@example.org');
  await page.getByTestId('auth-password').fill('password123');
  await page.getByTestId('auth-submit').click();
  await expect(page).toHaveURL(/^http:\/\/127\.0\.0\.1:4201\/$/);
}

test('admin drills into a group, then flips theme and locale', async ({ page }) => {
  await login(page);

  // overview: KPI strip + table (5 seeded groups + any e2e-created ones)
  await page.getByTestId('nav-groups').click();
  await expect(page).toHaveURL(/\/groups$/);
  await expect(page.locator('.kpi')).toHaveCount(5);
  const rows = page.locator('tbody tr.row-link');
  await expect.poll(async () => rows.count()).toBeGreaterThanOrEqual(5);
  await expect(page.locator('canvas').first()).toBeVisible();

  // search narrows the table (the input binds `change` → commit with blur)
  const search = page.getByTestId('groups-search');
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
  await page.getByTestId('nav-theme').click();
  await expect(page.locator('html')).toHaveAttribute('data-theme', 'dark');
  await expect(page.locator('.kpi').first()).toBeVisible();

  // French: direction flips to LTR and the heading translates
  await page.getByTestId('lang-switcher').click();
  await page.getByRole('option', { name: 'Français' }).click();
  await expect(page.locator('html')).toHaveAttribute('dir', 'ltr');
  await expect(page.getByRole('heading', { name: 'Cercles' })).toBeVisible();
  await expect(page.locator('.kpi')).toHaveCount(5);
});

test('admin creates a group and finds it in the overview', async ({ page, request }) => {
  await login(page);

  // seed teacher names, looked up at runtime (immune to renames/re-seeds)
  const token = await apiToken(request);
  const center1 = await apiNames(request, token, '/users?role=teacher&center_id=1');
  const center2 = await apiNames(request, token, '/users?role=teacher&center_id=2');
  expect(center1.length).toBeGreaterThan(0);
  expect(center2.length).toBeGreaterThan(0);

  await page.getByTestId('nav-groups').click();
  await expect(page).toHaveURL(/\/groups$/);

  await page.getByTestId('groups-new').click();
  await expect(page).toHaveURL(/\/groups\/new$/);

  const stamp = Date.now();
  const name = `E2E Group ${stamp}`;
  await page.getByTestId('group-name').fill(name);

  // admin picks the center; the teacher picker then lists that center only
  await page.getByTestId('group-center').click();
  await page.getByRole('option', { name: 'مركز النور القرآني' }).click();

  await page.getByTestId('group-teacher').click();
  await expect(page.getByRole('option', { name: center1[0] })).toBeVisible();
  await expect(page.getByRole('option', { name: center2[0] })).toHaveCount(0);
  await page.getByRole('option', { name: 'بدون معلم' }).click(); // keep it teacherless + close

  await page.getByTestId('group-level').click();
  await page.getByRole('option', { name: /المستوى الأول/ }).click();

  await page.getByTestId('group-capacity').fill('15');
  await page.getByTestId('day-Fri').click();

  await page.getByTestId('group-save').click();

  await expect(page).toHaveURL(/\/groups$/);
  const search = page.getByTestId('groups-search');
  await search.fill(String(stamp));
  await search.blur();
  await expect(page.locator('tbody tr.row-link')).toHaveCount(1);
  await expect(page.locator('tbody tr.row-link').first()).toContainText(name);
});

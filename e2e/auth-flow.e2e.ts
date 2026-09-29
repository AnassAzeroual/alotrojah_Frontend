import { expect, test } from '@playwright/test';

/**
 * Critical path on seeded dev data. READ-ONLY (no writes, no cleanup).
 * Backend + frontend are started by playwright.config webServer.
 */
test('guests are sent to login', async ({ page }) => {
  await page.goto('/students');
  await expect(page).toHaveURL(/\/login$/);
  await expect(page.getByRole('heading', { name: /تسجيل الدخول/ })).toBeVisible();
});

test('admin logs in, sees dashboard and students', async ({ page }) => {
  await page.goto('/login');
  await page.getByLabel(/البريد/).fill('admin@example.org');
  await page.getByLabel(/كلمة المرور/).fill('password123');
  await page.getByRole('button', { name: /دخول/ }).click();
  await expect(page).toHaveURL(/^http:\/\/127\.0\.0\.1:4201\/$/);

  // students list renders all 7 seeded students
  await page.getByRole('link', { name: /الطلاب/ }).click();
  await expect(page).toHaveURL(/\/students$/);
  await expect(page.getByText('أحمد بن يوسف')).toBeVisible();
  const rows = page.locator('.rows .row');
  await expect(rows).toHaveCount(7);

  // groups + guardians lists render (regression: NG0203 loader bug spun forever)
  await page.getByRole('link', { name: /الحلقات/ }).click();
  await expect(page).toHaveURL(/\/groups$/);
  await expect(page.locator('.rows .row')).toHaveCount(5);
  await page.getByRole('link', { name: /الأولياء/ }).click();
  await expect(page).toHaveURL(/\/guardians$/);
  await expect(page.locator('.rows .row')).toHaveCount(7);

  // dashboard loads charts for center 1
  await page.getByRole('link', { name: /الرئيسية/ }).click();
  await page.getByLabel(/حسب المركز/).selectOption({ index: 1 });
  await expect(page.locator('canvas').first()).toBeVisible();

  // logout returns to login
  await page.getByRole('button', { name: /خروج/ }).click();
  await expect(page).toHaveURL(/\/login$/);
});

test('session survives reload', async ({ page }) => {
  await page.goto('/login');
  await page.getByLabel(/البريد/).fill('admin@example.org');
  await page.getByLabel(/كلمة المرور/).fill('password123');
  await page.getByRole('button', { name: /دخول/ }).click();
  await expect(page).toHaveURL(/^http:\/\/127\.0\.0\.1:4201\/$/);
  await page.reload();
  // still logged in: shell (logout button) visible, no redirect to login
  await expect(page.getByRole('button', { name: /خروج/ })).toBeVisible();
  await expect(page).toHaveURL(/^http:\/\/127\.0\.0\.1:4201\/$/);
});

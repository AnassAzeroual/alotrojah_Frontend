import { expect, test } from '@playwright/test';
import { loginAs } from './api';

test.describe.serial('Admin settings and center chip', () => {
  const stamp = Date.now();
  const teacherEmail = `e2e_chip_${stamp}@example.org`;
  const teacherName = `E2E Chip ${stamp}`;

  test('admin toggles the scope kill-switch and it hides the pickers', async ({ page }) => {
    await page.goto('/login');
    await page.getByTestId('auth-email').fill('admin@example.org');
    await page.getByTestId('auth-password').fill('password123');
    await page.getByTestId('auth-submit').click();
    await expect(page).toHaveURL(/^http:\/\/127\.0\.0\.1:4201\/$/);

    // admin sees the pinned settings gear; the chip shows nothing extra
    await expect(page.getByTestId('nav-settings')).toBeVisible();
    await expect(page.getByTestId('user-center')).toHaveCount(0);
    await page.getByTestId('nav-settings').click();
    await expect(page).toHaveURL(/\/settings$/);

    // kill-switch on → both scope pickers vanish, shared scope everywhere.
    // Settle first: the default-true display pref renders checked only once
    // bindings are live — clicking earlier risks an unbound control.
    await expect(page.getByTestId('settings-show-center-id')).toBeChecked();
    await page.getByTestId('settings-hide-scopes').check();
    await expect(page.getByTestId('settings-hide-scopes')).toBeChecked();
    await expect
      .poll(
        async () => (await page.evaluate(() => localStorage.getItem('alotrojah_prefs.1'))) ?? '',
      )
      .toContain('"hideScopePickers":true');

    // Non-vacuous: rows rendered first, so count 0 means hidden, not loading.
    await page.getByTestId('nav-scoring').click();
    await expect(page).toHaveURL(/\/scoring$/);
    await expect(page.getByTestId('scoring-scope-banner')).toBeVisible();
    await expect
      .poll(async () => page.locator('.scoring-table tbody tr').count())
      .toBeGreaterThanOrEqual(1);
    await expect(page.getByTestId('scoring-center-scope')).toHaveCount(0);
    await expect(page.getByTestId('scoring-reset')).toHaveCount(0);
    await page.getByTestId('nav-levels').click();
    await expect(page).toHaveURL(/\/levels$/);
    await expect(page.getByTestId('levels-scope-banner')).toBeVisible();
    await expect
      .poll(async () => page.locator('.levels-table tbody tr').count())
      .toBeGreaterThanOrEqual(1);
    await expect(page.getByTestId('levels-center-scope')).toHaveCount(0);

    // kill-switch off → pickers are back (state restored for later runs).
    // Settle on the persisted-true box before trusting the toggle.
    await page.getByTestId('nav-settings').click();
    await expect(page).toHaveURL(/\/settings$/);
    await expect(page.getByTestId('settings-hide-scopes')).toBeChecked();
    await page.getByTestId('settings-hide-scopes').uncheck();
    await expect
      .poll(
        async () => (await page.evaluate(() => localStorage.getItem('alotrojah_prefs.1'))) ?? '',
      )
      .toContain('"hideScopePickers":false');
    await page.getByTestId('nav-scoring').click();
    await expect(page).toHaveURL(/\/scoring$/);
    await expect(page.getByTestId('scoring-scope-banner')).toBeVisible();
    await expect(page.getByTestId('scoring-center-scope')).toBeVisible();

    await page.getByTestId('nav-logout').click();
    await expect(page).toHaveURL(/\/login$/);
  });

  test('teacher sees their center in the chip and no settings gear', async ({ page }) => {
    await page.goto('/login');
    await page.getByTestId('auth-email').fill('admin@example.org');
    await page.getByTestId('auth-password').fill('password123');
    await page.getByTestId('auth-submit').click();
    await expect(page).toHaveURL(/^http:\/\/127\.0\.0\.1:4201\/$/);

    await page.getByTestId('nav-users').click();
    await page.getByTestId('users-new').click();
    await page.getByTestId('user-name').fill(teacherName);
    await page.getByTestId('user-email').fill(teacherEmail);
    await page.getByTestId('user-password').fill('password123');
    await page.getByTestId('user-role').click();
    await page.getByRole('option', { name: /معلم/ }).click();
    await page.getByTestId('user-teacher-type').click();
    await page.getByRole('option', { name: /حفظ ومراجعة/ }).click();
    await page.getByTestId('user-center').click();
    await page.getByRole('option', { name: 'مركز النور القرآني' }).click();
    await page.getByTestId('user-submit').click();
    await expect(page).toHaveURL(/\/users$/);
    await page.getByTestId('nav-logout').click();
    await expect(page).toHaveURL(/\/login$/);

    // loginAs re-verifies the email post-fill (fresh forms can wipe mid-fill).
    await loginAs(page, teacherEmail, 'password123');
    await expect(page).toHaveURL(/^http:\/\/127\.0\.0\.1:4201\/$/);
    await expect(page.getByTestId('user-center')).toContainText('مركز النور القرآني');
    await expect(page.getByTestId('nav-settings')).toHaveCount(0);
    await page.getByTestId('nav-logout').click();

    // cleanup: the teacher owns nothing, so direct delete works
    await loginAs(page, 'admin@example.org', 'password123');
    await page.getByTestId('nav-users').click();
    const searchBox = page.getByTestId('users-search');
    await searchBox.fill(teacherName);
    await searchBox.press('Enter');
    const teacherRow = page.locator('.users-table tbody tr', { hasText: teacherName });
    await expect(teacherRow).toHaveCount(1);
    await teacherRow.locator('button[data-testid^="delete-user-"]').click();
    await teacherRow.locator('button[data-testid^="confirm-delete-user-"]').click();
    await expect(teacherRow).toHaveCount(0);
    await page.getByTestId('nav-logout').click();
    await expect(page).toHaveURL(/\/login$/);
  });
});

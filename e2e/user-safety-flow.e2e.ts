import { expect, test, type Page } from '@playwright/test';
import { adminLogin, fillStable, loginAs } from './api';

test.describe.serial('Account safety', () => {
  const stamp = Date.now();
  const supName = `E2E Sup ${stamp}`;
  const supEmail = `e2e_sup_${stamp}@example.org`;
  const offName = `E2E Off ${stamp}`;
  const offEmail = `e2e_off_${stamp}@example.org`;
  const password = 'password123';

  async function openUserByName(page: Page, name: string) {
    await page.getByTestId('nav-users').click();
    await expect(page).toHaveURL(/\/users$/);
    const searchBox = page.getByTestId('users-search');
    await searchBox.fill(name);
    await searchBox.press('Enter');
    const row = page.locator('.users-table tbody tr', { hasText: name });
    await expect(row).toHaveCount(1);
    await row.locator('.user-link').click();
    await expect(page).toHaveURL(/\/users\/\d+$/);
  }

  async function deleteUserByName(page: Page, name: string) {
    await page.getByTestId('nav-users').click();
    await expect(page).toHaveURL(/\/users$/);
    const searchBox = page.getByTestId('users-search');
    await searchBox.fill(name);
    await searchBox.press('Enter');
    const row = page.locator('.users-table tbody tr', { hasText: name });
    await expect(row).toHaveCount(1);
    await row.locator('button[data-testid^="delete-user-"]').click();
    await row.locator('button[data-testid^="confirm-delete-user-"]').click();
    await expect(row).toHaveCount(0);
  }

  test('supervisor self-deactivation confirms and logs out', async ({ page }) => {
    await adminLogin(page);

    // create the supervisor (center required for non-admin roles)
    await page.getByTestId('nav-users').click();
    await page.getByTestId('users-new').click();
    await page.getByTestId('user-name').fill(supName);
    await page.getByTestId('user-email').fill(supEmail);
    await page.getByTestId('user-password').fill(password);
    await page.getByTestId('user-role').click();
    await page.getByRole('option', { name: /ناظر/ }).click();
    await page.getByTestId('user-center').click();
    await page.getByRole('option', { name: 'مركز النور القرآني' }).click();
    await page.getByTestId('user-submit').click();
    await expect(page).toHaveURL(/\/users$/);
    await page.getByTestId('nav-logout').click();

    // supervisor opens their own profile and switches themselves off
    await loginAs(page, supEmail, password);
    await expect(page).toHaveURL(/^http:\/\/127\.0\.0\.1:4201\/$/);
    await openUserByName(page, supName);
    await page.getByTestId('user-active').uncheck();
    await expect(page.getByTestId('user-self-off')).toBeVisible();
    await page.getByTestId('confirm-user-self-off').click();
    // confirm auto-saves and the session is dropped immediately
    await expect(page).toHaveURL(/\/login$/);

    // deactivated: login is refused
    await fillStable(page.getByTestId('auth-email'), supEmail);
    await fillStable(page.getByTestId('auth-password'), password);
    await page.getByTestId('auth-submit').click();
    await expect(page.locator('.auth-error')).toBeVisible();

    // admin reactivates then removes the account (self-cleaning)
    await adminLogin(page);
    await openUserByName(page, supName);
    await page.getByTestId('user-active').check();
    await page.getByTestId('user-submit').click();
    await expect(page).toHaveURL(/\/users$/);
    await deleteUserByName(page, supName);
    await page.getByTestId('nav-logout').click();
    await expect(page).toHaveURL(/\/login$/);
  });

  test('created-inactive accounts cannot log in', async ({ page }) => {
    await adminLogin(page);

    await page.getByTestId('nav-users').click();
    await page.getByTestId('users-new').click();
    await page.getByTestId('user-name').fill(offName);
    await page.getByTestId('user-email').fill(offEmail);
    await page.getByTestId('user-password').fill(password);
    await page.getByTestId('user-role').click();
    await page.getByRole('option', { name: /معلم/ }).click();
    await page.getByTestId('user-teacher-type').click();
    await page.getByRole('option', { name: /حفظ ومراجعة/ }).click();
    await page.getByTestId('user-center').click();
    await page.getByRole('option', { name: 'مركز النور القرآني' }).click();
    await page.getByTestId('user-active').uncheck();
    await page.getByTestId('user-submit').click();
    await expect(page).toHaveURL(/\/users$/);
    await page.getByTestId('nav-logout').click();

    // Hardened login ATTEMPT (loginAs twin for a rejected login): land fresh
    // on /login first, re-verify the email post-password, and retry once —
    // the fresh form can wipe mid-fill fields (fillStable alone only proves
    // mid-fill), leaving submit disabled forever.
    await page.goto('/login');
    for (let i = 0; i < 2; i++) {
      await fillStable(page.getByTestId('auth-email'), offEmail);
      await fillStable(page.getByTestId('auth-password'), password);
      await expect(page.getByTestId('auth-email')).toHaveValue(offEmail, { timeout: 2000 });
      try {
        await page.getByTestId('auth-submit').click({ timeout: 5000 });
        break;
      } catch {
        // wiped/disabled beneath us again — one refill, then fail loudly below
      }
    }
    await expect(page.locator('.auth-error')).toBeVisible();

    await adminLogin(page);
    await deleteUserByName(page, offName);
    await page.getByTestId('nav-logout').click();
    await expect(page).toHaveURL(/\/login$/);
  });
});

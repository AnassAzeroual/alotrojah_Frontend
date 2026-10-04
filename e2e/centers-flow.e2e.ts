import { expect, test } from '@playwright/test';

test.describe.serial('Centers management', () => {
  const stamp = Date.now();
  const name = `E2E Center ${stamp}`;

  test('admin creates a center and edits all its details', async ({ page }) => {
    await page.goto('/login');
    await page.getByTestId('auth-email').fill('admin@example.org');
    await page.getByTestId('auth-password').fill('password123');
    await page.getByTestId('auth-submit').click();
    await expect(page).toHaveURL(/^http:\/\/127\.0\.0\.1:4201\/$/);

    await page.getByTestId('nav-centers').click();
    await expect(page).toHaveURL(/\/centers$/);

    // create
    await page.getByTestId('center-name').fill(name);
    await page.getByTestId('center-city').fill('Testville');
    await page.getByTestId('center-phone').fill('0600000000');
    await page.getByTestId('center-manager').fill('E2E Manager');
    await page.getByTestId('center-save').click();
    const row = page.locator('.centers-table tbody tr', { hasText: name });
    await expect(row).toHaveCount(1);

    // edit every field inline
    await row.getByTestId(/edit-center-/).click();
    await page.getByTestId('center-edit-city').fill('Newville');
    await page.getByTestId('center-edit-address').fill('12 Test St');
    await page.getByTestId('center-edit-phone').fill('0611111111');
    await page.getByTestId('center-edit-manager').fill('E2E Boss');
    await page.getByTestId('center-edit-save').click();
    await page.waitForResponse(
      (r) => r.url().includes('/api/v1/centers/') && r.request().method() === 'PUT',
    );
    await page.reload();
    const edited = page.locator('.centers-table tbody tr', { hasText: name });
    await expect(edited).toHaveCount(1);
    await expect(edited).toContainText('Newville');

    await page.getByTestId('nav-logout').click();
    await expect(page).toHaveURL(/\/login$/);
  });
});

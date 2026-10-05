import { expect, test } from '@playwright/test';

test.describe.serial('Levels management', () => {
  test('admin scopes to a center, edits a level, and restores it', async ({ page }) => {
    await page.goto('/login');
    await page.getByTestId('auth-email').fill('admin@example.org');
    await page.getByTestId('auth-password').fill('password123');
    await page.getByTestId('auth-submit').click();
    await expect(page).toHaveURL(/^http:\/\/127\.0\.0\.1:4201\/$/);

    await page.getByTestId('nav-levels').click();
    await expect(page).toHaveURL(/\/levels$/);

    // scope to the first center (clone-on-first-edit happens server-side)
    await page.getByTestId('levels-center-scope').click();
    await page.getByRole('option', { name: 'مركز النور القرآني' }).click();

    const row = page.locator('.levels-table tbody tr', { hasText: 'L1' }).first();
    await expect(row).toHaveCount(1);
    await row.getByTestId(/^edit-level-/).click();
    await page.getByTestId('level-edit-sessions').fill('5');
    await page.getByTestId('level-edit-save').click();
    await page.waitForResponse(
      (r) => r.url().includes('/api/v1/levels/') && r.request().method() === 'PUT',
    );
    await expect(row).toContainText('5');

    // restore the default value (override rows stay scoped, defaults untouched)
    await row.getByTestId(/^edit-level-/).click();
    await page.getByTestId('level-edit-sessions').fill('3');
    await page.getByTestId('level-edit-save').click();
    await page.waitForResponse(
      (r) => r.url().includes('/api/v1/levels/') && r.request().method() === 'PUT',
    );
    await expect(row).toContainText('3');

    await page.getByTestId('nav-logout').click();
    await expect(page).toHaveURL(/\/login$/);
  });
});

import { expect, test } from '@playwright/test';

test.describe.serial('Scoring modules', () => {
  const stamp = Date.now();
  const code = `e2ebook${stamp}`;

  test('admin creates a module and deletes it again', async ({ page }) => {
    await page.goto('/login');
    await page.getByTestId('auth-email').fill('admin@example.org');
    await page.getByTestId('auth-password').fill('password123');
    await page.getByTestId('auth-submit').click();
    await expect(page).toHaveURL(/^http:\/\/127\.0\.0\.1:4201\/$/);

    await page.getByTestId('nav-scoring').click();
    await expect(page).toHaveURL(/\/scoring$/);

    // create (inactive from the weekly total, so the 20-sum never moves)
    await page.getByTestId('scoring-open-add').click();
    await page.getByTestId('scoring-code').fill(code);
    await page.getByTestId('scoring-name').fill(`E2E Book ${stamp}`);
    await page.getByTestId('scoring-max').fill('5');
    await page.getByTestId('scoring-add').click();
    const row = page.locator('.scoring-table tbody tr', { hasText: code });
    await expect(row).toHaveCount(1);

    // delete again (unused module → clean delete, no dev residue)
    await row.getByTestId(/^delete-module-/).click();
    await row.getByTestId(/^confirm-delete-module-/).click();
    await expect(page.locator('.scoring-table tbody tr', { hasText: code })).toHaveCount(0);

    await page.getByTestId('nav-logout').click();
    await expect(page).toHaveURL(/\/login$/);
  });
});

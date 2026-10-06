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

    // T1: shared-defaults banner, no reset affordance outside a center scope.
    await expect(page.getByTestId('levels-scope-banner')).toBeVisible();
    await expect(page.getByTestId('levels-reset')).toHaveCount(0);

    // scope to the first center (clone-on-first-edit happens server-side)
    await page.getByTestId('levels-center-scope').click();
    await page.getByRole('option', { name: 'مركز النور القرآني' }).click();
    await expect(page.getByTestId('levels-scope-banner')).toContainText('مركز النور القرآني');

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

    // T2: reset deletes this spec's own override rows (self-cleaning); a 422
    // means other runs' data references the overrides — assert the refusal.
    await expect(page.getByTestId('levels-reset')).toBeVisible();
    await expect(page.locator('.src-tag.override').first()).toBeVisible();
    await page.getByTestId('levels-reset').click();
    const [resp] = await Promise.all([
      page.waitForResponse(
        (r) => r.url().includes('/levels/reset') && r.request().method() === 'DELETE',
      ),
      page.getByTestId('confirm-levels-reset').click(),
    ]);
    if (resp.status() === 200) {
      await expect(page.locator('.src-tag.override')).toHaveCount(0);
    } else {
      await expect(page.locator('.banner.danger')).toBeVisible();
    }

    await page.getByTestId('nav-logout').click();
    await expect(page).toHaveURL(/\/login$/);
  });
});

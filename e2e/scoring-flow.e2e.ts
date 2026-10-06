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

    // T1: shared-defaults banner, no reset affordance outside a center scope.
    await expect(page.getByTestId('scoring-scope-banner')).toBeVisible();
    await expect(page.getByTestId('scoring-reset')).toHaveCount(0);

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

    // T1+T2: center scope shows the override banner + reset; reset either
    // restores shared defaults or surfaces the translated refusal (shared DB
    // may hold referenced overrides from other runs — both are valid).
    await page.getByTestId('scoring-center-scope').click();
    await page.getByRole('option', { name: 'مركز النور القرآني' }).click();
    await expect(page.getByTestId('scoring-scope-banner')).toContainText('مركز النور القرآني');
    await expect(page.getByTestId('scoring-reset')).toBeVisible();
    await page.getByTestId('scoring-reset').click();
    const [resp] = await Promise.all([
      page.waitForResponse(
        (r) => r.url().includes('/scoring-modules/reset') && r.request().method() === 'DELETE',
      ),
      page.getByTestId('confirm-scoring-reset').click(),
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

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

  test('admin creates a level with a dynamic code, then deletes it', async ({ page }) => {
    await page.goto('/login');
    await page.getByTestId('auth-email').fill('admin@example.org');
    await page.getByTestId('auth-password').fill('password123');
    await page.getByTestId('auth-submit').click();
    await expect(page).toHaveURL(/^http:\/\/127\.0\.0\.1:4201\/$/);

    await page.getByTestId('nav-levels').click();
    await expect(page).toHaveURL(/\/levels$/);
    // Let webfonts settle: an Arabic-font swap mid-click can move the target
    // between mousedown and mouseup, silently losing the click.
    await page.evaluate(() => document.fonts.ready);

    // The server assigns the L{id} code; name + label derive from days + unit.
    await page.getByTestId('level-new').click();
    await expect(page.getByTestId('level-create-form')).toBeVisible();
    await page.getByTestId('level-new-thumn-session').fill('1');
    await expect(page.getByTestId('level-new-thumn-week')).toHaveValue('3');
    await expect(page.getByTestId('level-new-name')).toHaveValue('ثمن في الأسبوع');
    const created = page.waitForResponse(
      (r) => r.url().endsWith('/api/v1/levels') && r.request().method() === 'POST',
    );
    await page.getByTestId('level-create-save').click();
    const res = await created;
    expect(res.status()).toBe(201);
    const body = await res.json();
    expect(String(body.data.code)).toMatch(/^L\d+$/);

    // The name derives from the amount label; address the row by its unique code.
    const row = page.locator('.levels-table tbody tr', { hasText: String(body.data.code) });
    await expect(row).toHaveCount(1);
    await expect(row).toContainText(body.data.code);

    // Self-cleaning: delete the created row again, addressed by its exact
    // testids (no regex, no row-scope staleness).
    const levelId = body.data.id as number;
    const arm = page.getByTestId(`delete-level-${levelId}`);
    await expect
      .poll(
        async () => {
          if ((await page.getByTestId(`confirm-delete-level-${levelId}`).count()) > 0) return true;
          await arm.click();
          return (await page.getByTestId(`confirm-delete-level-${levelId}`).count()) > 0;
        },
        { timeout: 15000 },
      )
      .toBe(true);
    const confirm = page.getByTestId(`confirm-delete-level-${levelId}`);
    await expect
      .poll(
        async () => {
          if ((await confirm.count()) === 0) return true;
          await confirm.click();
          await page.waitForTimeout(1500);
          return (await confirm.count()) === 0;
        },
        { timeout: 20000 },
      )
      .toBe(true);
    await expect(
      page.locator('.levels-table tbody tr', { hasText: String(body.data.code) }),
    ).toHaveCount(0);

    await page.getByTestId('nav-logout').click();
    await expect(page).toHaveURL(/\/login$/);
  });
});

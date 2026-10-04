import { expect, test } from '@playwright/test';

test.describe.serial('News management', () => {
  const stamp = Date.now();
  const title = `E2E News ${stamp}`;
  const edited = `E2E News Edited ${stamp}`;

  test('admin creates, edits and deletes an announcement', async ({ page }) => {
    await page.goto('/login');
    await page.getByTestId('auth-email').fill('admin@example.org');
    await page.getByTestId('auth-password').fill('password123');
    await page.getByTestId('auth-submit').click();
    await expect(page).toHaveURL(/^http:\/\/127\.0\.0\.1:4201\/$/);

    await page.getByTestId('nav-news').click();
    await expect(page).toHaveURL(/\/news$/);

    // create (defaults to audience "all"); newest article lands first
    await page.getByTestId('news-title').fill(title);
    await page.getByTestId('news-body').fill(title);
    await page.getByTestId('news-publish').click();
    const mine = page.locator('article.card').first();
    await expect(mine).toContainText(title);

    // inline edit (text matchers break once the title moves into inputs)
    await mine.getByTestId('news-edit').click();
    await mine.getByTestId('news-edit-title').fill(edited);
    await mine.getByTestId('news-save').click();
    await expect(mine).toContainText(edited);

    // delete (self-cleaning: seed list untouched)
    await mine.getByTestId('news-delete').click();
    await expect(page.locator('article.card', { hasText: edited })).toHaveCount(0);

    await page.getByTestId('nav-logout').click();
    await expect(page).toHaveURL(/\/login$/);
  });
});

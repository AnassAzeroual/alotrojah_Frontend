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

    // Create, await the POST and its list reload, then target the unique title.
    await page.getByTestId('news-group').click();
    await page.locator('.dd.open [role="option"]').nth(1).click();
    await page.getByTestId('news-title').fill(title);
    await page.getByTestId('news-body').fill(title);
    const published = page.waitForResponse(
      (r) => r.url().includes('/announcements') && r.request().method() === 'POST',
    );
    const reloaded = page.waitForResponse(
      (r) => r.url().includes('/announcements') && r.request().method() === 'GET',
    );
    await page.getByTestId('news-publish').click();
    await published;
    await reloaded;
    const mine = page.locator('article.card', { hasText: title });
    await expect(mine).toHaveCount(1);

    // Inline edit replaces title text with inputs, so do not retain a text-filtered locator.
    await mine.getByTestId('news-edit').click();
    await page.getByTestId('news-edit-title').fill(edited);
    await page.getByTestId('news-save').click();
    const editedArticle = page.locator('article.card', { hasText: edited });
    await expect(editedArticle).toHaveCount(1);

    // delete (self-cleaning: seed list untouched)
    await editedArticle.getByTestId('news-delete').click();
    await expect(page.locator('article.card', { hasText: edited })).toHaveCount(0);

    await page.getByTestId('nav-logout').click();
    await expect(page).toHaveURL(/\/login$/);
  });
});

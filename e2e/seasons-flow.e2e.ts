import { expect, test } from '@playwright/test';

test.describe.serial('Seasons management', () => {
  const stamp = Date.now();
  const seasonName = `E2E Season ${stamp}`;

  test('admin creates a season and deletes it again', async ({ page }) => {
    await page.goto('/login');
    await page.getByTestId('auth-email').fill('admin@example.org');
    await page.getByTestId('auth-password').fill('password123');
    await page.getByTestId('auth-submit').click();
    await expect(page).toHaveURL(/^http:\/\/127\.0\.0\.1:4201\/$/);

    await page.getByTestId('nav-planning').click();
    await expect(page).toHaveURL(/\/planning$/);
    await page.getByTestId('seasons-new').click();
    await expect(page).toHaveURL(/\/planning\/new$/);

    await page.getByTestId('seasons-template').click();
    await page.getByTestId('season-name').fill(seasonName);
    await page.getByTestId('season-start').fill('2026-09-01');
    await page.getByTestId('season-center').click();
    await page.getByRole('option', { name: 'مركز النور القرآني' }).click();
    await page.getByTestId('season-save').click();
    await expect(page).toHaveURL(/\/planning$/);

    // fact-free season deletes cleanly (self-cleaning: no dev residue)
    const card = page.locator('.grid-auto .card', { hasText: seasonName });
    await expect(card).toHaveCount(1);
    await card.getByTestId(/^delete-season-/).click();
    await card.getByTestId(/^confirm-delete-season-/).click();
    await expect(page.locator('.grid-auto .card', { hasText: seasonName })).toHaveCount(0);

    await page.getByTestId('nav-logout').click();
    await expect(page).toHaveURL(/\/login$/);
  });

  test('admin renames a term and restores it', async ({ page }) => {
    const renamed = `E2E Term ${stamp}`;
    await page.goto('/login');
    await page.getByTestId('auth-email').fill('admin@example.org');
    await page.getByTestId('auth-password').fill('password123');
    await page.getByTestId('auth-submit').click();
    await expect(page).toHaveURL(/^http:\/\/127\.0\.0\.1:4201\/$/);

    await page.goto('/planning/terms/1');
    const heading = page.locator('.page-head h1');
    await expect(heading).toBeVisible();
    const original = ((await heading.evaluate((h) => h.childNodes[0].textContent)) ?? '').trim();

    await page.getByTestId('term-rename').click();
    await page.getByTestId('term-name-input').fill(renamed);
    await page.getByTestId('term-name-save').click();
    await expect(heading).toContainText(renamed);

    // restore the seed name (shared dev DB)
    await page.getByTestId('term-rename').click();
    await page.getByTestId('term-name-input').fill(original);
    await page.getByTestId('term-name-save').click();
    await expect(heading).toContainText(original);

    await page.getByTestId('nav-logout').click();
    await expect(page).toHaveURL(/\/login$/);
  });
});

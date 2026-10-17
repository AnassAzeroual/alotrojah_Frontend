import { expect, test } from '@playwright/test';
import { adminLogin } from './api';

test.describe.serial('Unsaved changes guard', () => {
  test('dirty center row blocks leave until confirmed', async ({ page }) => {
    await adminLogin(page);

    await page.getByTestId('nav-centers').click();
    await expect(page).toHaveURL(/\/centers$/);
    await page.locator('[data-testid^="edit-center-"]').first().click();
    await page.getByTestId('center-edit-name').fill('تعديل غير محفوظ');

    // Attempt to leave with unsaved typing: guard holds the route and the
    // shared CDK dialog asks for confirmation…
    await page.getByTestId('nav-students').click();
    await expect(page.getByTestId('dialog-confirm')).toBeVisible();
    await expect(page).toHaveURL(/\/centers$/);

    // …until the leave is confirmed (nothing was ever saved).
    await page.getByTestId('dialog-confirm').click();
    await expect(page).toHaveURL(/\/students$/);

    await page.getByTestId('nav-logout').click();
    await expect(page).toHaveURL(/\/login$/);
  });

  test('cancel keeps you on the page with edits intact', async ({ page }) => {
    await adminLogin(page);

    await page.getByTestId('nav-centers').click();
    await expect(page).toHaveURL(/\/centers$/);
    await page.locator('[data-testid^="edit-center-"]').first().click();
    await page.getByTestId('center-edit-name').fill('تعديل غير محفوظ');
    await page.getByTestId('nav-students').click();
    await expect(page.getByTestId('dialog-confirm')).toBeVisible();

    // Cancel: stay put, draft untouched.
    await page.getByTestId('dialog-cancel').click();
    await expect(page).toHaveURL(/\/centers$/);
    await expect(page.getByTestId('center-edit-name')).toHaveValue('تعديل غير محفوظ');

    // Reload drops the unsaved draft (nothing was ever written).
    await page.reload();
    await expect(page).toHaveURL(/\/centers$/);
    await page.getByTestId('nav-logout').click();
    await expect(page).toHaveURL(/\/login$/);
  });
});

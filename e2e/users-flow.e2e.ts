import { expect, test } from '@playwright/test';

test.describe.serial('Users management', () => {
  const stamp = Date.now();
  const teacherEmail = `e2e_teacher_${stamp}@example.org`;
  const teacherName = `E2E Teacher ${stamp}`;
  const teacherPassword = 'password123';

  test('admin creates teacher and sees list', async ({ page }) => {
    // login as admin
    await page.goto('/login');
    await page.getByLabel('البريد الإلكتروني', { exact: true }).fill('admin@example.org');
    await page.getByLabel('كلمة المرور', { exact: true }).fill('password123');
    await page.getByRole('button', { name: /دخول/ }).click();
    await expect(page).toHaveURL(/^http:\/\/127\.0\.0\.1:4201\/$/);

    // go to users
    await page.getByRole('link', { name: /المستخدمون/ }).click();
    await expect(page).toHaveURL(/\/users$/);

    // check list count (seeded users exist)
    const rows = page.locator('.users-table tbody tr');
    await expect.poll(async () => rows.count()).toBeGreaterThanOrEqual(1);

    // create new user
    await page.getByRole('link', { name: /إضافة مستخدم/ }).click();
    await expect(page).toHaveURL(/\/users\/new$/);

    await page.getByLabel('الاسم الكامل', { exact: false }).fill(teacherName);
    await page.getByLabel('البريد الإلكتروني', { exact: false }).fill(teacherEmail);
    await page.getByLabel('كلمة المرور', { exact: false }).fill(teacherPassword);

    // role: teacher
    await page.getByRole('button', { name: 'الصفة' }).click();
    await page.getByRole('option', { name: /معلم/ }).click();

    // teacher type
    await page.getByRole('button', { name: 'نوع التعليم' }).click();
    await page.getByRole('option', { name: /حفظ ومراجعة/ }).click();

    await page.locator('button[type="submit"]').click();
    await expect(page).toHaveURL(/\/users$/);

    // logout
    await page.getByRole('button', { name: /خروج/ }).click();
    await expect(page).toHaveURL(/\/login$/);
  });

  test('created teacher logs in, then admin deactivates, login fails', async ({ page }) => {
    // Teacher logs in
    await page.goto('/login');
    await page.getByLabel('البريد الإلكتروني', { exact: true }).fill(teacherEmail);
    await page.getByLabel('كلمة المرور', { exact: true }).fill(teacherPassword);
    await page.getByRole('button', { name: /دخول/ }).click();
    await expect(page).toHaveURL(/^http:\/\/127\.0\.0\.1:4201\/$/);

    // Logout
    await page.getByRole('button', { name: /خروج/ }).click();

    // Admin logs in to deactivate
    await page.goto('/login');
    await page.getByLabel('البريد الإلكتروني', { exact: true }).fill('admin@example.org');
    await page.getByLabel('كلمة المرور', { exact: true }).fill('password123');
    await page.getByRole('button', { name: /دخول/ }).click();

    // Find the created teacher through the search box (stable test-id locator).
    await page.getByRole('link', { name: /المستخدمون/ }).click();
    await expect(page).toHaveURL(/\/users$/);
    const searchBox = page.getByTestId('users-search');
    await searchBox.fill(teacherName);
    await searchBox.press('Enter');
    const teacherRow = page.locator('.users-table tbody tr', { hasText: teacherName });
    await expect(teacherRow).toHaveCount(1);
    await teacherRow.locator('.user-link').click();
    await expect(page).toHaveURL(/\/users\/\d+$/);

    // Deactivate (wait for the form to be populated first)
    await expect(page.getByLabel('الاسم الكامل', { exact: false })).toHaveValue(teacherName);
    await page.getByLabel('نشط', { exact: true }).uncheck();

    await page.locator('button[type="submit"]').click();
    await expect(page).toHaveURL(/\/users$/);

    await page.getByRole('button', { name: /خروج/ }).click();

    // Teacher tries login again
    await page.getByLabel('البريد الإلكتروني', { exact: true }).fill(teacherEmail);
    await page.getByLabel('كلمة المرور', { exact: true }).fill(teacherPassword);
    await page.getByRole('button', { name: /دخول/ }).click();

    // Should see error and stay on login
    await expect(page.locator('.auth-error')).toBeVisible();
    await expect(page).toHaveURL(/\/login$/);
  });
});

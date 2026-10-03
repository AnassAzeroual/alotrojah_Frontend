import { expect, test } from '@playwright/test';

test.describe.serial('Students management', () => {
  const studentName = `E2E Student ${Date.now()}`;

  test('admin creates student and sees them in list', async ({ page }) => {
    page.on('console', (msg) => {
      if (msg.type() === 'error') console.log('BROWSER ERROR:', msg.text());
    });
    page.on('pageerror', (err) => console.log('PAGE ERROR:', err.message));
    // login as admin
    await page.goto('/login');
    await page.getByLabel('البريد الإلكتروني', { exact: true }).fill('admin@example.org');
    await page.getByLabel('كلمة المرور', { exact: true }).fill('password123');
    await page.getByRole('button', { name: /دخول/ }).click();
    await expect(page).toHaveURL(/^http:\/\/127\.0\.0\.1:4201\/$/);

    // go to students
    await page.getByRole('link', { name: /الطلاب/ }).click();
    await expect(page).toHaveURL(/\/students$/);

    // check list count
    const rows = page.locator('.grid-auto .card');
    await expect.poll(async () => rows.count()).toBeGreaterThanOrEqual(1);

    // create new student
    await page.getByRole('link', { name: /إضافة طالب/ }).click();
    await expect(page).toHaveURL(/\/students\/new$/);

    await page.getByLabel('الاسم الكامل', { exact: false }).fill(studentName);

    // mode: surah
    await page.getByRole('button', { name: 'النمط' }).click();
    await page.getByRole('option', { name: /بالسورة/ }).click();

    // status: active
    await page.getByRole('button', { name: 'الحالة' }).click();
    await page.getByRole('option', { name: /نشط/ }).click();

    await page.getByRole('button', { name: /حفظ/ }).click();

    // should redirect to student detail page
    await expect(page).toHaveURL(/\/students\/\d+$/);

    // verify name on detail page
    await expect(page.getByRole('heading', { name: studentName })).toBeVisible();

    // go back to list
    await page.getByRole('link', { name: /الطلاب/ }).click();
    await expect(page).toHaveURL(/\/students$/);

    // search for student (test-id locator: placeholder text changes with locale)
    const searchBox = page.getByTestId('students-search');
    await searchBox.fill(studentName);
    await searchBox.press('Enter');

    const studentCard = page.locator('.grid-auto .card', { hasText: studentName }).first();
    await expect(studentCard).toBeVisible();
  });
});

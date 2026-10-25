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
    await page.getByTestId('auth-email').fill('admin@example.org');
    await page.getByTestId('auth-password').fill('password123');
    await page.getByTestId('auth-submit').click();
    await expect(page).toHaveURL(/^http:\/\/127\.0\.0\.1:4201\/$/);

    // go to students
    await page.getByTestId('nav-students').click();
    await expect(page).toHaveURL(/\/students$/);

    // check list count (cold backend can take a while — 20s poll like calendar specs)
    const rows = page.locator('.students-table tbody tr');
    await expect.poll(async () => rows.count(), { timeout: 20000 }).toBeGreaterThanOrEqual(1);

    // create new student — the account is created with the pupil in one save
    await page.getByTestId('nav-students').click();
    await expect(page).toHaveURL(/\/students$/);
    await page.getByTestId('students-new').click();
    await expect(page).toHaveURL(/\/students\/new$/);

    // center (required for admin now — any center works)
    await page.getByTestId('student-center').click();
    await page.getByRole('option').first().click();

    await page.getByTestId('student-name').fill(studentName);
    await page.getByTestId('student-email').fill(`e2e_pupil_${Date.now()}@example.org`);
    await page.getByTestId('student-password').fill('password123');

    await page.getByTestId('student-group').click();
    await page.locator('.dd.open [role="option"]').first().click();

    await page.getByTestId('student-level').click();
    await page.locator('.dd.open [role="option"]').first().click();

    await page.getByTestId('student-start-hizb').fill('2');

    // mode: surah
    await page.getByTestId('student-mode').click();
    await page.getByRole('option', { name: /بالسورة/ }).click();

    // status: active
    await page.getByTestId('student-status').click();
    await page.getByRole('option', { name: /نشط/ }).click();

    await page.getByTestId('student-submit').click();

    // should redirect to student detail page
    await expect(page).toHaveURL(/\/students\/\d+$/);

    // verify name on detail page
    await expect(page.getByRole('heading', { name: studentName })).toBeVisible();

    // go back to list
    await page.getByTestId('nav-students').click();
    await expect(page).toHaveURL(/\/students$/);

    // search for student (test-id locator: placeholder text changes with locale)
    const searchBox = page.getByTestId('students-search');
    await searchBox.fill(studentName);
    await searchBox.press('Enter');

    const studentRow = page.locator('.students-table tbody tr', { hasText: studentName }).first();
    await expect(studentRow).toBeVisible();

    // whole-row navigation replaces the old card link
    await studentRow.click();
    await expect(page).toHaveURL(/\/students\/\d+$/);
    await expect(page.getByRole('heading', { name: studentName })).toBeVisible({
      timeout: 15000,
    });
  });
});

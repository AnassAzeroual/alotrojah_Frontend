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

    // Every pupil rides a login account: create the student user first.
    const accountName = `E2E Pupil Acct ${Date.now()}`;
    const accountEmail = `e2e_pupil_${Date.now()}@example.org`;
    await page.getByTestId('nav-users').click();
    await expect(page).toHaveURL(/\/users$/);
    await page.getByTestId('users-new').click();
    await expect(page).toHaveURL(/\/users\/new$/);
    await page.getByTestId('user-name').fill(accountName);
    await page.getByTestId('user-email').fill(accountEmail);
    await page.getByTestId('user-password').fill('password123');
    await page.getByTestId('user-role').click();
    await page.getByRole('option', { name: 'طالب', exact: true }).click();
    await page.getByTestId('user-center').click();
    await page.getByRole('option', { name: 'مركز النور القرآني' }).click();
    await page.getByTestId('user-submit').click();
    await expect(page).toHaveURL(/\/users$/);

    // create new student
    await page.getByTestId('nav-students').click();
    await expect(page).toHaveURL(/\/students$/);
    await page.getByTestId('students-new').click();
    await expect(page).toHaveURL(/\/students\/new$/);

    // center (required for admin now — any center works)
    await page.getByTestId('student-center').click();
    await page.getByRole('option').first().click();

    // link the fresh account (prefills the pupil name)
    await page.getByTestId('student-account').click();
    await page.getByRole('option', { name: accountEmail }).click();
    await expect(page.getByTestId('student-name')).toHaveValue(accountName);
    await page.getByTestId('student-name').fill(studentName);

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

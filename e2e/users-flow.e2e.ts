import { expect, test } from '@playwright/test';
import { adminLogin, fillStable, loginAs } from './api';

test.describe.serial('Users management', () => {
  const stamp = Date.now();
  const teacherEmail = `e2e_teacher_${stamp}@example.org`;
  const teacherName = `E2E Teacher ${stamp}`;
  const teacherPassword = 'password123';

  test('admin creates, deactivates, deletes and replaces teachers', async ({ page }) => {
    // ---- create (one admin login for the whole flow) ----
    await adminLogin(page);

    // go to users
    await page.getByTestId('nav-users').click();
    await expect(page).toHaveURL(/\/users$/);

    // check list count (seeded users exist)
    const rows = page.locator('.users-table tbody tr');
    await expect.poll(async () => rows.count()).toBeGreaterThanOrEqual(1);

    // create new user
    await page.getByTestId('users-new').click();
    await expect(page).toHaveURL(/\/users\/new$/);

    await page.getByTestId('user-name').fill(teacherName);
    await page.getByTestId('user-email').fill(teacherEmail);
    await page.getByTestId('user-password').fill(teacherPassword);

    // role: teacher
    await page.getByTestId('user-role').click();
    await page.getByRole('option', { name: /معلم/ }).click();

    // teacher type
    await page.getByTestId('user-teacher-type').click();
    await page.getByRole('option', { name: /حفظ ومراجعة/ }).click();

    // center (required for non-admin roles; first option is the placeholder)
    await page.getByTestId('user-center').click();
    await page.getByRole('option', { name: 'مركز النور القرآني' }).click();

    await page.getByTestId('user-submit').click();
    await expect(page).toHaveURL(/\/users$/);

    // duplicate email → translated 422 banner, zero new rows
    await page.getByTestId('users-new').click();
    await expect(page).toHaveURL(/\/users\/new$/);
    await page.getByTestId('user-name').fill(`E2E Dup ${stamp}`);
    await page.getByTestId('user-email').fill(teacherEmail);
    await page.getByTestId('user-password').fill(teacherPassword);
    await page.getByTestId('user-role').click();
    await page.getByRole('option', { name: /معلم/ }).click();
    await page.getByTestId('user-teacher-type').click();
    await page.getByRole('option', { name: /حفظ ومراجعة/ }).click();
    await page.getByTestId('user-center').click();
    await page.getByRole('option', { name: 'مركز النور القرآني' }).click();
    await page.getByTestId('user-submit').click();
    await expect(page.getByTestId('user-error')).toContainText('مسجل مسبقاً');
    await expect(page).toHaveURL(/\/users\/new$/);

    // logout (the half-filled duplicate form is dirty, so the unsaved
    // guard holds the route until the leave is confirmed — by design)
    await page.getByTestId('nav-logout').click();
    await expect(page.getByTestId('unsaved-guard')).toBeVisible();
    await page.getByTestId('confirm-leave').click();
    await expect(page).toHaveURL(/\/login$/);

    // ---- teacher logs in, then admin deactivates, login fails ----
    await loginAs(page, teacherEmail, teacherPassword);
    await expect(page).toHaveURL(/^http:\/\/127\.0\.0\.1:4201\/$/);

    // Logout
    await page.getByTestId('nav-logout').click();

    // Admin logs in to deactivate
    await adminLogin(page);

    // Find the created teacher through the search box (stable test-id locator).
    await page.getByTestId('nav-users').click();
    await expect(page).toHaveURL(/\/users$/);
    const searchBox = page.getByTestId('users-search');
    await searchBox.fill(teacherName);
    await searchBox.press('Enter');
    const teacherRow = page.locator('.users-table tbody tr', { hasText: teacherName });
    await expect(teacherRow).toHaveCount(1);
    await teacherRow.locator('.user-link').click();
    await expect(page).toHaveURL(/\/users\/\d+$/);

    // Deactivate (wait for the form to be populated first)
    await expect(page.getByTestId('user-name')).toHaveValue(teacherName);
    await page.getByTestId('user-active').uncheck();

    await page.getByTestId('user-submit').click();
    await expect(page).toHaveURL(/\/users$/);

    await page.getByTestId('nav-logout').click();
    await expect(page).toHaveURL(/\/login$/);

    // Teacher tries login again (hardened attempt: the fresh /login form
    // can wipe mid-fill fields, leaving submit disabled — goto first,
    // re-verify the email post-password, retry once, fail loudly)
    await page.goto('/login');
    for (let i = 0; i < 2; i++) {
      await fillStable(page.getByTestId('auth-email'), teacherEmail);
      await fillStable(page.getByTestId('auth-password'), teacherPassword);
      await expect(page.getByTestId('auth-email')).toHaveValue(teacherEmail, { timeout: 2000 });
      try {
        await page.getByTestId('auth-submit').click({ timeout: 5000 });
        break;
      } catch {
        // wiped/disabled beneath us again — one refill, then fail loudly below
      }
    }

    // Should see error and stay on login
    await expect(page.locator('.auth-error')).toBeVisible();
    await expect(page).toHaveURL(/\/login$/);

    // ---- admin deletes the teacher and the row disappears ----
    await adminLogin(page);

    await page.getByTestId('nav-users').click();
    await expect(page).toHaveURL(/\/users$/);

    const searchBox2 = page.getByTestId('users-search');
    await searchBox2.fill(teacherName);
    await searchBox2.press('Enter');
    const teacherRow2 = page.locator('.users-table tbody tr', { hasText: teacherName });
    await expect(teacherRow2).toHaveCount(1);

    await teacherRow2.locator('button[data-testid^="delete-user-"]').click();
    await teacherRow2.locator('button[data-testid^="confirm-delete-user-"]').click();
    await expect(teacherRow2).toHaveCount(0);

    // ---- replacer flow continues in the same admin session (no re-login) ----
    const oldName = `E2E Old ${stamp}`;
    const newName = `E2E New ${stamp}`;
    const oldEmail = `e2e_old_${stamp}@example.org`;
    const newEmail = `e2e_new_${stamp}@example.org`;
    const groupName = `RPLC ${stamp}`;

    // two hifz teachers in center 1
    for (const [name, email] of [
      [oldName, oldEmail],
      [newName, newEmail],
    ]) {
      await page.getByTestId('nav-users').click();
      await expect(page).toHaveURL(/\/users$/);
      await page.getByTestId('users-new').click();
      await expect(page).toHaveURL(/\/users\/new$/);
      await page.getByTestId('user-name').fill(name);
      await page.getByTestId('user-email').fill(email);
      await page.getByTestId('user-password').fill('password123');
      await page.getByTestId('user-role').click();
      await page.getByRole('option', { name: /معلم/ }).click();
      await page.getByTestId('user-teacher-type').click();
      await page.getByRole('option', { name: 'حفظ', exact: true }).click();
      await page.getByTestId('user-center').click();
      await page.getByRole('option', { name: 'مركز النور القرآني' }).click();
      await page.getByTestId('user-submit').click();
      await expect(page).toHaveURL(/\/users$/);
    }

    // group owned by the old teacher
    await page.getByTestId('nav-groups').click();
    await expect(page).toHaveURL(/\/groups$/);
    await page.getByTestId('groups-new').click();
    await expect(page).toHaveURL(/\/groups\/new$/);
    await page.getByTestId('group-name').fill(groupName);
    await page.getByTestId('group-center').click();
    await page.getByRole('option', { name: 'مركز النور القرآني' }).click();
    await page.getByTestId('group-teacher').click();
    await page.getByRole('option', { name: oldName }).click();
    await page.getByTestId('group-level').click();
    await page.getByRole('option', { name: /المستوى الأول/ }).click();
    await page.getByTestId('group-capacity').fill('15');
    await page.getByTestId('day-Fri').click();
    await page.getByTestId('group-save').click();
    await expect(page).toHaveURL(/\/groups$/);

    // deleting the old teacher is blocked → replacer dialog
    await page.getByTestId('nav-users').click();
    await expect(page).toHaveURL(/\/users$/);
    const searchBox3 = page.getByTestId('users-search');
    await searchBox3.fill(oldName);
    await searchBox3.press('Enter');
    const oldRow = page.locator('.users-table tbody tr', { hasText: oldName });
    await expect(oldRow).toHaveCount(1);
    await oldRow.locator('button[data-testid^="delete-user-"]').click();
    await oldRow.locator('button[data-testid^="confirm-delete-user-"]').click();
    const dialog = page.getByTestId('replace-dialog');
    await expect(dialog).toBeVisible();
    await page.getByTestId('choose-replacer').click();
    await expect(page).toHaveURL(/\/users\/\d+\/replace$/);

    // pick the new teacher and confirm the transfer
    await page.getByTestId('replace-pick').click();
    await page.getByRole('option', { name: newName }).click();
    await page.getByTestId('replace-confirm').click();
    await expect(page).toHaveURL(/\/users$/);

    // old teacher is gone
    await searchBox3.fill(oldName);
    await searchBox3.press('Enter');
    await expect(page.locator('.users-table tbody tr', { hasText: oldName })).toHaveCount(0);

    // the group survived the transfer
    await page.getByTestId('nav-groups').click();
    await expect(page).toHaveURL(/\/groups$/);
    const groupSearch = page.getByTestId('groups-search');
    await groupSearch.fill(groupName);
    await groupSearch.press('Enter');
    await expect(page.locator('tbody tr', { hasText: groupName })).toHaveCount(1);

    // the new teacher now owns the group → hidden by the unassigned filter
    await page.getByTestId('nav-users').click();
    await expect(page).toHaveURL(/\/users$/);
    await page.getByTestId('users-role').click();
    await page.getByRole('option', { name: 'معلم', exact: true }).click();
    await searchBox3.fill(newName);
    await searchBox3.press('Enter');
    const newRow = page.locator('.users-table tbody tr', { hasText: newName });
    await expect(newRow).toHaveCount(1);
    await page.getByTestId('users-unassigned').check();
    await expect(newRow).toHaveCount(0);
    await page.getByTestId('users-unassigned').uncheck();
    await expect(newRow).toHaveCount(1);

    await page.getByTestId('nav-logout').click();
    await expect(page).toHaveURL(/\/login$/);
  });
});

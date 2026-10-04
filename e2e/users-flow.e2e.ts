import { expect, test } from '@playwright/test';

test.describe.serial('Users management', () => {
  const stamp = Date.now();
  const teacherEmail = `e2e_teacher_${stamp}@example.org`;
  const teacherName = `E2E Teacher ${stamp}`;
  const teacherPassword = 'password123';

  test('admin creates teacher and sees list', async ({ page }) => {
    // login as admin
    await page.goto('/login');
    await page.getByTestId('auth-email').fill('admin@example.org');
    await page.getByTestId('auth-password').fill('password123');
    await page.getByTestId('auth-submit').click();
    await expect(page).toHaveURL(/^http:\/\/127\.0\.0\.1:4201\/$/);

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

    await page.getByTestId('user-submit').click();
    await expect(page).toHaveURL(/\/users$/);

    // logout
    await page.getByTestId('nav-logout').click();
    await expect(page).toHaveURL(/\/login$/);
  });

  test('created teacher logs in, then admin deactivates, login fails', async ({ page }) => {
    // Teacher logs in
    await page.goto('/login');
    await page.getByTestId('auth-email').fill(teacherEmail);
    await page.getByTestId('auth-password').fill(teacherPassword);
    await page.getByTestId('auth-submit').click();
    await expect(page).toHaveURL(/^http:\/\/127\.0\.0\.1:4201\/$/);

    // Logout
    await page.getByTestId('nav-logout').click();

    // Admin logs in to deactivate
    await page.goto('/login');
    await page.getByTestId('auth-email').fill('admin@example.org');
    await page.getByTestId('auth-password').fill('password123');
    await page.getByTestId('auth-submit').click();

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

    // Teacher tries login again
    await page.getByTestId('auth-email').fill(teacherEmail);
    await page.getByTestId('auth-password').fill(teacherPassword);
    await page.getByTestId('auth-submit').click();

    // Should see error and stay on login
    await expect(page.locator('.auth-error')).toBeVisible();
    await expect(page).toHaveURL(/\/login$/);
  });

  test('admin deletes the teacher and the row disappears', async ({ page }) => {
    await page.goto('/login');
    await page.getByTestId('auth-email').fill('admin@example.org');
    await page.getByTestId('auth-password').fill('password123');
    await page.getByTestId('auth-submit').click();
    await expect(page).toHaveURL(/^http:\/\/127\.0\.0\.1:4201\/$/);

    await page.getByTestId('nav-users').click();
    await expect(page).toHaveURL(/\/users$/);

    const searchBox = page.getByTestId('users-search');
    await searchBox.fill(teacherName);
    await searchBox.press('Enter');
    const teacherRow = page.locator('.users-table tbody tr', { hasText: teacherName });
    await expect(teacherRow).toHaveCount(1);

    await teacherRow.locator('button[data-testid^="delete-user-"]').click();
    await teacherRow.locator('button[data-testid^="confirm-delete-user-"]').click();
    await expect(teacherRow).toHaveCount(0);

    await page.getByTestId('nav-logout').click();
    await expect(page).toHaveURL(/\/login$/);
  });

  test('admin transfers a group-owning teacher to a replacer and deletes', async ({ page }) => {
    const oldName = `E2E Old ${stamp}`;
    const newName = `E2E New ${stamp}`;
    const oldEmail = `e2e_old_${stamp}@example.org`;
    const newEmail = `e2e_new_${stamp}@example.org`;
    const groupName = `RPLC ${stamp}`;

    await page.goto('/login');
    await page.getByTestId('auth-email').fill('admin@example.org');
    await page.getByTestId('auth-password').fill('password123');
    await page.getByTestId('auth-submit').click();
    await expect(page).toHaveURL(/^http:\/\/127\.0\.0\.1:4201\/$/);

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
    const searchBox = page.getByTestId('users-search');
    await searchBox.fill(oldName);
    await searchBox.press('Enter');
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
    await searchBox.fill(oldName);
    await searchBox.press('Enter');
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
    await searchBox.fill(newName);
    await searchBox.press('Enter');
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

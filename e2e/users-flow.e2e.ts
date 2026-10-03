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

  test('admin deletes the teacher and the row disappears', async ({ page }) => {
    await page.goto('/login');
    await page.getByLabel('البريد الإلكتروني', { exact: true }).fill('admin@example.org');
    await page.getByLabel('كلمة المرور', { exact: true }).fill('password123');
    await page.getByRole('button', { name: /دخول/ }).click();
    await expect(page).toHaveURL(/^http:\/\/127\.0\.0\.1:4201\/$/);

    await page.getByRole('link', { name: /المستخدمون/ }).click();
    await expect(page).toHaveURL(/\/users$/);

    const searchBox = page.getByTestId('users-search');
    await searchBox.fill(teacherName);
    await searchBox.press('Enter');
    const teacherRow = page.locator('.users-table tbody tr', { hasText: teacherName });
    await expect(teacherRow).toHaveCount(1);

    await teacherRow.locator('button[data-testid^="delete-user-"]').click();
    await teacherRow.locator('button[data-testid^="confirm-delete-user-"]').click();
    await expect(teacherRow).toHaveCount(0);

    await page.getByRole('button', { name: /خروج/ }).click();
    await expect(page).toHaveURL(/\/login$/);
  });

  test('admin transfers a group-owning teacher to a replacer and deletes', async ({ page }) => {
    const oldName = `E2E Old ${stamp}`;
    const newName = `E2E New ${stamp}`;
    const oldEmail = `e2e_old_${stamp}@example.org`;
    const newEmail = `e2e_new_${stamp}@example.org`;
    const groupName = `RPLC ${stamp}`;

    await page.goto('/login');
    await page.getByLabel('البريد الإلكتروني', { exact: true }).fill('admin@example.org');
    await page.getByLabel('كلمة المرور', { exact: true }).fill('password123');
    await page.getByRole('button', { name: /دخول/ }).click();
    await expect(page).toHaveURL(/^http:\/\/127\.0\.0\.1:4201\/$/);

    // two hifz teachers in center 1
    for (const [name, email] of [
      [oldName, oldEmail],
      [newName, newEmail],
    ]) {
      await page.getByRole('link', { name: /المستخدمون/ }).click();
      await expect(page).toHaveURL(/\/users$/);
      await page.getByRole('link', { name: /إضافة مستخدم/ }).click();
      await expect(page).toHaveURL(/\/users\/new$/);
      await page.getByLabel('الاسم الكامل', { exact: false }).fill(name);
      await page.getByLabel('البريد الإلكتروني', { exact: false }).fill(email);
      await page.getByLabel('كلمة المرور', { exact: false }).fill('password123');
      await page.getByRole('button', { name: 'الصفة' }).click();
      await page.getByRole('option', { name: /معلم/ }).click();
      await page.getByRole('button', { name: 'نوع التعليم' }).click();
      await page.getByRole('option', { name: 'حفظ', exact: true }).click();
      await page.getByRole('button', { name: 'المركز', exact: true }).click();
      await page.getByRole('option', { name: 'مركز النور القرآني' }).click();
      await page.locator('button[type="submit"]').click();
      await expect(page).toHaveURL(/\/users$/);
    }

    // group owned by the old teacher
    await page.getByRole('link', { name: /الحلقات/ }).click();
    await expect(page).toHaveURL(/\/groups$/);
    await page.getByRole('link', { name: /إضافة مجموعة/ }).click();
    await expect(page).toHaveURL(/\/groups\/new$/);
    await page.getByLabel('الحلقة', { exact: true }).fill(groupName);
    await page.getByRole('button', { name: 'المركز', exact: true }).click();
    await page.getByRole('option', { name: 'مركز النور القرآني' }).click();
    await page.getByRole('button', { name: 'المعلم', exact: true }).click();
    await page.getByRole('option', { name: oldName }).click();
    await page.getByRole('button', { name: 'المستوى', exact: true }).click();
    await page.getByRole('option', { name: /المستوى الأول/ }).click();
    await page.getByLabel('الطاقة', { exact: true }).fill('15');
    await page.locator('.day-pick .day-chip', { hasText: 'الجمعة' }).click();
    await page.getByRole('button', { name: /حفظ/ }).click();
    await expect(page).toHaveURL(/\/groups$/);

    // deleting the old teacher is blocked → replacer dialog
    await page.getByRole('link', { name: /المستخدمون/ }).click();
    await expect(page).toHaveURL(/\/users$/);
    const searchBox = page.getByTestId('users-search');
    await searchBox.fill(oldName);
    await searchBox.press('Enter');
    const oldRow = page.locator('.users-table tbody tr', { hasText: oldName });
    await expect(oldRow).toHaveCount(1);
    await oldRow.locator('button[data-testid^="delete-user-"]').click();
    await oldRow.locator('button[data-testid^="confirm-delete-user-"]').click();
    const dialog = page.getByRole('dialog');
    await expect(dialog).toBeVisible();
    await dialog.getByRole('button', { name: /اختيار البديل/ }).click();
    await expect(page).toHaveURL(/\/users\/\d+\/replace$/);

    // pick the new teacher and confirm the transfer
    await page.getByRole('button', { name: 'اختر المعلم البديل' }).click();
    await page.getByRole('option', { name: newName }).click();
    await page.getByRole('button', { name: /نقل وحذف/ }).click();
    await expect(page).toHaveURL(/\/users$/);

    // old teacher is gone
    await searchBox.fill(oldName);
    await searchBox.press('Enter');
    await expect(page.locator('.users-table tbody tr', { hasText: oldName })).toHaveCount(0);

    // the group survived the transfer
    await page.getByRole('link', { name: /الحلقات/ }).click();
    await expect(page).toHaveURL(/\/groups$/);
    const groupSearch = page.getByTestId('groups-search');
    await groupSearch.fill(groupName);
    await groupSearch.press('Enter');
    await expect(page.locator('tbody tr', { hasText: groupName })).toHaveCount(1);

    await page.getByRole('button', { name: /خروج/ }).click();
    await expect(page).toHaveURL(/\/login$/);
  });
});

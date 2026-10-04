import { expect, test } from '@playwright/test';

test.describe.serial('Exams management', () => {
  test('admin creates an exam, edits date and type, then deletes it', async ({ page }) => {
    await page.goto('/login');
    await page.getByLabel('البريد الإلكتروني', { exact: true }).fill('admin@example.org');
    await page.getByLabel('كلمة المرور', { exact: true }).fill('password123');
    await page.getByRole('button', { name: /دخول/ }).click();
    await expect(page).toHaveURL(/^http:\/\/127\.0\.0\.1:4201\/$/);

    // create: pick a seed student, default term_batch + first term + date
    await page.getByRole('link', { name: /الاختبارات/ }).click();
    await expect(page).toHaveURL(/\/exams$/);
    await page.getByRole('link', { name: /اختبار جديد/ }).click();
    await expect(page).toHaveURL(/\/exams\/new$/);
    const studentSearch = page.getByLabel('الطالب', { exact: true });
    await studentSearch.fill('م');
    await studentSearch.press('Enter');
    const pick = page.locator('.pick').first();
    await expect(pick).toBeVisible();
    await pick.click();
    await page.getByRole('button', { name: 'الفصل', exact: true }).click();
    await page.locator('.dd.open [role="option"]').nth(1).click();
    await page.getByLabel('التاريخ', { exact: true }).fill('2026-10-06');
    await page.locator('button[type="submit"]').click();
    await expect(page).toHaveURL(/\/exams\/\d+$/);
    const examId = page.url().match(/\/exams\/(\d+)$/)?.[1];
    expect(examId).toBeTruthy();

    // edit: new date + switch to final (term picker goes away)
    await page.getByLabel('التاريخ', { exact: true }).fill('2026-10-07');
    await page.getByRole('button', { name: 'النوع', exact: true }).click();
    await page.getByRole('option', { name: 'الاختبار النهائي' }).click();
    await page.getByTestId('save-exam-edit').click();
    // heading flips only after PATCH + list reload complete
    await expect(page.getByRole('heading', { name: /الاختبار النهائي/ })).toBeVisible();
    await page.reload();
    await expect(page.getByLabel('التاريخ', { exact: true })).toHaveValue('2026-10-07');
    await expect(page.getByRole('heading', { name: /الاختبار النهائي/ })).toBeVisible();

    // delete: questions cascade, exam leaves the list
    await page.getByTestId('delete-exam').click();
    await page.getByTestId('confirm-delete-exam').click();
    await expect(page).toHaveURL(/\/exams$/);
    await expect(page.locator(`a[href="/exams/${examId}"]`)).toHaveCount(0);

    await page.getByRole('button', { name: /خروج/ }).click();
    await expect(page).toHaveURL(/\/login$/);
  });
});

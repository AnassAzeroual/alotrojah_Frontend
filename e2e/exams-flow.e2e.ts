import { expect, test } from '@playwright/test';
import { apiNames, apiToken } from './api';

test.describe.serial('Exams management', () => {
  test('admin creates a weighted exam, scores full marks, then deletes it', async ({
    page,
    request,
  }) => {
    await page.goto('/login');
    await page.getByTestId('auth-email').fill('admin@example.org');
    await page.getByTestId('auth-password').fill('password123');
    await page.getByTestId('auth-submit').click();
    await expect(page).toHaveURL(/^http:\/\/127\.0\.0\.1:4201\/$/);

    // runtime seed student (immune to renames/re-seeds)
    const token = await apiToken(request);
    const students = await apiNames(request, token, '/students');
    expect(students.length).toBeGreaterThan(0);
    const studentName = students[0];

    // bare exam: default term_batch + first term + date
    await page.getByTestId('nav-exams').click();
    await expect(page).toHaveURL(/\/exams$/);
    await page.getByTestId('exams-new').click();
    await expect(page).toHaveURL(/\/exams\/new$/);
    const studentSearch = page.getByTestId('exam-student-search');
    await studentSearch.fill(studentName);
    await studentSearch.press('Enter');
    const pick = page.locator('.pick').first();
    await expect(pick).toBeVisible();
    await pick.click();
    await page.getByTestId('exam-term').click();
    await page.locator('.dd.open [role="option"]').nth(1).click();
    await page.getByTestId('exam-date').fill('06/10/2026');
    await page.getByTestId('exam-submit').click();
    await expect(page).toHaveURL(/\/exams\/\d+$/);
    const examId = page.url().match(/\/exams\/(\d+)$/)?.[1];
    expect(examId).toBeTruthy();

    // queue a 7+7+6 batch (weights must total exactly 20 to save)
    for (const [no, max] of [
      [1, 7],
      [2, 7],
      [3, 6],
    ]) {
      await page.getByTestId('exam-q-no').fill(String(no));
      await page.getByTestId('exam-q-max').fill(String(max));
      await page.getByTestId('exam-queue').click();
    }
    const draftSave = page.getByTestId('exam-draft-save');
    await expect(draftSave).toBeEnabled();
    await draftSave.click();
    await expect(page.locator('.line .score-input')).toHaveCount(3);

    // full marks on every question → header reads 20/20
    const heroAvg = page.locator('section.hero strong');
    const scores = page.locator('.line .score-input');
    // wait every PATCH (a bare reload would cancel in-flight ones)
    const p1 = page.waitForResponse(
      (r) => r.url().includes('/exam-questions/') && r.request().method() === 'PATCH',
    );
    await scores.nth(0).fill('7');
    await p1;
    const p2 = page.waitForResponse(
      (r) => r.url().includes('/exam-questions/') && r.request().method() === 'PATCH',
    );
    await scores.nth(1).fill('7');
    await p2;
    const p3 = page.waitForResponse(
      (r) => r.url().includes('/exam-questions/') && r.request().method() === 'PATCH',
    );
    await scores.nth(2).fill('6');
    await p3;
    await expect(heroAvg).toHaveText('20/ 20');
    await page.reload();
    await expect(page.locator('.line .score-input').nth(0)).toHaveValue('7');
    await expect(heroAvg).toHaveText('20/ 20');

    // date edit persists after reload
    await page.getByTestId('exam-date').fill('07/10/2026');
    const patched = page.waitForResponse(
      (r) => r.url().includes(`/exams/${examId}`) && r.request().method() === 'PATCH',
    );
    await page.getByTestId('save-exam-edit').click();
    await patched;
    await page.reload();
    await expect(page.getByTestId('exam-date')).toHaveValue('07/10/2026');

    // delete: questions cascade, exam leaves the list
    await page.getByTestId('delete-exam').click();
    await page.getByTestId('confirm-delete-exam').click();
    await expect(page).toHaveURL(/\/exams$/);
    await expect(page.locator(`a[href="/exams/${examId}"]`)).toHaveCount(0);

    await page.getByTestId('nav-logout').click();
    await expect(page).toHaveURL(/\/login$/);
  });
});

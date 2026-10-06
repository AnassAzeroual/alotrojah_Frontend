import { expect, test } from '@playwright/test';
import { apiNames, apiToken, adminLogin } from './api';

test.describe.serial('Exam question cap (roadmap S23 / F4 silent dead queue button)', () => {
  test('F4: queueing a score above the question max is silently dropped', async ({
    page,
    request,
  }) => {
    await adminLogin(page);

    // runtime seed student (immune to renames/re-seeds)
    const token = await apiToken(request);
    const students = await apiNames(request, token, '/students');
    expect(students.length).toBeGreaterThan(0);
    const studentName = students[0];

    // bare exam: term + date
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
    await page.getByTestId('exam-date').fill('2026-10-06');
    await page.getByTestId('exam-submit').click();
    await expect(page).toHaveURL(/\/exams\/\d+$/);
    const examId = page.url().match(/\/exams\/(\d+)$/)?.[1];
    expect(examId).toBeTruthy();

    // F4: score 18 on a max-15 question → addQuestion() returns silently:
    // nothing queued, no banner, no message; the form just stays as-is.
    await page.getByTestId('exam-q-no').fill('1');
    await page.getByTestId('exam-q-max').fill('15');
    await page.getByTestId('exam-q-score').fill('18');
    await page.getByTestId('exam-queue').click();
    await expect(page.locator('.draft-list li')).toHaveCount(0);
    await expect(page.locator('.banner.danger, .field-error, .req-error')).toHaveCount(0);

    // a legal score queues fine — the button itself is not broken
    await page.getByTestId('exam-q-score').fill('14');
    await page.getByTestId('exam-queue').click();
    await expect(page.locator('.draft-list li')).toHaveCount(1);

    // cleanup: delete the exam (draft never saved — cascades anyway)
    await page.getByTestId('delete-exam').click();
    await page.getByTestId('confirm-delete-exam').click();
    await expect(page).toHaveURL(/\/exams$/);
    await expect(page.locator(`a[href="/exams/${examId}"]`)).toHaveCount(0);
  });
});

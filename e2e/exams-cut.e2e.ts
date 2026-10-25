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

    // bare exam: /exams is the builder; default term_batch + auto first term
    await page.getByTestId('nav-exams').click();
    await expect(page).toHaveURL(/\/exams$/);
    await page.locator('[data-testid^="exam-group-card-"]').first().click();
    await expect(page.getByTestId('exam-pupil-picker')).toBeVisible();
    await page.locator('[data-testid^="exam-pupil-card-"]').first().click();
    await expect(page.getByTestId('exam-student-card')).toBeVisible();
    await page.getByTestId('exam-date').fill('06/10/2026');
    // Generic live sheet (paper models cover term/final; weekly keeps weights).
    await page.getByTestId('exam-test-weekly').click();
    await page.getByTestId('exam-submit').click();
    await expect(page.getByTestId('exam-live')).toBeVisible();

    // A score above its weight blocks Finish & save.
    await page.getByTestId('live-q-prompt-0').fill('Question 1');
    await page.getByTestId('live-q-weight-0').fill('15');
    await page.getByTestId('live-q-score-0').fill('18');
    await expect(page.getByTestId('exam-live-finish')).toBeDisabled();

    // Legal score + a second question completing the 20-point weight.
    await page.getByTestId('live-q-score-0').fill('14');
    await page.getByTestId('live-add-question').click();
    await page.getByTestId('live-q-prompt-1').fill('Question 2');
    await page.getByTestId('live-q-weight-1').fill('5');
    await page.getByTestId('live-q-score-1').fill('5');
    await expect(page.getByTestId('exam-live-finish')).toBeEnabled();
    await page.getByTestId('exam-live-finish').click();
    await expect(page).toHaveURL(/\/exams\/\d+$/);
    const examId = page.url().match(/\/exams\/(\d+)$/)?.[1];
    expect(examId).toBeTruthy();

    // cleanup: delete the finished exam (questions cascade)
    await page.getByTestId('delete-exam').click();
    await page.getByTestId('confirm-delete-exam').click();
    await expect(page).toHaveURL(/\/exams$/);
    await expect(page.locator(`a[href="/exams/${examId}"]`)).toHaveCount(0);
  });
});

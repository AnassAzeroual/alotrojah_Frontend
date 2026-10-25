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

    // start a live 7+7+6 test and finish it atomically
    for (const [i, max, score] of [
      [0, 7, 7],
      [1, 7, 7],
      [2, 6, 6],
    ] as const) {
      if (i > 0) await page.getByTestId('live-add-question').click();
      await page.getByTestId(`live-q-prompt-${i}`).fill(`Question ${i + 1}`);
      await page.getByTestId(`live-q-weight-${i}`).fill(String(max));
      await page.getByTestId(`live-q-score-${i}`).fill(String(score));
    }
    await expect(page.getByTestId('live-weights-total')).toContainText('20');
    await page.getByTestId('exam-live-finish').click();
    await expect(page).toHaveURL(/\/exams\/\d+$/);
    const examId = page.url().match(/\/exams\/(\d+)$/)?.[1];
    expect(examId).toBeTruthy();
    await expect(page.locator('.line .score-input')).toHaveCount(3);
    await expect(page.locator('section.hero strong')).toHaveText('20/ 20');
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

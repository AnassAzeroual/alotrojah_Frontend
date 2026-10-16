import { expect, test } from '@playwright/test';
import { adminLogin, apiToken } from './api';

test.describe.serial('Weekly exam sheet', () => {
  test('admin runs a weekly sheet for the first group and saves it', async ({ page, request }) => {
    await adminLogin(page);

    await page.getByTestId('nav-exams').click();
    await expect(page).toHaveURL(/\/exams$/);
    await page.getByTestId('exams-weekly').click();
    await expect(page).toHaveURL(/\/exams\/weekly$/);

    // first group option (seed group 1 carries pupils)
    await page.getByTestId('weekly-group').click();
    await page.locator('.dd.open [role="option"]').first().click();

    // rows land once the template resolves
    const firstRow = page.locator('tbody tr').first();
    await expect(firstRow).toBeVisible();

    if ((await firstRow.getByLabel('الحزب').count()) > 0) {
      await firstRow.getByLabel('الحزب').fill('1');
      await firstRow.getByLabel('الثمن').fill('1');
    } else {
      await firstRow.getByTestId(/^weekly-surah-/).click();
      await page.locator('.dd.open [role="option"]').first().click();
      await firstRow.getByLabel('من الآية').fill('1');
      await firstRow.getByLabel('إلى الآية').fill('2');
    }
    // score columns follow the two portion inputs (module count varies)
    const inputs = firstRow.locator('td input[type="number"]');
    const n = await inputs.count();
    for (let i = 2; i < n; i++) {
      await inputs.nth(i).fill('1');
    }

    const saved = page.waitForResponse(
      (r) => r.url().includes('/exams/weekly-batch') && r.request().method() === 'POST',
    );
    await page.getByTestId('weekly-save').click();
    const res = await saved;
    expect(res.ok()).toBe(true);
    const body = await res.json();
    expect(body.data.created).toBeGreaterThanOrEqual(1);
    await expect(page.getByTestId('weekly-success')).toBeVisible();

    // self-cleaning: same-day re-runs would trip the duplicate guard
    const token = await apiToken(request);
    for (const id of body.data.exam_ids as number[]) {
      const del = await request.delete(`http://127.0.0.1:8000/api/v1/exams/${id}`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      expect(del.ok()).toBe(true);
    }
  });
});

import { expect, test } from '@playwright/test';
import { loginAs } from './api';

const TEACHER = 'teach1a.nour@example.org';
const STUDENT = 'أحمد بن يوسف';

async function pickSession1(page: import('@playwright/test').Page): Promise<void> {
  await page.getByRole('button', { name: 'الحلقة', exact: true }).click();
  await page.locator('.dd.open [role="option"]').nth(1).click();
  await page.getByRole('button', { name: 'الأسبوع', exact: true }).click();
  await page.locator('.dd.open [role="option"]').nth(1).click();
  await page.getByRole('button', { name: 'الحصة', exact: true }).click();
  await page.locator('.dd.open [role="option"]').nth(1).click();
}

test.describe.serial('Daily entry (roadmap S17 attendance, S19 goals, S18 silent cap)', () => {
  test('S17: attendance toggle persists and restores', async ({ page }) => {
    await loginAs(page, TEACHER, 'password123');
    await expect(page).toHaveURL(/^http:\/\/127\.0\.0\.1:4201\/$/);
    await page.goto('/entry');
    await expect(page).toHaveURL(/\/entry$/);
    await pickSession1(page);

    const row = page.locator('app-attendance-grid .line', { hasText: STUDENT });
    await expect(row).toHaveCount(1);

    // seed has this session recorded as present — flip to late, save
    const late = row.getByRole('button', { name: 'متأخر' });
    await late.click();
    await expect(late).toHaveClass(/\bon\b/);
    const savedLate = page.waitForResponse(
      (r) => r.url().includes('attendance') && r.request().method() !== 'GET',
    );
    await page.getByRole('button', { name: 'حفظ الحضور' }).click();
    await savedLate;

    // persists after reload
    await page.reload();
    await pickSession1(page);
    await expect(
      page
        .locator('app-attendance-grid .line', { hasText: STUDENT })
        .getByRole('button', { name: 'متأخر' }),
    ).toHaveClass(/\bon\b/);

    // restore present (drift-safe)
    const row2 = page.locator('app-attendance-grid .line', { hasText: STUDENT });
    await row2.getByRole('button', { name: 'حاضر' }).click();
    const savedBack = page.waitForResponse(
      (r) => r.url().includes('attendance') && r.request().method() !== 'GET',
    );
    await page.getByRole('button', { name: 'حفظ الحضور' }).click();
    await savedBack;
    await page.reload();
    await pickSession1(page);
    await expect(
      page
        .locator('app-attendance-grid .line', { hasText: STUDENT })
        .getByRole('button', { name: 'حاضر' }),
    ).toHaveClass(/\bon\b/);
  });

  test('S19: weekly goal target persists and restores', async ({ page }) => {
    await loginAs(page, TEACHER, 'password123');
    await expect(page).toHaveURL(/^http:\/\/127\.0\.0\.1:4201\/$/);
    await page.goto('/entry');
    await pickSession1(page);

    const row = page.locator('app-goal-list .line', { hasText: STUDENT });
    const input = row.locator('input[type="text"]');
    const original = await input.inputValue();
    const probe = 'حفظ سورة الملك كاملة للاختبار';

    await input.fill(probe);
    const saved = page.waitForResponse(
      (r) => r.url().includes('goal') && r.request().method() !== 'GET',
    );
    await row.getByRole('button', { name: 'حفظ', exact: true }).click();
    await saved;

    await page.reload();
    await pickSession1(page);
    await expect(
      page.locator('app-goal-list .line', { hasText: STUDENT }).locator('input[type="text"]'),
    ).toHaveValue(probe);

    // restore (original may be empty — that's fine, it round-trips)
    const row2 = page.locator('app-goal-list .line', { hasText: STUDENT });
    await row2.locator('input[type="text"]').fill(original);
    const restored = page.waitForResponse(
      (r) => r.url().includes('goal') && r.request().method() !== 'GET',
    );
    await row2.getByRole('button', { name: 'حفظ', exact: true }).click();
    await restored;
    await page.reload();
    await pickSession1(page);
    await expect(
      page.locator('app-goal-list .line', { hasText: STUDENT }).locator('input[type="text"]'),
    ).toHaveValue(original);
  });

  test('S18/F1: over-cap score save fails with zero user feedback', async ({ page }) => {
    await loginAs(page, TEACHER, 'password123');
    await expect(page).toHaveURL(/^http:\/\/127\.0\.0\.1:4201\/$/);
    await page.goto('/entry');
    await pickSession1(page);

    const row = page.locator('app-score-sheet .line', { hasText: STUDENT });
    const total = row.locator('strong.total');
    await expect(total).toHaveText(/18\.2/); // seed: 13.2 + 3 + 2

    // module 1 is capped at 14; typing 15 shows a legal total of 20
    const module1 = row.locator('input').first();
    await module1.fill('15');
    await expect(total).toHaveText(/20/);

    const saveBtn = page.getByRole('button', { name: 'حفظ النقاط' });
    const resp = page.waitForResponse(
      (r) => r.url().includes('score') && r.request().method() !== 'GET',
    );
    await saveBtn.click();
    expect((await resp).status()).toBe(422);

    // F1: nothing tells the teacher it failed — no banner, no field error,
    // no server message; the button just becomes clickable again.
    await expect(page.locator('.banner.danger, .field-error, .req-error')).toHaveCount(0);
    await expect(page.getByText(/يجب أن يبقى 20/)).toHaveCount(0);
    await expect(saveBtn).toBeEnabled();

    // and the bad value was NOT saved
    await page.reload();
    await pickSession1(page);
    await expect(
      page.locator('app-score-sheet .line', { hasText: STUDENT }).locator('input').first(),
    ).toHaveValue(/13\.2/);
  });
});

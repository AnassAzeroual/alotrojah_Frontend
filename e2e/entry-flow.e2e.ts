import { expect, test } from '@playwright/test';
import { loginAs } from './api';

const TEACHER = 'teach1a.nour@example.org';
const STUDENT = 'أحمد بن يوسف';

async function pickSession1(page: import('@playwright/test').Page): Promise<void> {
  await page.getByRole('button', { name: 'القسم', exact: true }).click();
  await page.locator('.dd.open [role="option"]').nth(1).click();
  await page.getByRole('button', { name: 'الأسبوع', exact: true }).click();
  await page.locator('.dd.open [role="option"]').nth(1).click();
  await page.getByRole('button', { name: 'الحصة', exact: true }).click();
  await page.locator('.dd.open [role="option"]').nth(1).click();
}

test.describe.serial('Daily entry (roadmap S17 attendance, S19 goals, S18 over-cap errors)', () => {
  test('S17: attendance toggle persists and restores', async ({ page }) => {
    await loginAs(page, TEACHER, 'password123');
    await expect(page).toHaveURL(/^http:\/\/127\.0\.0\.1:4201\/$/);
    await page.goto('/entry');
    await expect(page).toHaveURL(/\/entry$/);
    await pickSession1(page);

    const row = page.locator('app-entry-table .line', { hasText: STUDENT });
    await expect(row).toHaveCount(1);

    // seed has this session recorded as present — flip to late, save the row
    const att = row.locator('.dd-btn');
    await expect(att).toContainText('حاضر');
    await att.click();
    await row.locator('.dd.open [role="option"]', { hasText: 'متأخر' }).click();
    await expect(att).toContainText('متأخر');
    const savedLate = page.waitForResponse(
      (r) => r.url().includes('attendance') && r.request().method() !== 'GET',
    );
    await page.getByRole('button', { name: 'حفظ', exact: true }).click();
    await savedLate;

    // persists after reload
    await page.reload();
    await pickSession1(page);
    await expect(
      page.locator('app-entry-table .line', { hasText: STUDENT }).locator('.dd-btn'),
    ).toContainText('متأخر');

    // restore present (drift-safe)
    const row2 = page.locator('app-entry-table .line', { hasText: STUDENT });
    const att2 = row2.locator('.dd-btn');
    await att2.click();
    await row2.locator('.dd.open [role="option"]', { hasText: 'حاضر' }).click();
    const savedBack = page.waitForResponse(
      (r) => r.url().includes('attendance') && r.request().method() !== 'GET',
    );
    await page.getByRole('button', { name: 'حفظ', exact: true }).click();
    await savedBack;
    await page.reload();
    await pickSession1(page);
    await expect(
      page.locator('app-entry-table .line', { hasText: STUDENT }).locator('.dd-btn'),
    ).toContainText('حاضر');
  });

  test('S19: weekly goal target persists and restores', async ({ page }) => {
    await loginAs(page, TEACHER, 'password123');
    await expect(page).toHaveURL(/^http:\/\/127\.0\.0\.1:4201\/$/);
    await page.goto('/entry');
    await pickSession1(page);

    const row = page.locator('app-entry-table .line', { hasText: STUDENT });
    const input = row.locator('input[type="text"]');
    const original = await input.inputValue();
    const probe = 'حفظ سورة الملك كاملة للاختبار';

    await input.fill(probe);
    const saved = page.waitForResponse(
      (r) => r.url().includes('goal') && r.request().method() !== 'GET',
    );
    await page.getByRole('button', { name: 'حفظ', exact: true }).click();
    await saved;

    await page.reload();
    await pickSession1(page);
    await expect(
      page.locator('app-entry-table .line', { hasText: STUDENT }).locator('input[type="text"]'),
    ).toHaveValue(probe);

    // restore (original may be empty — that's fine, it round-trips)
    const row2 = page.locator('app-entry-table .line', { hasText: STUDENT });
    await row2.locator('input[type="text"]').fill(original);
    const restored = page.waitForResponse(
      (r) => r.url().includes('goal') && r.request().method() !== 'GET',
    );
    await page.getByRole('button', { name: 'حفظ', exact: true }).click();
    await restored;
    await page.reload();
    await pickSession1(page);
    await expect(
      page.locator('app-entry-table .line', { hasText: STUDENT }).locator('input[type="text"]'),
    ).toHaveValue(original);
  });

  test('S18: over-cap score save surfaces a banner and the refused cell (F1 fixed)', async ({
    page,
  }) => {
    await loginAs(page, TEACHER, 'password123');
    await expect(page).toHaveURL(/^http:\/\/127\.0\.0\.1:4201\/$/);
    await page.goto('/entry');
    await pickSession1(page);

    const row = page.locator('app-entry-table .line', { hasText: STUDENT });
    const total = row.locator('strong.total');
    await expect(total).toHaveText(/18\.2/); // seed: 13.2 + 3 + 2

    // module 1 is capped at 14; typing 15 shows a legal total of 20
    const module1 = row.locator('input').first();
    await module1.fill('15');
    await expect(total).toHaveText(/20/);

    const saveBtn = page.getByRole('button', { name: 'حفظ', exact: true });
    const resp = page.waitForResponse(
      (r) => r.url().includes('score') && r.request().method() !== 'GET',
    );
    await saveBtn.click();
    expect((await resp).status()).toBe(422);

    // FIXED (was F1 silent): the teacher is told — banner plus the refused
    // cell flagged; the button is usable again and nothing typed is lost.
    await expect(row.getByTestId('row-banner')).toBeVisible();
    await expect(row.locator('.field-error')).toHaveCount(1);
    await expect(saveBtn).toBeEnabled();
    await expect(module1).toHaveValue('15');

    // and the bad value was NOT saved
    await page.reload();
    await pickSession1(page);
    await expect(
      page.locator('app-entry-table .line', { hasText: STUDENT }).locator('input').first(),
    ).toHaveValue(/13\.2/);
  });
});

import { expect, test } from '@playwright/test';
import { adminLogin, loginAs } from './api';

const MURAJAA = 'murajaa.nour@example.org';
const STUDENT = 'أحمد بن يوسف';

async function pickStudent(page: import('@playwright/test').Page): Promise<void> {
  const search = page.getByRole('searchbox', { name: 'الطالب' });
  await search.fill(STUDENT);
  await search.blur(); // (change)-bound
  const picks = page.locator('.pick');
  await expect(picks).toHaveCount(1);
  await picks.first().click();
}

test.describe
  .serial('Review cycles (roadmap S20, F3 dead submit, F2 teacher-visible delete)', () => {
  test('murajaa teacher: seed cycle, create W1–W3, F3 4-week span is a silent dead button', async ({
    page,
  }) => {
    await loginAs(page, MURAJAA, 'password123');
    await expect(page).toHaveURL(/^http:\/\/127\.0\.0\.1:4201\/$/);
    await page.goto('/reviews');
    await expect(page).toHaveURL(/\/reviews$/);
    await pickStudent(page);

    const cyclesCard = page.locator('.card', {
      has: page.getByRole('heading', { name: 'الدورات' }),
    });
    await expect(cyclesCard.locator('.line', { hasText: 'W1–W2' })).toHaveCount(1);

    // F2: the cycle delete button is NOT gated by canManage — a plain teacher
    // sees it on the seed row (scoped to W1–W2 so residue rows don't inflate)
    await expect(
      cyclesCard.locator('.line', { hasText: 'W1–W2' }).getByRole('button', { name: 'حذف' }),
    ).toHaveCount(1);

    // interrupted earlier runs can leave a W1–W3 row behind — assert deltas
    const lines = cyclesCard.locator('.line');
    const w13 = cyclesCard.locator('.line', { hasText: 'W1–W3' });
    const linesBefore = await lines.count();
    const w13Before = await w13.count();

    // S20: create a valid 3-week cycle
    await page.getByRole('button', { name: 'الفصل', exact: true }).click();
    await page.locator('.dd.open [role="option"]').nth(1).click();
    await page.getByLabel('من الأسبوع').fill('1');
    await page.getByLabel('إلى الأسبوع').fill('3');
    await page.getByLabel('النقطة').fill('15');
    const created = page.waitForResponse(
      (r) => r.url().includes('review') && r.request().method() === 'POST',
    );
    await page.locator('form').getByRole('button', { name: 'حفظ', exact: true }).click();
    await created;
    await expect(w13).toHaveCount(w13Before + 1);
    await expect(lines).toHaveCount(linesBefore + 1);

    // F3: a 4-week span is silently dropped — button stays live, no message, no row.
    // The successful save reset the whole form (reviews.page.ts submit next handler),
    // so the required term must be re-picked before the second attempt.
    await page.getByRole('button', { name: 'الفصل', exact: true }).click();
    await page.locator('.dd.open [role="option"]').nth(1).click();
    await page.getByLabel('من الأسبوع').fill('1');
    await page.getByLabel('إلى الأسبوع').fill('4');
    await page.getByLabel('النقطة').fill('16');
    const submit = page.locator('form').getByRole('button', { name: 'حفظ', exact: true });
    await submit.click();
    await expect(page.locator('.banner.danger, .field-error, .req-error')).toHaveCount(0);
    await expect(submit).toBeEnabled();
    await expect(lines).toHaveCount(linesBefore + 1);
  });

  test('admin cleans up the W1–W3 cycle (S21: delete works for admin)', async ({ page }) => {
    await adminLogin(page);
    await page.goto('/reviews');
    await pickStudent(page);

    const cyclesCard = page.locator('.card', {
      has: page.getByRole('heading', { name: 'الدورات' }),
    });
    const rows = cyclesCard.locator('.line', { hasText: 'W1–W3' });
    // an interrupted earlier run may have left residue rows — delete them all
    await expect.poll(async () => rows.count()).toBeGreaterThanOrEqual(1);
    let remaining = await rows.count();
    while (remaining > 0) {
      const deleted = page.waitForResponse(
        (r) => r.url().includes('review') && r.request().method() === 'DELETE',
      );
      await rows.first().getByRole('button', { name: 'حذف' }).click();
      await deleted;
      remaining -= 1;
      await expect(rows).toHaveCount(remaining);
    }
    await expect(cyclesCard.locator('.line', { hasText: 'W1–W2' })).toHaveCount(1);
  });
});

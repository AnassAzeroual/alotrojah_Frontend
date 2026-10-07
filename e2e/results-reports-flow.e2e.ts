import { expect, test } from '@playwright/test';
import { adminLogin } from './api';

const STUDENT = 'أحمد بن يوسف';

async function pickStudent(page: import('@playwright/test').Page): Promise<void> {
  const search = page.getByRole('searchbox', { name: 'الطالب' });
  await search.fill(STUDENT);
  await search.blur(); // (change)-bound
  const picks = page.locator('.pick');
  await expect(picks).toHaveCount(1);
  await picks.first().click();
}

test.describe.serial('Term results & reports (roadmap S25, S26, S27)', () => {
  test('S25: load existing term result, upsert a change, restore the seed value', async ({
    page,
  }) => {
    await adminLogin(page);
    await page.goto('/results/term');
    await expect(page).toHaveURL(/\/results\/term$/);
    await pickStudent(page);

    await page.getByRole('button', { name: 'الفصل', exact: true }).click();
    await page.locator('.dd.open [role="option"]').nth(1).click();
    await page.getByRole('button', { name: 'تحميل الموجودة' }).click();

    // seed: hifz 19.00, murajaa 18.80, exam 17.60, avg 18.47, honor تشجيع
    await expect(page.getByText('18.47')).toBeVisible();
    // honor also appears in the honor-form dropdown after fill() — scope to the badge
    await expect(page.locator('app-status-badge').getByText('تشجيع')).toBeVisible();

    const hifz = page.locator('form').getByLabel('الحفظ', { exact: true });
    await expect(hifz).toHaveValue('19');

    // change + persist
    await hifz.fill('18');
    const saved = page.waitForResponse(
      (r) => r.url().includes('term-results') && r.request().method() !== 'GET',
    );
    await page.locator('form').getByRole('button', { name: 'حفظ', exact: true }).click();
    await saved;

    await page.reload();
    await pickStudent(page);
    await page.getByRole('button', { name: 'الفصل', exact: true }).click();
    await page.locator('.dd.open [role="option"]').nth(1).click();
    await page.getByRole('button', { name: 'تحميل الموجودة' }).click();
    await expect(page.locator('form').getByLabel('الحفظ', { exact: true })).toHaveValue('18');

    // restore the seed value (drift-safe)
    await page.locator('form').getByLabel('الحفظ', { exact: true }).fill('19');
    const restored = page.waitForResponse(
      (r) => r.url().includes('term-results') && r.request().method() !== 'GET',
    );
    await page.locator('form').getByRole('button', { name: 'حفظ', exact: true }).click();
    await restored;

    await page.reload();
    await pickStudent(page);
    await page.getByRole('button', { name: 'الفصل', exact: true }).click();
    await page.locator('.dd.open [role="option"]').nth(1).click();
    await page.getByRole('button', { name: 'تحميل الموجودة' }).click();
    await expect(page.locator('form').getByLabel('الحفظ', { exact: true })).toHaveValue('19');
  });

  test('S26: term report renders for the picked student and prints without hanging', async ({
    page,
  }) => {
    await adminLogin(page);
    await page.goto('/reports/term');
    await expect(page).toHaveURL(/\/reports\/term$/);
    await pickStudent(page);
    await page.getByRole('button', { name: 'الفصل', exact: true }).click();
    await page.locator('.dd.open [role="option"]').nth(1).click();

    const sheet = page.locator('.print-sheet');
    await expect(sheet).toBeVisible();
    await expect(sheet).toContainText(STUDENT);

    // stub window.print so the headless run can't block on the print dialog
    await page.evaluate(() => {
      window.print = () => {};
    });
    await page.getByRole('button', { name: 'طباعة' }).click();
    await expect(sheet).toBeVisible();
  });

  test('S27: season report spans terms; admin dashboard shows all centers', async ({ page }) => {
    await adminLogin(page);

    // season report (not in nav — reachable directly)
    await page.goto('/reports/season');
    await expect(page).toHaveURL(/\/reports\/season$/);
    await pickStudent(page);
    const seasonSheet = page.locator('.print-sheet');
    await expect(seasonSheet).toBeVisible();
    await expect(seasonSheet).toContainText('T1');

    // dashboard: KPIs + rows aggregated across every center
    await page.getByTestId('nav-dashboard').click();
    await expect(page).toHaveURL(/^http:\/\/127\.0\.0\.1:4201\/$/);
    await expect(page.locator('.kpi')).toHaveCount(4);
    const rows = page.locator('tbody tr');
    await expect.poll(async () => rows.count(), { timeout: 15000 }).toBeGreaterThanOrEqual(5);
  });
});

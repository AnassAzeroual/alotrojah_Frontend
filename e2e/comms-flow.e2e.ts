import { expect, test } from '@playwright/test';
import { adminLogin, loginAs } from './api';

const TEACH_B = 'teach1b.nour@example.org';
const TEACH_A = 'teach1a.nour@example.org';
const TEACH_C = 'teach1c.nour@example.org';

test.describe.serial('Comms (roadmap S28 authorship, S29 delegation, S30 wa.me queue)', () => {
  test('S28: news edit pencils follow authorship — 0 for non-author, 3 for admin', async ({
    page,
  }) => {
    await loginAs(page, TEACH_B, 'password123');
    await expect(page).toHaveURL(/^http:\/\/127\.0\.0\.1:4201\/$/);
    await page.goto('/news');
    await expect(page).toHaveURL(/\/news$/);
    // seed announcements are authored by admin/sup1/teach1a — teach1b authored none
    await expect(page.getByTestId('news-edit')).toHaveCount(0);

    await page.getByTestId('nav-logout').click();
    await expect(page).toHaveURL(/\/login$/);
    await adminLogin(page);
    await page.goto('/news');
    await expect(page.getByTestId('news-edit')).toHaveCount(3);
  });

  test('S29: teacher generates a delegation link; another teacher redeems it once', async ({
    page,
    browser,
  }) => {
    await loginAs(page, TEACH_A, 'password123');
    await expect(page).toHaveURL(/^http:\/\/127\.0\.0\.1:4201\/$/);
    await page.goto('/delegate');
    await expect(page).toHaveURL(/\/delegate$/);

    await page.getByRole('button', { name: 'القسم', exact: true }).click();
    await page.locator('.dd.open [role="option"]').nth(1).click();
    await page.getByRole('button', { name: 'المدة (دقائق)', exact: true }).click();
    await page.locator('.dd.open [role="option"]', { hasText: '60' }).click();
    const generated = page.waitForResponse(
      (r) => r.url().includes('delegations') && r.request().method() === 'POST',
    );
    await page.getByRole('button', { name: 'توليد الرابط' }).click();
    await generated;

    const linkBox = page.locator('p.link');
    await expect(linkBox).toBeVisible();
    const link = (await linkBox.innerText()).trim();
    // the backend emits an ABSOLUTE link (APP_URL origin = the manual dev
    // server) — swap to the relative path so the test origin applies
    const parsed = new URL(link);
    const url = `${parsed.pathname}${parsed.search}`;
    expect(url).toContain('/delegate/redeem?token=');

    // redeem in a fresh browser session as another teacher of the same center
    const ctx = await browser.newContext();
    const p2 = await ctx.newPage();
    await loginAs(p2, TEACH_C, 'password123');
    await expect(p2).toHaveURL(/^http:\/\/127\.0\.0\.1:4201\/$/);
    await p2.goto(url);
    await expect(p2.getByText('تم منح الدخول للقسم')).toBeVisible();

    // the token binds to the FIRST redeeming teacher; the same teacher
    // re-entering is idempotently re-granted (not refused)
    await p2.goto(url);
    await expect(p2.getByText('تم منح الدخول للقسم')).toBeVisible();
    await ctx.close();

    // a DIFFERENT teacher is refused (403 'Link bound to another teacher.')
    const ctx2 = await browser.newContext();
    const p3 = await ctx2.newPage();
    await loginAs(p3, TEACH_B, 'password123');
    await expect(p3).toHaveURL(/^http:\/\/127\.0\.0\.1:4201\/$/);
    const refused = p3.waitForResponse(
      (r) => r.url().includes('/delegations/redeem') && r.status() === 403,
    );
    await p3.goto(url);
    await refused;
    // F6: the 403 lands but result.value() reads an errored resource (throws
    // ResourceValueError) — change detection crashes and the spinner never
    // flips to the delegation.invalid empty-state. Assert the actual freeze.
    await p3.waitForTimeout(1500);
    await expect(p3.locator('app-spinner')).toBeVisible();
    await expect(p3.getByText('الرابط غير صالح أو منتهي')).toHaveCount(0);
    await ctx2.close();

    // NOTE: the delegation row stays in teach1a's list (not revoked) — residue by design.
  });

  test('S30: admin queues a wa.me message, marks it sent, deletes it', async ({ page }) => {
    await adminLogin(page);
    await page.goto('/notifications');
    await expect(page).toHaveURL(/\/notifications$/);

    await page.getByLabel('رقم الهاتف').fill('+212612345678');
    await page.getByLabel('الرسالة').fill('رسالة اختبار آلية من سكربت — يمكن حذفها');
    const queued = page.waitForResponse(
      (r) => r.url().includes('notification') && r.request().method() === 'POST',
    );
    await page.getByRole('button', { name: 'إضافة', exact: true }).click();
    await queued;

    const card = page.locator('.card.line', { hasText: '+212612345678' });
    await expect(card).toHaveCount(1);
    await expect(card.locator('a[href^="https://wa.me/"]')).toBeVisible();
    await expect(card).toContainText('في الانتظار');

    await card.getByRole('button', { name: 'أُرسلت' }).click();
    await expect(card).toContainText('أُرسلت');

    await card.getByRole('button', { name: 'حذف', exact: true }).click();
    await expect(page.locator('.card.line', { hasText: '+212612345678' })).toHaveCount(0);
  });
});

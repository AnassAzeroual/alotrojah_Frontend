import { expect, test, type Page } from '@playwright/test';
import { loginAs, studentSection } from './api';

const TEACHER = 'teach1a.nour@example.org';
const STUDENT = 'أحمد بن يوسف';

// The card flow is pure navigation. The app zeroes every duration (and drops
// the `.choice` hover lift) under `prefers-reduced-motion: reduce`, so pin it
// here: a 3px hover transition can otherwise leave a card click "not stable"
// mid-flight and burn the whole 60s timeout.
test.use({ reducedMotion: 'reduce' });

/**
 * Walk the 3-step card flow (section → week → session) down to the seeded
 * score sheet. The toolbar dropdowns this helper used to click (القسم /
 * الأسبوع / الحصة) were removed when the card flow landed (25c7624), and the
 * section grid's order is not stable — the shared verify DB accumulates E2E
 * sections — so the section is resolved from the API and the week/session are
 * content-picked by their seeded global numbers (1).
 */
async function openSeedSheet(page: Page, section: string): Promise<void> {
  await page.locator('.group-choice', { hasText: section }).click();

  const week = page
    .locator('.week-choice')
    .filter({ has: page.locator('.ltr-num', { hasText: /^1$/ }) });
  await expect(week).toHaveCount(1);
  await week.click();

  const session = page
    .locator('.session-choice')
    .filter({ has: page.locator('.ltr-num', { hasText: /^1$/ }) });
  await expect(session).toHaveCount(1);
  await session.click();

  await expect(page.locator('app-entry-table .line', { hasText: STUDENT })).toHaveCount(1);
}

test.describe.serial('Daily entry (roadmap S17 attendance, S19 goals, S18 over-cap errors)', () => {
  /** Section that owns the seeded pupil — resolved at runtime, never hardcoded. */
  let section: string;

  test.beforeEach(async ({ request }) => {
    section = (await studentSection(request, STUDENT, TEACHER)).name;
  });

  test('S17: attendance toggle persists and restores', async ({ page }) => {
    await loginAs(page, TEACHER, 'password123');
    await expect(page).toHaveURL(/^http:\/\/127\.0\.0\.1:4201\/$/);
    await page.goto('/entry');
    await expect(page).toHaveURL(/\/entry$/);
    await openSeedSheet(page, section);

    const row = page.locator('app-entry-table .line', { hasText: STUDENT });

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
    await openSeedSheet(page, section);
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
    await openSeedSheet(page, section);
    await expect(
      page.locator('app-entry-table .line', { hasText: STUDENT }).locator('.dd-btn'),
    ).toContainText('حاضر');
  });

  test('S19: weekly goal target persists and restores', async ({ page }) => {
    await loginAs(page, TEACHER, 'password123');
    await expect(page).toHaveURL(/^http:\/\/127\.0\.0\.1:4201\/$/);
    await page.goto('/entry');
    await openSeedSheet(page, section);

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
    await openSeedSheet(page, section);
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
    await openSeedSheet(page, section);
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
    await openSeedSheet(page, section);

    const row = page.locator('app-entry-table .line', { hasText: STUDENT });
    const total = row.locator('strong.total');
    await expect(total).toHaveText(/^18\.2/); // seed: 13.2 + 3 + 2

    // hifz (الحفظ) is capped at 14; typing 15 lifts the total to 20. Anchor the
    // total assert: the rendered label ends in the literal "/20", so a bare
    // /20/ passes even with an unchanged sum. Target the cell by module name:
    // leaked E2E modules (sort_order 0) can sort before hifz, so `input.first()`
    // is not stable (was filling a leftover module, cap 5).
    const module1 = row.locator('.ecell[data-label="الحفظ"] input');
    await module1.fill('15');
    await expect(total).toHaveText(/^20/);

    const saveBtn = page.getByRole('button', { name: 'حفظ', exact: true });
    const resp = page.waitForResponse(
      (r) => r.url().includes('score') && r.request().method() !== 'GET',
    );
    await saveBtn.click();
    expect((await resp).status()).toBe(422);

    // The global error interceptor alerts every backend failure with ONE CDK
    // dialog (by design; only non-login 401s and the users-page replacer are
    // skipped). Dismiss it before role-scoped asserts: everything behind the
    // aria-modal is invisible to getByRole.
    await expect(page.getByTestId('dialog-confirm')).toBeVisible();
    await page.getByTestId('dialog-confirm').click();

    // FIXED (was F1 silent): the teacher is told — banner plus the refused
    // cell flagged; the button is usable again and nothing typed is lost.
    // The banner is a SIBLING of the `.line` row (`.erow-error` after it), so
    // it must be located page-wide, not via a descendant of `row`.
    await expect(page.getByTestId('row-banner')).toBeVisible();
    await expect(row.locator('.field-error')).toHaveCount(1);
    await expect(saveBtn).toBeEnabled();
    await expect(module1).toHaveValue('15');

    // and the bad value was NOT saved
    await page.reload();
    await openSeedSheet(page, section);
    await expect(
      page
        .locator('app-entry-table .line', { hasText: STUDENT })
        .locator('.ecell[data-label="الحفظ"] input'),
    ).toHaveValue(/^13\.2/);
  });
});

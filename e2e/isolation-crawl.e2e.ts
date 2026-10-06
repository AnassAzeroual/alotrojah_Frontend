import { expect, test } from '@playwright/test';
import { adminLogin, loginAs } from './api';

// Raw i18n keys leaking into the rendered page mean a translate pipe broke
// somewhere on that route — the "dead page" smell S33 is hunting for.
const KEY_LEAK =
  /\b(dash|nav|entry|common|auth|scoring|review|result|report|notif|delegation|registrations|planning|list|students|users|exam|news|settings|attendance|honor|gender|role|teacher_type|mode|studentStatus)\.[a-zA-Z_]+/;

test.describe.serial('Isolation & crawl (roadmap S32, S33)', () => {
  test('S32+F5: cross-center fetch 404s and the detail page freezes on its skeleton', async ({
    page,
  }) => {
    await loginAs(page, 'teach2.forqan@example.org', 'password123');
    await expect(page).toHaveURL(/^http:\/\/127\.0\.0\.1:4201\/$/);
    const notFound = page.waitForResponse(
      (r) => r.url().includes('/students/1') && r.status() === 404,
    );
    await page.goto('/students/1');
    await notFound;
    // F5: the 404 lands but the page never recovers — studentVal() reads
    // resource().value() on an errored resource (throws ResourceValueError),
    // change detection crashes, and the aria-hidden skeleton stays forever
    // instead of flipping to <app-empty-state>. Isolation holds (no record,
    // no h1) but the user is left on an eternal loading screen.
    await page.waitForTimeout(1500);
    await expect(page.locator('app-empty-state')).toHaveCount(0);
    await expect(page.locator('.skeleton').first()).toBeVisible();
    await expect(page.getByRole('heading', { level: 1 })).toHaveCount(0);
  });

  test('S33: every nav page loads a heading, correct route, and no raw i18n keys', async ({
    page,
  }) => {
    // each Playwright test gets a FRESH context (serial = order only, no shared
    // state), so this crawl logs in as admin from a blank page
    await adminLogin(page);

    const links = await page.locator('a[data-testid^="nav-"]').evaluateAll((els) =>
      els.map((el) => ({
        testId: el.getAttribute('data-testid') ?? '',
        href: el.getAttribute('href') ?? '',
      })),
    );
    expect(links.length).toBeGreaterThanOrEqual(17);

    for (const { testId, href } of links) {
      await page.getByTestId(testId).click();
      if (href === '/') {
        await expect(page).toHaveURL(/^http:\/\/127\.0\.0\.1:4201\/$/);
      } else {
        await expect(page).toHaveURL(new RegExp(`${href.replace(/\//g, '\\/')}$`));
      }
      // the page actually rendered content (not a spinner or blank shell)
      await expect(page.locator('h1, h2').first()).toBeVisible({ timeout: 15000 });
      // no raw translation keys on the surface
      const body = await page.locator('body').innerText();
      expect(KEY_LEAK.test(body), `i18n key leak on ${href}`).toBe(false);
    }
  });
});

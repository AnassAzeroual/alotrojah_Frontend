import { expect, test } from '@playwright/test';
import type { Page } from '@playwright/test';
import { adminLogin, firstSessionDate } from './api';

/**
 * The week/day grid lands on the current wall clock when it opens — even when
 * today is not the shown date. The seeded verify week never contains "today"
 * at the pinned clock, so there is no current-time marker to lean on: this
 * proves the clock-derived scroll, not a marker coincidence. Playwright's
 * fixed-time clock pins `new Date()` so both the slot index and the centring
 * assertion are deterministic whatever the suite's real run time.
 */

const PINNED = new Date('2026-09-09T15:30:00');
// 15:30 → slot 31 of the 48 half-hour slots the grid renders per day (00:00 base).
const NOW_SLOT = 31;

/** The current-time slot inside the first timed day column of the shown grid. */
function currentSlot(page: Page) {
  return page
    .locator('.cal-time-events .cal-day-column')
    .first()
    .locator('.cal-hour-segment')
    .nth(NOW_SLOT);
}

async function expectCentred(page: Page): Promise<void> {
  const slot = currentSlot(page);
  await expect(slot).toBeVisible();
  // Poll: the scroll fires in the post-render phase, so allow it to land.
  await expect
    .poll(
      async () => {
        const box = await slot.boundingBox();
        if (!box) return Number.POSITIVE_INFINITY;
        const viewport = page.viewportSize();
        return Math.abs(box.y + box.height / 2 - (viewport?.height ?? 0) / 2);
      },
      { message: 'current-time slot sits near the viewport centre' },
    )
    .toBeLessThan(80);
}

test.describe.serial('Calendar auto-scroll to now', () => {
  test('week view opens scrolled to the current time', async ({ page, request }) => {
    await page.clock.setFixedTime(PINNED);
    await adminLogin(page);
    await page.goto(`/planning/calendar?date=${await firstSessionDate(request)}`);
    await page.getByTestId('cal-view-week').click();
    await expect(page.locator('.cal-week-view')).toBeVisible();
    await expect(page.locator('.cal-time-events .cal-day-column')).toHaveCount(7);
    await expectCentred(page);
  });

  test('day view opens scrolled to the current time', async ({ page, request }) => {
    await page.clock.setFixedTime(PINNED);
    await adminLogin(page);
    await page.goto(`/planning/calendar?date=${await firstSessionDate(request)}`);
    await page.getByTestId('cal-view-day').click();
    await expect(page.locator('.cal-day-view')).toBeVisible();
    await expect(page.locator('.cal-time-events .cal-day-column')).toHaveCount(1);
    await expectCentred(page);
  });
});

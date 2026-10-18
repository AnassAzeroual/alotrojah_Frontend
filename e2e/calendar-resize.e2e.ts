import { expect, test } from '@playwright/test';
import type { APIRequestContext, Locator, Page, Response } from '@playwright/test';
import { adminLogin, apiToken, firstSessionDate } from './api';

/**
 * Seasons calendar, week view: dragging an event's top (`before-start`) or
 * bottom (`after-end`) resize handle rewrites its `start_time`/`end_time` —
 * the duration — through the same `sessions-cal/{id}` PATCH as a move. The
 * gesture is manager-only and snaps back instead of crossing midnight, exactly
 * like a drag.
 *
 * The verify DB's current season (id 1) seeds five same-time sessions on each
 * of Mon/Tue/Wed, so the first resizable event always has both handles.
 * Self-cleaning: every session this spec resizes is PATCHed back to its
 * original range, so the shared verify DB never drifts.
 */

const API = 'http://127.0.0.1:8000/api/v1';

function clockToMinutes(hm: string): number {
  const [h, m] = hm.split(':').map(Number);
  return h * 60 + m;
}

function minutesToClock(minutes: number): string {
  const p = (n: number): string => String(n).padStart(2, '0');
  return `${p(Math.floor(minutes / 60) % 24)}:${p(minutes % 60)}`;
}

/** Admin login → the season calendar switched to the week view. */
async function openWeekView(
  page: Page,
  request: APIRequestContext,
): Promise<{ weekView: Locator; events: Locator }> {
  await adminLogin(page);
  await page.goto(`/planning/calendar?date=${await firstSessionDate(request)}`);
  await expect(page).toHaveURL(/\/planning\/calendar\?date=/);
  await page.getByTestId('cal-view-week').click();
  const weekView = page.locator('.cal-week-view');
  await expect(weekView).toBeVisible();
  const events = weekView.locator('.cal-event-container.cal-draggable');
  await expect.poll(async () => events.count()).toBeGreaterThan(0);
  return { weekView, events };
}

/** Open the first resizable event's detail card and read its stored range. */
async function openFirstEvent(
  page: Page,
  events: Locator,
): Promise<{ event: Locator; id: number; timeLine: Locator; origStart: string; origEnd: string }> {
  const event = events.first();
  // Centered so both resize handles and the drag distance stay on screen — the
  // week grid is taller than the viewport.
  await event.evaluate((el) => el.scrollIntoView({ block: 'center' }));
  await event.click();
  // Start leg only — the end leg suffixes `-end` (two single-date pickers).
  const dateInput = page.locator('[data-testid^="cal-date-"]:not([data-testid$="-end"])');
  await expect(dateInput).toBeVisible();
  const timeLine = page.locator('[data-testid^="cal-time-"]');
  await expect(timeLine).toBeVisible();
  const testId = (await dateInput.getAttribute('data-testid')) ?? '';
  const id = Number(testId.replace('cal-date-', ''));
  expect(Number.isInteger(id) && id > 0, `session id from ${testId}`).toBe(true);
  const [origStart, origEnd] = ((await timeLine.textContent()) ?? '')
    .split('–')
    .map((s) => s.trim());
  expect(origStart, 'detail card shows HH:MM').toMatch(/^\d{2}:\d{2}$/);
  expect(origEnd, 'detail card shows HH:MM').toMatch(/^\d{2}:\d{2}$/);
  return { event, id, timeLine, origStart, origEnd };
}

function waitForSessionPatch(page: Page): Promise<Response> {
  return page.waitForResponse(
    (r) => r.url().includes('/sessions-cal/') && r.request().method() === 'PATCH',
  );
}

/** PATCH the session back through the API (shared verify DB stays put). */
async function restore(
  request: APIRequestContext,
  id: number,
  patch: Record<string, string>,
): Promise<void> {
  const token = await apiToken(request);
  const r = await request.patch(`${API}/sessions-cal/${id}`, {
    headers: { Authorization: `Bearer ${token}`, Accept: 'application/json' },
    data: patch,
  });
  expect(r.ok(), `restore PATCH returned ${r.status()}`).toBe(true);
}

test.describe.serial('Calendar week-view resize', () => {
  test('dragging the after-end handle down extends the duration by one hour', async ({
    page,
    request,
  }) => {
    const { weekView, events } = await openWeekView(page, request);
    const { event, id, timeLine, origStart, origEnd } = await openFirstEvent(page, events);

    // 1 h == 2 hour-segments; a resize snaps to `hourSegmentHeight` (30px).
    // Gotcha: the resizable only emits an edge when the pointer crosses a
    // segment boundary, and the emitted value can lag one step behind — a
    // plain 60px drag commits only a 30px edge, while an exact 3-segment drag
    // overshoots on the way up. Crossing 2.5 segments (75px, no exact grid
    // multiple) deterministically lands on the snapped 60px edge: +60 min.
    const segment = weekView.locator('.cal-time-events .cal-hour-segment').first();
    const segBox = await segment.boundingBox();
    expect(segBox, 'hour segments render').not.toBeNull();
    const handle = event.locator('.cal-resize-handle-after-end');
    await expect(handle).toBeVisible();
    const hb = await handle.boundingBox();
    expect(hb, 'after-end handle renders on the event').not.toBeNull();
    const startX = hb!.x + hb!.width / 2;
    const startY = hb!.y + hb!.height / 2;
    const targetY = startY + 2.5 * segBox!.height;
    const viewport = page.viewportSize();
    expect(targetY, 'resize target stays on screen').toBeLessThan((viewport?.height ?? 0) - 8);

    const expectedStart = origStart;
    const expectedEnd = minutesToClock(clockToMinutes(origEnd) + 60);

    const patched = waitForSessionPatch(page);
    await page.mouse.move(startX, startY);
    await page.mouse.down();
    await page.mouse.move(startX, targetY, { steps: 12 });
    await page.mouse.up();

    // The resize must persist via the API and come back as the stored row, with
    // the day untouched — only the end moves.
    const response = await patched;
    expect(response.status()).toBe(200);
    const sent = response.request().postDataJSON() as Record<string, string>;
    expect(sent.planned_date, 'a resize sends no date').toBeUndefined();
    expect(sent.start_time, 'start is held while the end grows').toBe(expectedStart);
    expect(sent.end_time, 'PATCH body carries the longer end').toBe(expectedEnd);

    // The detail card's time line follows the persisted time (optimistic).
    await expect(timeLine).toHaveText(`${expectedStart} – ${expectedEnd}`);

    await restore(request, id, { start_time: origStart, end_time: origEnd });
  });

  test('dragging the before-start handle up pulls the start earlier by an hour', async ({
    page,
    request,
  }) => {
    const { weekView, events } = await openWeekView(page, request);
    const { event, id, timeLine, origStart, origEnd } = await openFirstEvent(page, events);

    const segment = weekView.locator('.cal-time-events .cal-hour-segment').first();
    const segBox = await segment.boundingBox();
    expect(segBox, 'hour segments render').not.toBeNull();
    const handle = event.locator('.cal-resize-handle-before-start');
    await expect(handle).toBeVisible();
    const hb = await handle.boundingBox();
    expect(hb, 'before-start handle renders on the event').not.toBeNull();
    const startX = hb!.x + hb!.width / 2;
    const startY = hb!.y + hb!.height / 2;
    // Same snap-grid lag as the after-end leg: 2.5 segments up (75px, not an
    // exact 30px multiple) commits a clean −60px edge → −60 min.
    const targetY = startY - 2.5 * segBox!.height;
    const viewport = page.viewportSize();
    expect(targetY, 'resize target stays on screen').toBeGreaterThan(80);

    const expectedStart = minutesToClock(clockToMinutes(origStart) - 60);
    const expectedEnd = origEnd;

    const patched = waitForSessionPatch(page);
    await page.mouse.move(startX, startY);
    await page.mouse.down();
    await page.mouse.move(startX, targetY, { steps: 12 });
    await page.mouse.up();

    const response = await patched;
    expect(response.status()).toBe(200);
    const sent = response.request().postDataJSON() as Record<string, string>;
    expect(sent.planned_date, 'a resize sends no date').toBeUndefined();
    expect(sent.start_time, 'PATCH body carries the earlier start').toBe(expectedStart);
    expect(sent.end_time, 'end is held while the start moves').toBe(expectedEnd);

    // The detail card's time line follows the persisted time (optimistic).
    await expect(timeLine).toHaveText(`${expectedStart} – ${expectedEnd}`);

    await restore(request, id, { start_time: origStart, end_time: origEnd });
  });
});

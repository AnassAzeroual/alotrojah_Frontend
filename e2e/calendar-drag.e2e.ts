import { expect, test } from '@playwright/test';
import type { APIRequestContext, Locator, Page, Response } from '@playwright/test';
import { adminLogin, apiToken } from './api';

/**
 * Seasons calendar, week view: a drag rewrites whatever it actually changed —
 * the day (`planned_date`), the time (`start_time`/`end_time`), or both —
 * through the existing `sessions-cal/{id}` PATCH. Resizes stay refused, so only
 * the move gesture is covered here.
 *
 * The verify DB's current season (id 1) seeds five same-time sessions on each
 * of Mon/Tue/Wed, so the first draggable event always has an adjacent day
 * column to drop into. Self-cleaning: every session this spec moves is PATCHed
 * back to its original day/time, so the shared verify DB never drifts.
 */

const API = 'http://127.0.0.1:8000/api/v1';

function dmyToDate(dmy: string): Date {
  const [d, m, y] = dmy.split('/').map(Number);
  return new Date(y, m - 1, d);
}

function isoToDmy(iso: string): string {
  const [y, m, d] = iso.split('-');
  return `${d}/${m}/${y}`;
}

/** dd/mm/yyyy → ISO yyyy-mm-dd. */
function dmyToDateToIso(dmy: string): string {
  const [d, m, y] = dmy.split('/');
  return `${y}-${m}-${d}`;
}

function clockToMinutes(hm: string): number {
  const [h, m] = hm.split(':').map(Number);
  return h * 60 + m;
}

function minutesToClock(minutes: number): string {
  const p = (n: number): string => String(n).padStart(2, '0');
  return `${p(Math.floor(minutes / 60) % 24)}:${p(minutes % 60)}`;
}

/** Admin login → the season calendar switched to the week view. */
async function openWeekView(page: Page): Promise<{ weekView: Locator; events: Locator }> {
  await adminLogin(page);
  await page.getByTestId('nav-calendar').click();
  await expect(page).toHaveURL(/\/planning\/calendar$/);
  await page.getByTestId('cal-view-week').click();
  const weekView = page.locator('.cal-week-view');
  await expect(weekView).toBeVisible();
  const events = weekView.locator('.cal-event-container.cal-draggable');
  await expect.poll(async () => events.count()).toBeGreaterThan(0);
  return { weekView, events };
}

/** Open the first draggable event's detail card and read its stored day/time. */
async function openFirstEvent(
  page: Page,
  events: Locator,
): Promise<{ event: Locator; id: number; dateInput: Locator; timeLine: Locator }> {
  const event = events.first();
  // Centered so the whole drop target stays on screen — the week grid is
  // taller than the viewport.
  await event.evaluate((el) => el.scrollIntoView({ block: 'center' }));
  await event.click();
  const dateInput = page.locator('[data-testid^="cal-date-"]');
  await expect(dateInput).toBeVisible();
  const timeLine = page.locator('[data-testid^="cal-time-"]');
  await expect(timeLine).toBeVisible();
  const testId = (await dateInput.getAttribute('data-testid')) ?? '';
  const id = Number(testId.replace('cal-date-', ''));
  expect(Number.isInteger(id) && id > 0, `session id from ${testId}`).toBe(true);
  return { event, id, dateInput, timeLine };
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

test.describe.serial('Calendar week-view drag', () => {
  test('dragging a session to another day PATCHes and persists the new day', async ({
    page,
    request,
  }) => {
    const { weekView, events } = await openWeekView(page);
    const { event, id, dateInput } = await openFirstEvent(page, events);
    const originalRange = await dateInput.inputValue();
    expect(originalRange, 'detail picker shows a datetime range').toMatch(
      /^\d{2}\/\d{2}\/\d{4} \d{2}:\d{2} → \d{2}\/\d{2}\/\d{4} \d{2}:\d{2}$/,
    );
    const originalDmy = originalRange.slice(0, 10);

    // Drop into the adjacent day column (DOM order == date order, so the next
    // column is always +1 day regardless of the calendar's text direction).
    const columns = weekView.locator('.cal-time-events .cal-day-column');
    await expect(columns).toHaveCount(7);
    const boxes = await columns.evaluateAll((els) =>
      els.map((el) => {
        const r = el.getBoundingClientRect();
        return { x: r.x, y: r.y, width: r.width };
      }),
    );
    const box = await event.boundingBox();
    expect(box).not.toBeNull();
    const startX = box!.x + box!.width / 2;
    const startY = box!.y + box!.height / 2;
    const from = boxes.findIndex((c) => startX >= c.x && startX < c.x + c.width);
    expect(from, 'event sits in a known day column').toBeGreaterThanOrEqual(0);
    const to = from + 1 < boxes.length ? from + 1 : from - 1;
    const targetX = boxes[to].x + boxes[to].width / 2;

    const patched = waitForSessionPatch(page);
    await page.mouse.move(startX, startY);
    await page.mouse.down();
    await page.mouse.move(targetX, startY, { steps: 12 });
    await page.mouse.up();

    // The drag must persist exactly one day via the API and come back as the
    // stored row (SessionResource), not just an optimistic overlay. The time
    // is untouched by a horizontal drop.
    const response = await patched;
    expect(response.status()).toBe(200);
    const sent = response.request().postDataJSON() as Record<string, string>;
    const body = (await response.json()) as {
      data: { id: number; planned_date: string | null; start_time: string | null };
    };
    expect(sent.planned_date, 'PATCH body carries the new day').toMatch(/^\d{4}-\d{2}-\d{2}$/);
    expect(body.data.id).toBe(id);
    expect(body.data.planned_date).toBe(sent.planned_date);
    const daysMoved =
      (dmyToDate(isoToDmy(sent.planned_date!)).getTime() - dmyToDate(originalDmy).getTime()) /
      86_400_000;
    expect(Math.abs(daysMoved), 'moved to an adjacent day').toBe(1);
    expect(sent.start_time, 'a sideways drop leaves the time alone').toBeUndefined();

    // The detail picker reflects the persisted day (optimistic overlay).
    expect((await dateInput.inputValue()).slice(0, 10)).toBe(isoToDmy(sent.planned_date!));

    await restore(request, id, { planned_date: dmyToDateToIso(originalDmy) });
  });

  test('dragging a session down within its day PATCHes and persists the new time', async ({
    page,
    request,
  }) => {
    const { weekView, events } = await openWeekView(page);
    const { event, id, dateInput, timeLine } = await openFirstEvent(page, events);

    const originalIso = dmyToDateToIso((await dateInput.inputValue()).slice(0, 10));
    const [origStart, origEnd] = ((await timeLine.textContent()) ?? '')
      .split('–')
      .map((s) => s.trim());
    expect(origStart, 'detail card shows HH:MM').toMatch(/^\d{2}:\d{2}$/);
    expect(origEnd, 'detail card shows HH:MM').toMatch(/^\d{2}:\d{2}$/);

    // One hour down == two hour-segments. The grid snaps a drop to
    // `hourSegmentHeight` and at the shipped defaults (2 segments/hour, 30px)
    // one pixel is one minute, so +60px is deterministically +1 hour.
    const segment = weekView.locator('.cal-time-events .cal-hour-segment').first();
    const segBox = await segment.boundingBox();
    expect(segBox, 'hour segments render').not.toBeNull();
    const box = await event.boundingBox();
    expect(box).not.toBeNull();
    const startX = box!.x + box!.width / 2;
    const startY = box!.y + box!.height / 2;
    const targetY = startY + 2 * segBox!.height;
    const viewport = page.viewportSize();
    expect(targetY, 'drop target stays on screen').toBeLessThan((viewport?.height ?? 0) - 8);

    const expectedStart = minutesToClock(clockToMinutes(origStart) + 60);
    const expectedEnd = minutesToClock(clockToMinutes(origEnd) + 60);

    const patched = waitForSessionPatch(page);
    // Straight down: no x movement, so the day cannot change.
    await page.mouse.move(startX, startY);
    await page.mouse.down();
    await page.mouse.move(startX, targetY, { steps: 12 });
    await page.mouse.up();

    const response = await patched;
    expect(response.status()).toBe(200);
    const sent = response.request().postDataJSON() as Record<string, string>;
    const body = (await response.json()) as {
      data: {
        id: number;
        planned_date: string | null;
        start_time: string | null;
        end_time: string | null;
      };
    };

    expect(sent.planned_date, 'a same-day drop sends no date').toBeUndefined();
    expect(sent.start_time, 'PATCH body carries the new start').toBe(expectedStart);
    expect(sent.end_time, 'duration survives the move').toBe(expectedEnd);
    expect(body.data.id).toBe(id);
    expect(body.data.planned_date, 'day unchanged').toBe(originalIso);
    expect(body.data.start_time).toBe(sent.start_time);
    expect(body.data.end_time).toBe(sent.end_time);

    // The detail card's time line follows the persisted time (optimistic).
    await expect(timeLine).toHaveText(`${expectedStart} – ${expectedEnd}`);

    await restore(request, id, { start_time: origStart, end_time: origEnd });
  });
});

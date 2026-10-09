import { expect, test } from '@playwright/test';
import type { APIRequestContext } from '@playwright/test';
import { adminLogin, apiToken, loginAs } from './api';

/**
 * Calendar for every level (user request): students see their own group only,
 * teachers/center staff read their center, managers keep edit rights.
 * Everyone except managers is read-only (no drag, no date edits).
 *
 * Self-contained: registers + accepts its own student, creates + deletes its
 * own teacher. The accepted student stays in the DB like registrations-flow.
 */

const API = 'http://127.0.0.1:8000/api/v1';

async function adminHeaders(request: APIRequestContext): Promise<Record<string, string>> {
  return { Authorization: `Bearer ${await apiToken(request)}` };
}

/** A center-1 group that owns sessions in the current season (non-vacuous reads). */
async function sessionGroup(request: APIRequestContext): Promise<{ id: number; name: string }> {
  const headers = await adminHeaders(request);
  const seasons = (await (await request.get(`${API}/seasons`, { headers })).json()).data
    .data as Array<{ id: number; center_id: number | null; is_current: boolean }>;
  const current = seasons.find((s) => s.is_current) ?? seasons[0];
  const sessions = (
    await (await request.get(`${API}/sessions-cal?season_id=${current.id}`, { headers })).json()
  ).data.data as Array<{ group_id: number | null }>;
  const ids = [
    ...new Set(sessions.map((s) => s.group_id).filter((g): g is number => g !== null)),
  ].sort((a, b) => a - b);
  expect(ids.length).toBeGreaterThan(0);
  for (const id of ids) {
    const g = (await (await request.get(`${API}/groups/${id}`, { headers })).json()).data as {
      id: number;
      name: string;
      center_id: number;
    };
    if (g.center_id === 1) return { id: g.id, name: g.name };
  }
  throw new Error('no center-1 group owns sessions in the current season');
}

async function registerStudent(
  page: import('@playwright/test').Page,
  name: string,
  email: string,
  password: string,
): Promise<void> {
  await page.goto('/register');
  await page.getByLabel('الاسم الكامل').fill(name);
  await page.getByLabel('البريد الإلكتروني').fill(email);
  await page.getByLabel('رقم الهاتف').fill('+212600000003');
  await page.getByRole('button', { name: 'الصفة' }).click();
  await page.locator('.dd.open [role="option"]', { hasText: 'طالب' }).click();
  await page.getByLabel('تاريخ الميلاد').fill('01/01/2000');
  await page.getByRole('button', { name: 'الجنس' }).click();
  await page.locator('.dd.open [role="option"]', { hasText: 'ذكر' }).click();
  await page.getByLabel('كلمة المرور', { exact: true }).fill(password);
  await page.getByLabel('تأكيد كلمة المرور').fill(password);
  await page.getByRole('button', { name: 'إنشاء حساب جديد' }).click();
  await expect(page.locator('.reg-success h1')).toHaveText('تم استلام طلبك');
}

async function acceptStudent(
  page: import('@playwright/test').Page,
  email: string,
  groupName: string,
): Promise<void> {
  await page.getByTestId('nav-registrations').click();
  await expect(page).toHaveURL(/\/registrations$/);
  const card = page.locator('.req-card', { hasText: email });
  await expect(card).toHaveCount(1);
  await card.getByRole('button', { name: 'قبول', exact: true }).click();
  await page.getByRole('button', { name: 'اختر المركز' }).click();
  await page.locator('.dd.open [role="option"]', { hasText: 'النور' }).click();
  await page.getByRole('button', { name: 'اختر القسم' }).click();
  await page.locator('.dd.open [role="option"]', { hasText: groupName }).click();
  await page.getByRole('button', { name: 'المستوى' }).click();
  await page.locator('.dd.open [role="option"]').first().click();
  const accepted = page.waitForResponse(
    (r) => r.url().includes('registration-requests') && r.request().method() === 'POST',
  );
  await card.getByRole('button', { name: 'قبول', exact: true }).click();
  await accepted;
  await expect(page.locator('.req-card', { hasText: email })).toHaveCount(0);
}

test.describe.serial('Calendar for every level', () => {
  const stamp = Date.now();
  const studentEmail = `e2e_cal_student_${stamp}@example.org`;
  const teacherEmail = `e2e_cal_teacher_${stamp}@example.org`;
  const teacherName = `E2E Cal Teacher ${stamp}`;
  const password = 'password123';
  let groupName = '';

  test('student sees own group calendar read-only', async ({ page, request }) => {
    const group = await sessionGroup(request);
    groupName = group.name;

    await registerStudent(page, `طالب تقويم ${stamp}`, studentEmail, password);
    await adminLogin(page);
    await acceptStudent(page, studentEmail, groupName);
    await page.getByTestId('nav-logout').click();
    await expect(page).toHaveURL(/\/login$/);

    await loginAs(page, studentEmail, password);
    await expect(page.getByTestId('nav-calendar')).toBeVisible();
    await page.getByTestId('nav-calendar').click();
    await expect(page).toHaveURL(/\/planning\/calendar$/);
    await expect
      .poll(async () => page.getByTestId('cal-view-month').count(), { timeout: 20000 })
      .toBeGreaterThan(0);

    // own-group only: every month pill carries the pupil's group name.
    const pills = page.locator('.cal-events .cal-event');
    await expect.poll(async () => pills.count(), { timeout: 20000 }).toBeGreaterThan(0);
    const titles = await pills.evaluateAll((els) => els.map((e) => e.textContent ?? ''));
    expect(titles.length).toBeGreaterThan(0);
    for (const t of titles) expect(t).toContain(groupName);

    // read-only: the detail card has no date editor…
    await pills.first().click();
    await expect(page.locator('[data-testid^="cal-time-"]').first()).toBeVisible();
    await expect(page.locator('[data-testid^="cal-date-"]')).toHaveCount(0);

    // …and the week view offers no drag handles.
    await page.getByTestId('cal-view-week').click();
    await expect
      .poll(async () => page.locator('.cal-week-view .cal-event-container').count(), {
        timeout: 20000,
      })
      .toBeGreaterThan(0);
    await expect(page.locator('.cal-week-view .cal-draggable')).toHaveCount(0);

    await page.getByTestId('nav-logout').click();
    await expect(page).toHaveURL(/\/login$/);
  });

  test('teacher reads center calendar read-only, then is removed', async ({ page }) => {
    await adminLogin(page);
    await page.getByTestId('nav-users').click();
    await page.getByTestId('users-new').click();
    await page.getByTestId('user-name').fill(teacherName);
    await page.getByTestId('user-email').fill(teacherEmail);
    await page.getByTestId('user-password').fill(password);
    await page.getByTestId('user-role').click();
    await page.getByRole('option', { name: /معلم/ }).click();
    await page.getByTestId('user-teacher-type').click();
    await page.getByRole('option', { name: /حفظ ومراجعة/ }).click();
    await page.getByTestId('user-center').click();
    await page.getByRole('option', { name: 'مركز النور القرآني' }).click();
    await page.getByTestId('user-submit').click();
    await expect(page).toHaveURL(/\/users$/);
    await page.getByTestId('nav-logout').click();
    await expect(page).toHaveURL(/\/login$/);

    await loginAs(page, teacherEmail, password);
    await expect(page.getByTestId('nav-calendar')).toBeVisible();
    await page.getByTestId('nav-calendar').click();
    await expect(page).toHaveURL(/\/planning\/calendar$/);
    await expect
      .poll(async () => page.getByTestId('cal-view-month').count(), { timeout: 20000 })
      .toBeGreaterThan(0);
    await page.getByTestId('cal-view-week').click();
    await expect
      .poll(async () => page.locator('.cal-week-view .cal-event-container').count(), {
        timeout: 20000,
      })
      .toBeGreaterThan(0);
    await expect(page.locator('.cal-week-view .cal-draggable')).toHaveCount(0);
    await page.getByTestId('nav-logout').click();
    await expect(page).toHaveURL(/\/login$/);

    // cleanup: the teacher owns nothing, so direct delete works
    await loginAs(page, 'admin@example.org', password);
    await page.getByTestId('nav-users').click();
    const searchBox = page.getByTestId('users-search');
    await searchBox.fill(teacherName);
    await searchBox.press('Enter');
    const teacherRow = page.locator('.users-table tbody tr', { hasText: teacherName });
    await expect(teacherRow).toHaveCount(1);
    await teacherRow.locator('button[data-testid^="delete-user-"]').click();
    await teacherRow.locator('button[data-testid^="confirm-delete-user-"]').click();
    await expect(teacherRow).toHaveCount(0);
    await page.getByTestId('nav-logout').click();
    await expect(page).toHaveURL(/\/login$/);
  });

  test('manager edits session times via the range picker, then restores', async ({ page }) => {
    await adminLogin(page);
    await page.getByTestId('nav-calendar').click();
    await expect(page).toHaveURL(/\/planning\/calendar$/);
    await expect
      .poll(async () => page.getByTestId('cal-view-month').count(), { timeout: 20000 })
      .toBeGreaterThan(0);

    const pills = page.locator('.cal-events .cal-event');
    await expect.poll(async () => pills.count(), { timeout: 20000 }).toBeGreaterThan(0);
    await pills.first().click();
    const box = page.locator('[data-testid^="cal-date-"]').first();
    await expect(box).toBeVisible();
    const timeTag = page.locator('[data-testid^="cal-time-"]').first();
    await expect(timeTag).toBeVisible();

    // Keep the pill's own day, rewrite the clocks (arrow range separator).
    const before = await box.inputValue();
    const day = before.slice(0, 10);
    const origStart = before.slice(11, 16);
    const origEnd = before.slice(-5);
    const patched = page.waitForResponse(
      (r) => r.url().includes('sessions-cal/') && r.request().method() === 'PATCH',
    );
    await box.fill(`${day} 08:00 → ${day} 09:30`);
    await box.press('Tab');
    const res = await patched;
    expect(res.ok()).toBe(true);
    const sent = res.request().postDataJSON() as Record<string, string>;
    const [dd, mm, yyyy] = day.split('/');
    expect(sent['planned_date']).toBe(`${yyyy}-${mm}-${dd}`);
    expect(sent['start_time']).toBe('08:00');
    expect(sent['end_time']).toBe('09:30');
    await expect(timeTag).toContainText('08:00');
    await expect(timeTag).toContainText('09:30');

    // Self-cleaning: put the original clocks back.
    const restored = page.waitForResponse(
      (r) => r.url().includes('sessions-cal/') && r.request().method() === 'PATCH',
    );
    await box.fill(`${day} ${origStart} → ${day} ${origEnd}`);
    await box.press('Tab');
    expect((await restored).ok()).toBe(true);
    await expect(timeTag).toContainText(origStart);
    await page.getByTestId('nav-logout').click();
    await expect(page).toHaveURL(/\/login$/);
  });

  test('range picker caps times at the 22:00 ceiling, then restores', async ({ page }) => {
    await adminLogin(page);
    await page.getByTestId('nav-calendar').click();
    await expect(page).toHaveURL(/\/planning\/calendar$/);
    await expect
      .poll(async () => page.getByTestId('cal-view-month').count(), { timeout: 20000 })
      .toBeGreaterThan(0);

    const pills = page.locator('.cal-events .cal-event');
    await expect.poll(async () => pills.count(), { timeout: 20000 }).toBeGreaterThan(0);
    await pills.first().click();
    const box = page.locator('[data-testid^="cal-date-"]').first();
    await expect(box).toBeVisible();
    const timeTag = page.locator('[data-testid^="cal-time-"]').first();
    await expect(timeTag).toBeVisible();

    const before = await box.inputValue();
    const day = before.slice(0, 10);
    const origStart = before.slice(11, 16);
    const origEnd = before.slice(-5);
    const patched = page.waitForResponse(
      (r) => r.url().includes('sessions-cal/') && r.request().method() === 'PATCH',
    );
    await box.fill(`${day} 21:00 → ${day} 23:30`);
    await box.press('Tab');
    const res = await patched;
    expect(res.ok()).toBe(true);
    const sent = res.request().postDataJSON() as Record<string, string>;
    expect(sent['start_time']).toBe('21:00');
    expect(sent['end_time']).toBe('22:00');
    await expect(timeTag).toContainText('22:00');

    // Self-cleaning: put the original clocks back.
    const restored = page.waitForResponse(
      (r) => r.url().includes('sessions-cal/') && r.request().method() === 'PATCH',
    );
    await box.fill(`${day} ${origStart} → ${day} ${origEnd}`);
    await box.press('Tab');
    expect((await restored).ok()).toBe(true);
    await expect(timeTag).toContainText(origStart);
    await page.getByTestId('nav-logout').click();
    await expect(page).toHaveURL(/\/login$/);
  });
});

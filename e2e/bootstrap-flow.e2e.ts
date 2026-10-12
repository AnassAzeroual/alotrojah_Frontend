import { expect, test } from '@playwright/test';
import type { APIRequestContext } from '@playwright/test';
import { adminLogin, loginAs } from './api';

/**
 * Bootstrap-from-empty e2e — the "very first run" chain
 * (Admin → Supervisor → Teacher → Student) on a database that holds ONLY the
 * seeded admin (no centers, no groups, no seasons, no pupils; the reference
 * data levels/scoring/quran_verses is present because migrations seed it).
 *
 * ⚠️ This spec REQUIRES a freshly provisioned admin-only database. Test 1
 * asserts the empty starting state via the API, so it MUST NOT run against the
 * canonical seeded `alotrojah_verify` the rest of the suite uses. Launch it
 * with `scripts/run-bootstrap-e2e.ps1`, which swaps the backend `.env` to
 * `alotrojah_bootstrap`.
 *
 * Selector conventions follow the suite skill: `data-testid` for static
 * controls, content for dynamic values, `{ exact: true }` where a sibling
 * shares a label.
 */

const API = 'http://127.0.0.1:8000/api/v1';

/** Row total for a list endpoint (handles both bare arrays and paginated). */
async function total(request: APIRequestContext, token: string, resource: string): Promise<number> {
  const r = await request.get(`${API}/${resource}?per_page=1`, {
    headers: { Authorization: `Bearer ${token}`, Accept: 'application/json' },
  });
  if (!r.ok()) throw new Error(`GET ${resource} failed: ${r.status()}`);
  const body = (await r.json()) as {
    data: { meta?: { total: number } } | unknown[];
  };
  if (Array.isArray(body.data)) return body.data.length;
  return body.data.meta?.total ?? 0;
}

interface NewUser {
  name: string;
  email: string;
  password: string;
  role: string;
  center: string;
  teacherType?: string;
}

/** Staff are created on /users (the public register page only mints teacher/pupil). */
async function createUser(page: import('@playwright/test').Page, u: NewUser): Promise<void> {
  await page.getByTestId('nav-users').click();
  await expect(page).toHaveURL(/\/users$/);
  await page.getByTestId('users-new').click();
  await expect(page).toHaveURL(/\/users\/new$/);

  await page.getByTestId('user-name').fill(u.name);
  await page.getByTestId('user-email').fill(u.email);
  await page.getByTestId('user-password').fill(u.password);

  await page.getByTestId('user-role').click();
  await page.getByRole('option', { name: u.role, exact: true }).click();

  if (u.teacherType) {
    await page.getByTestId('user-teacher-type').click();
    await page.getByRole('option', { name: u.teacherType, exact: true }).click();
  }

  // Center is required for every non-admin role (the first option is the placeholder).
  await page.getByTestId('user-center').click();
  await page.getByRole('option', { name: u.center }).click();

  await page.getByTestId('user-submit').click();
  await expect(page).toHaveURL(/\/users$/);
}

interface NewPupil {
  name: string;
  email: string;
  password: string;
  phone: string;
}

/** A pupil enters through the public register page (role = طالب). */
async function registerPupil(page: import('@playwright/test').Page, p: NewPupil): Promise<void> {
  await page.goto('/register');
  await page.getByLabel('الاسم الكامل').fill(p.name);
  await page.getByLabel('البريد الإلكتروني').fill(p.email);
  await page.getByLabel('رقم الهاتف').fill(p.phone);

  await page.getByRole('button', { name: 'الصفة' }).click();
  await page.locator('.dd.open [role="option"]', { hasText: 'طالب' }).click();

  await page.getByLabel('تاريخ الميلاد').fill('01/01/2012');
  await page.getByRole('button', { name: 'الجنس' }).click();
  await page.locator('.dd.open [role="option"]', { hasText: 'ذكر' }).click();

  await page.getByTestId('register-password').fill(p.password);
  await page.getByTestId('register-password-confirm').fill(p.password);
  await page.getByRole('button', { name: 'إنشاء حساب جديد' }).click();
  await expect(page.locator('.reg-success h1')).toHaveText('تم استلام طلبك');
}

test.describe.serial('Bootstrap from empty DB (first-use chain)', () => {
  const stamp = Date.now();
  const centerName = `مركز اختبار ${stamp}`;
  const supName = `ناظر اختبار ${stamp}`;
  const supEmail = `sup_${stamp}@example.org`;
  const teacherName = `معلم اختبار ${stamp}`;
  const teacherEmail = `teacher_${stamp}@example.org`;
  const seasonName = `موسم اختبار ${stamp}`;
  const groupName = `حلقة اختبار ${stamp}`;
  const pupilName = `طالب اختبار ${stamp}`;
  const pupilEmail = `pupil_${stamp}@example.org`;
  const password = 'password123';

  test('admin: empty DB, then first center + supervisor + teacher', async ({ page, request }) => {
    await adminLogin(page);

    // --- sanity: the DB really is empty (fails fast on a mis-provisioned run) ---
    const token = await (
      await request.post(`${API}/auth/login`, {
        data: { email: 'admin@example.org', password },
      })
    ).json();
    const bearer = token.data.access_token as string;
    expect(await total(request, bearer, 'centers')).toBe(0);
    expect(await total(request, bearer, 'seasons')).toBe(0);
    expect(await total(request, bearer, 'groups')).toBe(0);

    // UI spot-check: the centers page shows the empty state (no rows).
    await page.getByTestId('nav-centers').click();
    await expect(page).toHaveURL(/\/centers$/);
    await expect(page.locator('app-empty-state')).toBeVisible();

    // --- the first center (only the admin can create centers) ---
    await page.getByTestId('center-open-create').click();
    await page.getByTestId('center-new-name').fill(centerName);
    await page.getByTestId('center-new-save').click();
    await expect(page.locator('.centers-table tbody tr', { hasText: centerName })).toHaveCount(1);

    // --- supervisor (NOT via the public register page: the backend restricts
    //     POST /auth/register to teacher/student, so staff are minted here) ---
    await createUser(page, {
      name: supName,
      email: supEmail,
      password,
      role: 'ناظر',
      center: centerName,
    });

    // --- teacher (same reason; the register page would deadlock at approval —
    //     see the first-use report Finding A) ---
    await createUser(page, {
      name: teacherName,
      email: teacherEmail,
      password,
      role: 'معلم',
      center: centerName,
      teacherType: 'حفظ',
    });
  });

  test('admin: create the first season with terms and weeks, then activate it', async ({
    page,
  }) => {
    await adminLogin(page);

    await page.getByTestId('nav-planning').click();
    await expect(page).toHaveURL(/\/planning$/);
    await page.getByTestId('seasons-new').click();
    await expect(page).toHaveURL(/\/planning\/new$/);

    // Template = 6 terms × 7 weeks (42 weeks) — exercises terms + weeks generation.
    await page.getByTestId('seasons-template').click();
    await page.getByTestId('season-name').fill(seasonName);
    await page.getByTestId('season-start').fill('01/09/2026');
    await page.getByTestId('season-center').click();
    await page.getByRole('option', { name: centerName }).click();

    const created = page.waitForResponse(
      (r) => r.url().includes('/seasons') && r.request().method() === 'POST',
    );
    await page.getByTestId('season-save').click();
    await created;
    await expect(page).toHaveURL(/\/planning$/);

    const card = page.locator('.grid-auto .card', { hasText: seasonName });
    await expect(card).toHaveCount(1);
    await expect(card).toContainText('42'); // generated total weeks

    // Make it the current season (drives the pupil calendar/dashboard).
    await card.getByRole('button', { name: 'تفعيل' }).click();
    await expect(card.locator('.cur')).toBeVisible();
  });

  test('supervisor: create the first group with a teacher and a weekly timeline', async ({
    page,
  }) => {
    await loginAs(page, supEmail, password);
    await expect(page).toHaveURL(/^http:\/\/127\.0\.0\.1:4201\/$/);

    // Header chip proves the supervisor is center-scoped to their own center.
    await expect(page.getByTestId('user-center')).toContainText(centerName);

    await page.getByTestId('nav-groups').click();
    await expect(page).toHaveURL(/\/groups$/);
    await page.getByTestId('groups-new').click();
    await expect(page).toHaveURL(/\/groups\/new$/);

    await page.getByTestId('group-name').fill(groupName);

    // A supervisor never picks the center (the server forces their own).
    await expect(page.getByTestId('group-center')).toHaveCount(0);

    await page.getByTestId('group-level').click();
    await page.getByRole('option', { name: /المستوى الأول/ }).click();

    await page.getByTestId('group-teacher').click();
    await page.getByRole('option', { name: teacherName }).click();

    // Weekly timeline: two teaching days.
    await page.getByTestId('day-Mon').click();
    await page.getByTestId('day-Wed').click();

    await page.getByTestId('group-save').click();
    await expect(page).toHaveURL(/\/groups$/);

    const search = page.getByTestId('groups-search');
    await search.fill(String(stamp));
    await search.press('Enter');
    await expect(page.locator('tbody tr.row-link', { hasText: groupName })).toHaveCount(1);
  });

  test('pupil: public register queues a request', async ({ page }) => {
    await registerPupil(page, {
      name: pupilName,
      email: pupilEmail,
      password,
      phone: '+212600000123',
    });
  });

  test('admin: accept the pupil into the group (center + group + level)', async ({ page }) => {
    await adminLogin(page);

    await page.getByTestId('nav-registrations').click();
    await expect(page).toHaveURL(/\/registrations$/);

    const card = page.locator('.req-card', { hasText: pupilEmail });
    await expect(card).toHaveCount(1);
    await card.getByRole('button', { name: 'قبول', exact: true }).click();

    await page.getByRole('button', { name: 'اختر المركز' }).click();
    await page.locator('.dd.open [role="option"]', { hasText: centerName }).click();

    await page.getByRole('button', { name: 'اختر القسم' }).click();
    await page.locator('.dd.open [role="option"]', { hasText: groupName }).click();

    await page.getByRole('button', { name: 'المستوى' }).click();
    await page.locator('.dd.open [role="option"]').first().click();

    const accepted = page.waitForResponse(
      (r) => r.url().includes('registration-requests') && r.request().method() === 'POST',
    );
    await card.getByRole('button', { name: 'قبول', exact: true }).click();
    await accepted;
    await expect(page.locator('.req-card', { hasText: pupilEmail })).toHaveCount(0);
  });

  test('pupil: sees only their own world (dashboard, own record, calendar, news)', async ({
    page,
  }) => {
    await loginAs(page, pupilEmail, password);
    await expect(page).toHaveURL(/^http:\/\/127\.0\.0\.1:4201\/$/);
    await expect(page.getByTestId('user-center')).toContainText(centerName);

    // The pupil list is server-scoped to the pupil's own record.
    await page.getByTestId('nav-students').click();
    await expect(page).toHaveURL(/\/students$/);
    const own = page.locator('.grid-auto .card');
    await expect(own).toHaveCount(1);
    await expect(own).toContainText(pupilName);

    // Calendar is open to every role (auto-selects the current season).
    await page.getByTestId('nav-calendar').click();
    await expect(page).toHaveURL(/\/planning\/calendar$/);

    // Staff/admin-only navigation is not rendered for a pupil.
    for (const id of [
      'nav-users',
      'nav-groups',
      'nav-registrations',
      'nav-centers',
      'nav-levels',
      'nav-scoring',
      'nav-reports',
      'nav-delegate',
      'nav-notifications',
      'nav-entry',
      'nav-planning',
    ]) {
      await expect(page.getByTestId(id)).toHaveCount(0);
    }

    // Pupil-visible pages per the route guards (§C3): exams + term results.
    await expect(page.getByTestId('nav-exams')).toBeVisible();
    await expect(page.getByTestId('nav-results')).toBeVisible();
  });
});

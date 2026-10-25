import { expect, test } from '@playwright/test';
import type { APIRequestContext } from '@playwright/test';
import { apiToken } from './api';

const API = 'http://127.0.0.1:8000/api/v1';

/** Seeded center with a small group count (season creation stays cheap). */
const CENTER = 'مركز الفرقان القرآني';

/** Prefix of the throwaway season this spec owns (self-cleaning). */
const SEASON_PREFIX = 'E2E Levels ';

const authHeaders = (token: string) => ({
  Authorization: `Bearer ${token}`,
  Accept: 'application/json',
});

/** Resolve the seeded center id at runtime (never hardcode ids). */
async function centerId(request: APIRequestContext): Promise<number> {
  const token = await apiToken(request);
  const res = await request.get(`${API}/centers`, { headers: authHeaders(token) });
  if (!res.ok()) throw new Error(`centers list failed: ${res.status()}`);
  const rows = (await res.json()).data.data as Array<{ id: number; name: string }>;
  const hit = rows.find((c) => c.name === CENTER);
  if (!hit) throw new Error(`seed center missing: ${CENTER}`);
  return hit.id;
}

/** Delete any season a previous interrupted run of this spec leaked. */
async function purgeLeakedSeasons(request: APIRequestContext): Promise<void> {
  const token = await apiToken(request);
  const res = await request.get(`${API}/seasons`, { headers: authHeaders(token) });
  if (!res.ok()) throw new Error(`seasons list failed: ${res.status()}`);
  const rows = (await res.json()).data.data as Array<{ id: number; name: string }>;
  for (const row of rows.filter((s) => s.name.startsWith(SEASON_PREFIX))) {
    await request.delete(`${API}/seasons/${row.id}`, { headers: authHeaders(token) });
  }
}

test.describe.serial('Levels management', () => {
  const stamp = Date.now();
  const seasonName = `${SEASON_PREFIX}${stamp}`;
  const sourceName = `${SEASON_PREFIX}src ${stamp}`;
  let seasonId: number | null = null;
  let sourceSeasonId: number | null = null;

  // A failed assertion must not leave the throwaway seasons (and their
  // generated sessions) behind in the shared verify DB. Target first, then the
  // source it copied from.
  test.afterEach(async ({ request }) => {
    const token = await apiToken(request);
    for (const id of [seasonId, sourceSeasonId]) {
      if (id !== null) {
        await request.delete(`${API}/seasons/${id}`, { headers: authHeaders(token) });
      }
    }
    seasonId = null;
    sourceSeasonId = null;
  });

  test('auto-picks a center lane and shows its season levels with exact goals', async ({
    page,
  }) => {
    await page.goto('/login');
    await page.getByTestId('auth-email').fill('admin@example.org');
    await page.getByTestId('auth-password').fill('password123');
    await page.getByTestId('auth-submit').click();
    await expect(page).toHaveURL(/^http:\/\/127\.0\.0\.1:4201\/$/);

    await page.getByTestId('nav-levels').click();
    await expect(page).toHaveURL(/\/levels$/);
    // Let webfonts settle: an Arabic-font swap mid-click can move the target
    // between mousedown and mouseup, silently losing the click.
    await page.evaluate(() => document.fonts.ready);

    // No global/template view any more: the page auto-picks the first center
    // and its current/latest season.
    await expect.poll(async () => page.locator('.levels-table tbody tr').count()).toBe(3);
    const centerBtn = page.getByTestId('levels-center-scope');
    if (!(await centerBtn.innerText()).includes(CENTER)) {
      const seasons = page.waitForResponse(
        (r) => r.url().includes('/api/v1/seasons?center_id=') && r.request().method() === 'GET',
      );
      const levels = page.waitForResponse(
        (r) => r.url().includes('/api/v1/levels?season_id=') && r.request().method() === 'GET',
      );
      await centerBtn.click();
      await page.getByRole('option', { name: CENTER }).click();
      await seasons;
      await levels;
    }

    const banner = page.getByTestId('levels-scope-banner');
    await expect(banner).toContainText(CENTER);
    await expect(page.getByTestId('level-new')).toBeVisible();

    // 6 study weeks × 3 sessions × thumn/session ÷ 8.
    await expect(page.locator('.levels-table .goal-value')).toHaveText(['2.81', '2.25', '1.49']);

    // The breakdown lists every term of the season's calendar.
    await page.locator('[data-testid^="level-goal-toggle-"]').first().click();
    const chips = page.locator('.goal-chip');
    await expect(chips).toHaveCount(6);
    await expect(chips.first()).toContainText('الفصل الأول');
    await expect(chips.first()).toContainText('6 أسابيع دراسة');
    await expect(chips.first()).toContainText('1 أسابيع مراجعة');
    await expect(chips.first()).toContainText('2.81');

    await page.getByTestId('nav-logout').click();
    await expect(page).toHaveURL(/\/login$/);
  });

  test('edits, resets, and adds a level inside one season', async ({ page, request }) => {
    await purgeLeakedSeasons(request);
    const center = await centerId(request);
    const token = await apiToken(request);

    // Levels are per season and there is no static seed: give the center a
    // source season with an explicit set, then create the target season so it
    // copies those three levels.
    const source = await request.post(`${API}/seasons`, {
      headers: authHeaders(token),
      data: {
        name: sourceName,
        center_id: center,
        start_date: '2026-09-01',
        review_weeks_per_term: 0,
        terms: [
          { name: 'الفصل الأول', weeks: 5 },
          { name: 'الفصل الثاني', weeks: 5 },
        ],
      },
    });
    expect(source.status()).toBe(201);
    sourceSeasonId = (await source.json()).data.id as number;
    // A center that already has an earlier season gets its set copied into the
    // new source season; clear it so the known three-level set is deterministic.
    const inherited = await request.get(`${API}/levels?season_id=${sourceSeasonId}`, {
      headers: authHeaders(token),
    });
    for (const row of (await inherited.json()).data as Array<{ id: number }>) {
      expect(
        (await request.delete(`${API}/levels/${row.id}`, { headers: authHeaders(token) })).status(),
      ).toBe(200);
    }
    // New levels enforce thumn_per_session_value >= 1 (unlike the old seed).
    // The server assigns L{id}; editing recomputes the display name, so keep
    // the L1 code for stable row lookup.
    let l1Code = '';
    for (const [code, unit, week] of [
      ['L1', 1.25, 3.75],
      ['L2', 1, 3],
      ['L3', 1.1, 3.3],
    ] as const) {
      const level = await request.post(`${API}/levels`, {
        headers: authHeaders(token),
        data: {
          season_id: sourceSeasonId,
          name_ar: `Source ${code}`,
          sessions_per_week: 3,
          thumn_per_session_label: 'ثمن',
          thumn_per_session_value: unit,
          thumn_per_week_value: week,
          ahzab_per_term: 0,
          ahzab_per_dawra: 0,
          duration_label: '4 سنوات',
          total_ahzab: 60,
        },
      });
      expect(level.status()).toBe(201);
      const createdLevel = (await level.json()).data as { code: string };
      if (code === 'L1') l1Code = createdLevel.code;
    }

    const created = await request.post(`${API}/seasons`, {
      headers: authHeaders(token),
      data: {
        name: seasonName,
        center_id: center,
        start_date: '2027-09-01',
        review_weeks_per_term: 0,
        terms: [
          { name: 'الفصل الأول', weeks: 5 },
          { name: 'الفصل الثاني', weeks: 5 },
        ],
      },
    });
    expect(created.status()).toBe(201);
    seasonId = (await created.json()).data.id as number;

    await page.goto('/login');
    await page.getByTestId('auth-email').fill('admin@example.org');
    await page.getByTestId('auth-password').fill('password123');
    await page.getByTestId('auth-submit').click();
    await expect(page).toHaveURL(/^http:\/\/127\.0\.0\.1:4201\/$/);

    await page.getByTestId('nav-levels').click();
    await expect(page).toHaveURL(/\/levels$/);
    await page.evaluate(() => document.fonts.ready);

    // The page auto-picks the first center; switch to CENTER only when needed.
    // Either way the season effect selects its newest own season (the target).
    const centerBtn = page.getByTestId('levels-center-scope');
    if (!(await centerBtn.innerText()).includes(CENTER)) {
      const seasons = page.waitForResponse(
        (r) => r.url().includes('/api/v1/seasons?center_id=') && r.request().method() === 'GET',
      );
      const levels = page.waitForResponse(
        (r) => r.url().includes('/api/v1/levels?season_id=') && r.request().method() === 'GET',
      );
      await centerBtn.click();
      await page.getByRole('option', { name: CENTER }).click();
      await seasons;
      await levels;
    }
    await expect(page.getByTestId('levels-season-scope')).toContainText(seasonName);

    const banner = page.getByTestId('levels-scope-banner');
    await expect(banner).toContainText(seasonName);
    await expect(banner.locator('.src-tag.inherited')).toHaveCount(0);
    await expect(page.getByTestId('levels-season-scope')).toContainText(seasonName);
    await expect.poll(async () => page.locator('.levels-table tbody tr').count()).toBe(3);

    // New season, 5 study weeks per term (no review weeks): the goal follows
    // this season's own calendar, not the shared lane's 6-week terms.
    await expect(page.locator('.levels-table .goal-value')).toHaveText(['2.34', '1.88', '2.06']);
    await page.locator('[data-testid^="level-goal-toggle-"]').first().click();
    const chips = page.locator('.goal-chip');
    await expect(chips).toHaveCount(2);
    await expect(chips.first()).toContainText('5 أسابيع دراسة');
    await expect(chips.first()).not.toContainText('أسابيع مراجعة');
    await expect(chips.first()).toContainText('2.34');

    // Edit: 5 study weeks × 5 sessions × 1.25 thumn ÷ 8 = 3.91.
    const row = page.locator('.levels-table tbody tr', { hasText: l1Code }).first();
    await expect(row).toHaveCount(1);
    await row.getByTestId(/^edit-level-/).click();
    await page.getByTestId('level-edit-sessions').fill('5');
    const put = page.waitForResponse(
      (r) => r.url().includes('/api/v1/levels/') && r.request().method() === 'PUT',
    );
    await page.getByTestId('level-edit-save').click();
    expect((await put).status()).toBe(200);
    await expect(row.locator('.goal-value')).toHaveText('3.91');

    // Revert the edit so the reset below proves the clone source.
    await row.getByTestId(/^edit-level-/).click();
    await page.getByTestId('level-edit-sessions').fill('3');
    const revert = page.waitForResponse(
      (r) => r.url().includes('/api/v1/levels/') && r.request().method() === 'PUT',
    );
    await page.getByTestId('level-edit-save').click();
    expect((await revert).status()).toBe(200);
    await expect(row.locator('.goal-value')).toHaveText('2.34');

    // Reset re-clones the season's set (no pupil is placed yet → allowed).
    await page.getByTestId('levels-reset').click();
    const [reset] = await Promise.all([
      page.waitForResponse(
        (r) => r.url().includes('/levels/reset') && r.request().method() === 'DELETE',
      ),
      page.getByTestId('confirm-levels-reset').click(),
    ]);
    expect(reset.status()).toBe(200);
    const resetBody = await reset.json();
    expect(resetBody.data).toEqual({ deleted: 3, created: 3 });
    await expect.poll(async () => page.locator('.levels-table tbody tr').count()).toBe(3);
    await expect(page.locator('.levels-table .goal-value')).toHaveText(['2.34', '1.88', '2.06']);

    // Create: the payload carries the season (never a center or a code).
    await page.getByTestId('level-new').click();
    await expect(page.getByTestId('level-create-form')).toBeVisible();
    await page.getByTestId('level-new-thumn-session').fill('2');
    await expect(page.getByTestId('level-new-thumn-week')).toHaveText('6');
    await expect(page.getByTestId('level-new-name')).toHaveText('ثلاثة أرباع في الأسبوع');
    const post = page.waitForResponse(
      (r) => r.url().endsWith('/api/v1/levels') && r.request().method() === 'POST',
    );
    await page.getByTestId('level-create-save').click();
    const res = await post;
    expect(res.status()).toBe(201);
    const body = await res.json();
    expect(body.data.season_id).toBe(seasonId);
    expect(body.data.code).toMatch(/^L\d+$/);
    // 5 study weeks × 3 sessions × 2 thumn ÷ 8 = 3.75.
    expect(body.data.ahzab_first_term).toBe(3.75);

    const newRow = page.locator('.levels-table tbody tr', { hasText: String(body.data.code) });
    await expect(newRow).toHaveCount(1);
    await expect(newRow.locator('.goal-value')).toHaveText('3.75');

    // Self-cleaning: delete the created row again by its exact test-ids.
    const levelId = body.data.id as number;
    const arm = page.getByTestId(`delete-level-${levelId}`);
    await expect
      .poll(
        async () => {
          if ((await page.getByTestId(`confirm-delete-level-${levelId}`).count()) > 0) return true;
          await arm.click();
          return (await page.getByTestId(`confirm-delete-level-${levelId}`).count()) > 0;
        },
        { timeout: 15000 },
      )
      .toBe(true);
    const confirm = page.getByTestId(`confirm-delete-level-${levelId}`);
    await expect
      .poll(
        async () => {
          if ((await confirm.count()) === 0) return true;
          await confirm.click();
          await page.waitForTimeout(1500);
          return (await confirm.count()) === 0;
        },
        { timeout: 20000 },
      )
      .toBe(true);
    await expect(
      page.locator('.levels-table tbody tr', { hasText: String(body.data.code) }),
    ).toHaveCount(0);

    await page.getByTestId('nav-logout').click();
    await expect(page).toHaveURL(/\/login$/);
  });
});

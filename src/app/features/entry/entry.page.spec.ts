import { provideHttpClient } from '@angular/common/http';
import { HttpTestingController, provideHttpClientTesting } from '@angular/common/http/testing';
import { TestBed } from '@angular/core/testing';
import { provideRouter } from '@angular/router';
import {
  provideTranslateLoader,
  provideTranslateService,
  TranslateNoOpLoader,
} from '@ngx-translate/core';
import { EntryPage } from './entry.page';

const pad = (n: number): string => String(n).padStart(2, '0');
const shift = (days: number): string => {
  const d = new Date();
  d.setDate(d.getDate() + days);
  return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}`;
};
const today = (): string => shift(0);

const SESSION_50 = {
  id: 50,
  group_id: 5,
  planned_date: today(),
  session_number_global: 12,
  session_type: 'memorization',
};

describe('EntryPage smart defaults', () => {
  let fixture!: ReturnType<typeof TestBed.createComponent<EntryPage>>;
  let page!: EntryPage;
  let http!: HttpTestingController;
  /** Every flushed GET's query params (weeks scoping + sessions group pins). */
  let requested: {
    url: string;
    center: string | null;
    group: string | null;
    week: string | null;
  }[];

  const record = (url: string, params: { get: (k: string) => string | null }): void => {
    requested.push({
      url,
      center: params.get('center_id'),
      group: params.get('group_id'),
      week: params.get('week_id'),
    });
  };

  const flushBoot = (groups: unknown[], weeks: unknown[], levels: unknown[] = []): void => {
    const flush = (part: string, body: unknown): void => {
      http
        .match((r) => r.url.includes(part) && r.method === 'GET')
        .forEach((req) => {
          record(req.request.url, req.request.params);
          req.flush({ success: true, message: null, data: body });
        });
    };
    flush('/groups', { data: groups });
    flush('/scoring-modules', []);
    flush('/weeks', { data: weeks });
    flush('/levels', levels);
    flush('/weekly-goals', { data: [] });
  };

  /** Drain the center-scoped weeks refetch a group pick triggers. */
  const flushWeeks = (weeks: unknown[]): void => {
    http
      .match((r) => r.url.includes('/weeks') && r.method === 'GET')
      .forEach((req) => {
        record(req.request.url, req.request.params);
        req.flush({ success: true, message: null, data: { data: weeks } });
      });
  };

  const settle = async (): Promise<void> => {
    await new Promise<void>((r) => setTimeout(r, 0));
    fixture.detectChanges();
  };

  /** Several CD passes: signals → effect → resources → effect … */
  const cycle = async (times = 3): Promise<void> => {
    for (let i = 0; i < times; i++) {
      await settle();
    }
  };

  const flushSessions = (): void => {
    http
      .match((r) => r.url.includes('/sessions-cal') && r.method === 'GET')
      .forEach((req) => {
        record(req.request.url, req.request.params);
        req.flush({ success: true, message: null, data: { data: [SESSION_50] } });
      });
    http
      .match((r) => r.url.endsWith('/students') && r.method === 'GET')
      .forEach((req) => req.flush({ success: true, message: null, data: { data: [] } }));
  };

  const flushExisting = (): void => {
    http
      .match((r) => r.url.includes('/sessions/50/scores'))
      .forEach((req) => req.flush({ success: true, message: null, data: [] }));
    http
      .match((r) => r.url.includes('/attendance') && r.method === 'GET')
      .forEach((req) => req.flush({ success: true, message: null, data: { data: [] } }));
  };

  beforeEach(async () => {
    requested = [];
    await TestBed.configureTestingModule({
      imports: [EntryPage],
      providers: [
        provideHttpClient(),
        provideHttpClientTesting(),
        provideRouter([]),
        provideTranslateService({
          loader: provideTranslateLoader(() => new TranslateNoOpLoader()),
        }),
      ],
    }).compileComponents();
    http = TestBed.inject(HttpTestingController);
    fixture = TestBed.createComponent(EntryPage);
    page = fixture.componentInstance;
    fixture.detectChanges();
  });

  afterEach(() => http.verify());

  it('preselects the lone group, the week holding today, and today’s session', async () => {
    const weeks = [
      {
        id: 7,
        week_number_global: 9,
        start_date: shift(-3),
        end_date: shift(3),
        term_name: 'الفصل 1',
        season_name: 'موسم 1449',
      },
    ];
    flushBoot([{ id: 5, name: 'G5', center_id: 11 }], weeks);
    await cycle();
    // The group auto-pick refires weeks scoped to the group's center.
    flushWeeks(weeks);
    await cycle();

    expect(page.selectedGroup()).toBe(5);
    expect(page.selectedWeek()).toBe(7);

    // The week option carries its term label (NoOp i18n returns the key).
    expect(page.weekOptions().find((o) => o.value === '7')?.label).toBe(
      'common.week 9 · الفصل 1 · (موسم 1449)',
    );

    flushSessions();
    await cycle();
    flushSessions();
    await cycle();

    expect(page.selectedSession()).toBe(50);
    expect(page.ready()).toBe(true);

    // The weeks refetch carries the picked group's center …
    const weekCenters = requested.filter((p) => p.url.includes('/weeks')).map((p) => p.center);
    expect(weekCenters).toContain('11');
    // … and sessions carry the picked group alongside the week.
    const sessionGroups = requested
      .filter((p) => p.url.includes('/sessions-cal'))
      .map((p) => ({ group: p.group, week: p.week }));
    expect(sessionGroups).toContainEqual({ group: '5', week: '7' });

    // The auto-loaded session pulls its existing scores + attendance.
    flushExisting();
    await cycle();
    flushExisting();
    await cycle();

    // Goal list follows the picked week.
    http
      .match((r) => r.url.includes('/weekly-goals') && r.method === 'GET')
      .forEach((req) => req.flush({ success: true, message: null, data: { data: [] } }));
    await cycle();
  });

  it('leaves multi-group teachers and manual picks alone', async () => {
    const weeks = [
      {
        id: 7,
        week_number_global: 9,
        start_date: shift(-3),
        end_date: shift(3),
        term_name: 'الفصل 1',
        season_name: 'موسم 1449',
      },
    ];
    flushBoot(
      [
        { id: 5, name: 'G5', center_id: 11 },
        { id: 6, name: 'G6', center_id: 12 },
      ],
      weeks,
    );
    await cycle();

    // Two groups: no group auto-pick, but the week still resolves from today.
    expect(page.selectedGroup()).toBeNull();
    expect(page.selectedWeek()).toBe(7);
    expect(page.ready()).toBe(false);

    // Unpicked: the boot weeks request carries no center, and the pending
    // sessions request carries the week with no group.
    expect(requested.filter((p) => p.url.includes('/weeks')).map((p) => p.center)).toEqual([null]);
    const openSessions = http.match((r) => r.url.includes('/sessions-cal') && r.method === 'GET');
    expect(openSessions.length).toBeGreaterThan(0);
    openSessions.forEach((req) => {
      expect(req.request.params.get('week_id')).toBe('7');
      expect(req.request.params.get('group_id')).toBeNull();
    });

    // A manual group pick sticks and never retriggers the auto-pick.
    page.onGroup(6);
    expect(page.selectedGroup()).toBe(6);
    http
      .match((r) => r.url.includes('/sessions-cal') && r.method === 'GET')
      .forEach((req) => {
        record(req.request.url, req.request.params);
        req.flush({ success: true, message: null, data: { data: [] } });
      });
    http
      .match((r) => r.url.endsWith('/students') && r.method === 'GET')
      .forEach((req) => req.flush({ success: true, message: null, data: { data: [] } }));
    await cycle();
    // Drain the onGroup-triggered refetch (fires after the manual pick).
    http
      .match((r) => r.url.endsWith('/students') && r.method === 'GET')
      .forEach((req) => req.flush({ success: true, message: null, data: { data: [] } }));
    // The manual pick re-scopes both feeds: weeks to the group's center …
    flushWeeks(weeks);
    // … and sessions to the picked group (fires a cycle after the pick).
    http
      .match((r) => r.url.includes('/sessions-cal') && r.method === 'GET')
      .forEach((req) => {
        record(req.request.url, req.request.params);
        req.flush({ success: true, message: null, data: { data: [] } });
      });
    await cycle();
    http
      .match((r) => r.url.includes('/sessions-cal') && r.method === 'GET')
      .forEach((req) => {
        record(req.request.url, req.request.params);
        req.flush({ success: true, message: null, data: { data: [] } });
      });
    await cycle();
    expect(page.selectedGroup()).toBe(6);
    expect(page.selectedWeek()).toBe(7);
    expect(requested.filter((p) => p.url.includes('/weeks')).map((p) => p.center)).toContain('12');
    // … and sessions to the picked group.
    expect(
      requested
        .filter((p) => p.url.includes('/sessions-cal'))
        .map((p) => ({ group: p.group, week: p.week })),
    ).toContainEqual({ group: '6', week: '7' });
  });

  it('resolves the level-expected memorized amount with a bound this', async () => {
    const weeks = [
      {
        id: 7,
        week_number_global: 9,
        start_date: shift(-3),
        end_date: shift(3),
        term_name: 'الفصل 1',
        season_name: 'موسم 1449',
      },
    ];
    flushBoot([{ id: 5, name: 'G5', center_id: 11 }], weeks, [
      { id: 5, name_ar: 'L1', thumn_per_session_value: 1.5 },
    ]);
    await cycle();
    // Drain the group-pick weeks refetch (no-op when the HTTP cache serves it).
    flushWeeks(weeks);
    await cycle();
    http
      .match((r) => r.url.includes('/sessions-cal') && r.method === 'GET')
      .forEach((req) => req.flush({ success: true, message: null, data: { data: [] } }));
    http
      .match((r) => r.url.includes('/students') && r.method === 'GET')
      .forEach((req) =>
        req.flush({
          success: true,
          message: null,
          data: {
            data: [
              { id: 1, full_name: 'P', level_id: 5 },
              { id: 2, full_name: 'Q', level_id: null },
            ],
          },
        }),
      );
    await cycle();

    // Called unbound (as the score-sheet template does) — must not throw.
    const fn = page.defaultMemorization;
    expect(fn(1)).toBe(1.5);
    expect(fn(2)).toBeNull();
    expect(fn(999)).toBeNull();
  });
});

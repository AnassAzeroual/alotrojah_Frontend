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
  week_id: 7,
  planned_date: today(),
  session_number_global: 12,
  session_type: 'memorization',
  status: 'planned',
  start_time: '08:00:00',
  end_time: '10:00:00',
};

const WEEK_7 = {
  id: 7,
  week_number_global: 9,
  start_date: shift(-3),
  end_date: shift(3),
  term_name: 'الفصل 1',
  season_name: 'موسم 1449',
  week_type: 'study',
};

const WEEK_8 = {
  id: 8,
  week_number_global: 10,
  start_date: shift(-17),
  end_date: shift(-11),
  term_name: 'الفصل 2',
  season_name: 'موسم 1449',
  week_type: 'study',
};

describe('EntryPage card flow', () => {
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

  const flushStudents = (students: unknown[] = []): void => {
    http
      .match((r) => r.url.endsWith('/students') && r.method === 'GET')
      .forEach((req) => req.flush({ success: true, message: null, data: { data: students } }));
  };

  const flushSessions = (sessions: unknown[] = [SESSION_50]): void => {
    http
      .match((r) => r.url.includes('/sessions-cal') && r.method === 'GET')
      .forEach((req) => {
        record(req.request.url, req.request.params);
        req.flush({ success: true, message: null, data: { data: sessions } });
      });
  };

  const flushExisting = (): void => {
    http
      .match((r) => r.url.includes('/sessions/50/scores'))
      .forEach((req) => req.flush({ success: true, message: null, data: [] }));
    http
      .match((r) => r.url.includes('/attendance') && r.method === 'GET')
      .forEach((req) => req.flush({ success: true, message: null, data: { data: [] } }));
  };

  const flushGoals = (): void => {
    http
      .match((r) => r.url.includes('/weekly-goals') && r.method === 'GET')
      .forEach((req) => req.flush({ success: true, message: null, data: { data: [] } }));
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

  it('auto-selects a lone section and opens its week cards', async () => {
    flushBoot([{ id: 5, name: 'G5', center_id: 11 }], [WEEK_7]);
    await cycle();
    // The group auto-pick refires weeks scoped to the group's center.
    flushWeeks([WEEK_7]);
    flushStudents();
    await cycle();

    expect(page.selectedGroup()).toBe(5);
    expect(page.selectedGroupData()?.name).toBe('G5');
    expect(page.selectedWeek()).toBeNull();
    expect(page.step()).toBe(2);
    expect(page.ready()).toBe(false);
    expect(page.weekList().map((w) => w.id)).toEqual([7]);

    // The weeks refetch carries the picked group's center, and no session
    // request fires until a week card is chosen.
    const weekCenters = requested.filter((p) => p.url.includes('/weeks')).map((p) => p.center);
    expect(weekCenters).toContain('11');
    expect(requested.some((p) => p.url.includes('/sessions-cal'))).toBe(false);
  });

  it('opens the current term by default and lets the teacher switch terms', async () => {
    flushBoot([{ id: 5, name: 'G5', center_id: 11 }], [WEEK_7, WEEK_8]);
    await cycle();
    flushWeeks([WEEK_7, WEEK_8]);
    flushStudents();
    await cycle();

    expect(page.weekTerms()).toEqual(['الفصل 1', 'الفصل 2']);
    expect(page.activeWeekTerm()).toBe('الفصل 1');
    expect(page.visibleWeeks().map((w) => w.id)).toEqual([7]);

    page.showAllWeeks();
    expect(page.activeWeekTerm()).toBeNull();
    expect(page.visibleWeeks().map((w) => w.id)).toEqual([7, 8]);

    page.selectWeekTerm('الفصل 2');
    expect(page.activeWeekTerm()).toBe('الفصل 2');
    expect(page.visibleWeeks().map((w) => w.id)).toEqual([8]);
  });

  it('leaves multi-section teachers on the section cards until they pick one', async () => {
    flushBoot(
      [
        { id: 5, name: 'G5', center_id: 11 },
        { id: 6, name: 'G6', center_id: 12 },
      ],
      [WEEK_7],
    );
    await cycle();

    expect(page.selectedGroup()).toBeNull();
    expect(page.selectedWeek()).toBeNull();
    expect(page.step()).toBe(1);
    expect(page.ready()).toBe(false);
    expect(requested.filter((p) => p.url.includes('/weeks')).map((p) => p.center)).toEqual([null]);

    // A manual section pick sticks and opens that section's weeks only.
    page.onGroup(6);
    await cycle();
    flushWeeks([WEEK_7]);
    flushStudents();
    await cycle();

    expect(page.selectedGroup()).toBe(6);
    expect(page.selectedGroupData()?.name).toBe('G6');
    expect(page.selectedWeek()).toBeNull();
    expect(page.step()).toBe(2);
    expect(page.weekList().map((w) => w.id)).toEqual([7]);
    expect(requested.filter((p) => p.url.includes('/weeks')).map((p) => p.center)).toContain('12');
    expect(requested.some((p) => p.url.includes('/sessions-cal'))).toBe(false);
  });

  it('walks section → week → session and lets every breadcrumb step go back', async () => {
    flushBoot([{ id: 5, name: 'G5', center_id: 11 }], [WEEK_7]);
    await cycle();
    flushWeeks([WEEK_7]);
    flushStudents();
    await cycle();

    page.onWeek(7);
    await cycle();
    flushSessions();
    await cycle();

    expect(page.selectedWeek()).toBe(7);
    expect(page.selectedSession()).toBeNull();
    expect(page.step()).toBe(3);
    expect(page.sessionList().map((s) => s.id)).toEqual([50]);
    expect(
      requested
        .filter((p) => p.url.includes('/sessions-cal'))
        .map((p) => ({ group: p.group, week: p.week })),
    ).toContainEqual({ group: '5', week: '7' });

    page.onSession(50);
    await cycle();
    flushExisting();
    await cycle();
    flushGoals();
    await cycle();

    expect(page.ready()).toBe(true);
    expect(page.step()).toBe(4);
    expect(page.session()?.id).toBe(50);

    // Week crumb: back to the session cards, keeping the week.
    page.backToSessions();
    await cycle();
    expect(page.selectedWeek()).toBe(7);
    expect(page.selectedSession()).toBeNull();
    expect(page.step()).toBe(3);

    // Section crumb: back to the week cards, keeping the section.
    page.backToWeeks();
    await cycle();
    expect(page.selectedGroup()).toBe(5);
    expect(page.selectedWeek()).toBeNull();
    expect(page.step()).toBe(2);

    // Root crumb: all the way back to the section cards; the lone-section
    // shortcut must not immediately pull the user forward again.
    page.resetGroup();
    await cycle();
    flushWeeks([]);
    await cycle();
    expect(page.selectedGroup()).toBeNull();
    expect(page.step()).toBe(1);
  });

  it('resolves the level-expected memorized amount with a bound this', async () => {
    flushBoot(
      [{ id: 5, name: 'G5', center_id: 11 }],
      [WEEK_7],
      [{ id: 5, name_ar: 'L1', thumn_per_session_value: 1.5 }],
    );
    await cycle();
    // Drain the group-pick weeks refetch (no-op when the HTTP cache serves it).
    flushWeeks([WEEK_7]);
    flushStudents([
      { id: 1, full_name: 'P', level_id: 5 },
      { id: 2, full_name: 'Q', level_id: null },
    ]);
    await cycle();

    // Called unbound (as the entry template does) — must not throw.
    const fn = page.defaultMemorization;
    expect(fn(1)).toBe(1.5);
    expect(fn(2)).toBeNull();
    expect(fn(999)).toBeNull();
  });
});

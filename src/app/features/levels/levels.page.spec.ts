import { provideHttpClient } from '@angular/common/http';
import { HttpTestingController, provideHttpClientTesting } from '@angular/common/http/testing';
import { signal } from '@angular/core';
import { TestBed } from '@angular/core/testing';
import { provideRouter } from '@angular/router';
import {
  provideTranslateLoader,
  provideTranslateService,
  TranslateNoOpLoader,
} from '@ngx-translate/core';
import { AuthLoginResponse, LevelResource, SeasonResource } from '../../core/api/models';
import { AuthService } from '../../core/auth/auth.service';
import { AdminPrefsService } from '../../core/settings/admin-prefs.service';
import { LevelsPage } from './levels.page';

const ADMIN: AuthLoginResponse['data']['user'] = {
  id: 1,
  full_name: 'Admin',
  role: 'admin',
  center_id: null,
  center_name: null,
  teacher_type: 'both',
};

const CENTERS = [
  { id: 7, name: 'Center A' },
  { id: 8, name: 'Center B' },
];

const SEASON: SeasonResource = {
  id: 11,
  name: '2026-2027',
  hijri_year: null,
  start_date: null,
  end_date: null,
  total_weeks: 42,
  total_sessions: 0,
  is_current: true,
  center_id: 7,
  terms_count: 6,
  first_term_id: '1',
};

const GOALS = [
  {
    term_id: 1,
    term_number: 1,
    name_ar: 'الفصل الأول',
    study_weeks: 6,
    review_weeks: 1,
    ahzab: 2.81,
  },
  {
    term_id: 2,
    term_number: 2,
    name_ar: 'الفصل الثاني',
    study_weeks: 6,
    review_weeks: 1,
    ahzab: 2.81,
  },
];

const LEVEL: LevelResource = {
  id: 1,
  season_id: 11,
  center_id: 7,
  code: 'L1',
  name_ar: 'L1',
  sessions_per_week: 3,
  thumn_per_session_label: 't',
  thumn_per_session_value: 1,
  thumn_per_week_value: 3,
  ahzab_per_term: 5,
  ahzab_per_dawra: 10,
  duration_label: 'd',
  total_ahzab: 60,
  ahzab_first_term: 2.81,
  term_goals: GOALS,
};

const LEVELS: LevelResource[] = [LEVEL];

const envelope = (data: unknown) => ({ success: true, message: null, data });

const seasonPage = (rows: SeasonResource[]) => ({
  data: rows,
  links: { first: null, last: null, prev: null, next: null },
  meta: {
    current_page: 1,
    from: rows.length ? 1 : null,
    last_page: 1,
    links: [],
    path: '/api/v1/seasons',
    per_page: 20,
    to: rows.length || null,
    total: rows.length,
  },
});

/** `CentersService.listAll()` walks the pagination meta. */
const centerPage = (rows: typeof CENTERS) => ({
  data: rows,
  links: { first: null, last: null, prev: null, next: null },
  meta: {
    current_page: 1,
    from: rows.length ? 1 : null,
    last_page: 1,
    links: [],
    path: '/api/v1/centers',
    per_page: 20,
    to: rows.length || null,
    total: rows.length,
  },
});

describe('LevelsPage', () => {
  let fixture!: ReturnType<typeof TestBed.createComponent<LevelsPage>>;
  let page!: LevelsPage;
  let http!: HttpTestingController;
  let el!: HTMLElement;

  /** Let resource loaders run (they start on the macrotask after CD). */
  const cycle = async (n = 1): Promise<void> => {
    for (let i = 0; i < n; i++) {
      await new Promise<void>((r) => setTimeout(r, 0));
      fixture.detectChanges();
    }
  };

  /** Flush a GET once its resource has actually issued it (effects settle late). */
  const flushWhen = async (part: string, body: object): Promise<void> => {
    for (let i = 0; i < 6; i++) {
      const reqs = http.match((r) => r.url.includes(part) && r.method === 'GET');
      if (reqs.length > 0) {
        reqs.forEach((r) => r.flush(body));
        return;
      }
      await cycle();
    }
    throw new Error(`No GET request for ${part}`);
  };

  /** Boot: centers → auto-picked first center → its season → its levels. */
  const boot = async (levels: LevelResource[] = LEVELS): Promise<void> => {
    await flushWhen('/centers', envelope(centerPage(CENTERS)));
    await cycle();
    await flushWhen('/v1/seasons', envelope(seasonPage([SEASON])));
    await cycle();
    await flushWhen('/v1/levels', envelope(levels));
    await cycle();
  };

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [LevelsPage],
      providers: [
        provideHttpClient(),
        provideHttpClientTesting(),
        provideRouter([]),
        provideTranslateService({
          loader: provideTranslateLoader(() => new TranslateNoOpLoader()),
        }),
        {
          provide: AuthService,
          useFactory: () => ({
            currentUser: signal<AuthLoginResponse['data']['user']>(ADMIN),
            role: signal<AuthLoginResponse['data']['user']['role']>('admin'),
          }),
        },
        {
          provide: AdminPrefsService,
          useValue: { hideScopePickers: signal(false), appearanceCenterId: signal(null) },
        },
      ],
    }).compileComponents();

    http = TestBed.inject(HttpTestingController);
    fixture = TestBed.createComponent(LevelsPage);
    page = fixture.componentInstance;
    el = fixture.nativeElement;
    fixture.detectChanges();
  });

  afterEach(() => http.verify());

  const fillNew = (): void => {
    el.querySelector<HTMLButtonElement>('[data-testid="level-new"]')!.click();
    fixture.detectChanges();
    // Name + label derive from days + unit; only the unit is filled here.
    const set = (id: string, v: string): void => {
      const input = el.querySelector<HTMLInputElement>(`[data-testid="${id}"]`)!;
      input.value = v;
      input.dispatchEvent(new Event('input'));
    };
    set('level-new-thumn-session', '1');
    fixture.detectChanges();
  };

  it('starts on the first center and its current season, with add affordances', async () => {
    await boot();

    expect(page.centerScope()).toBe(7);
    expect(page.seasonId()).toBe(11);
    expect(el.querySelector('[data-testid="level-new"]')).toBeTruthy();
    expect(el.querySelector('[data-testid="edit-level-1"]')).toBeTruthy();
    expect(el.querySelector('[data-testid="levels-scope-banner"]')!.textContent).toContain(
      'level.scope_season',
    );
  });

  it('opens the create form and posts the season id without a code', async () => {
    await boot();
    expect(page.seasonId()).toBe(11);
    expect(el.querySelector('[data-testid="level-create-form"]')).toBeNull();

    fillNew();
    expect(el.querySelector('[data-testid="level-create-form"]')).toBeTruthy();

    const save = el.querySelector<HTMLButtonElement>('[data-testid="level-create-save"]')!;
    expect(save.disabled).toBe(false);
    save.click();

    const req = http.expectOne((r) => r.url.endsWith('/levels') && r.method === 'POST');
    expect(req.request.body.code).toBeUndefined();
    expect(req.request.body.center_id).toBeUndefined();
    expect(req.request.body.season_id).toBe(11);
    expect(req.request.body.name_ar).toBe('3 أثمان في الأسبوع');
    expect(req.request.body.thumn_per_session_label).toBe('ثمن');
    expect(req.request.body.thumn_per_week_value).toBe(3);
    // 6 study weeks × 3 sessions × 1 thumn ÷ 8 = 2.25.
    expect(req.request.body.ahzab_per_term).toBe(2.25);
    req.flush({ success: true, message: null, data: { ...LEVEL, id: 4, code: 'L4' } });

    // Save bumps the tick → the season reloads on the next macrotask.
    await cycle();
    http
      .expectOne((r) => r.url.endsWith('/v1/levels') && r.params.get('season_id') === '11')
      .flush(envelope(LEVELS));
    await cycle();

    expect(page.creating()).toBe(false);
    expect(el.querySelector('[data-testid="level-create-form"]')).toBeNull();
  });

  it('keeps save disabled until a unit is set', async () => {
    await boot();

    fillNew();
    const unit = el.querySelector<HTMLInputElement>('[data-testid="level-new-thumn-session"]')!;
    unit.value = '';
    unit.dispatchEvent(new Event('input'));
    fixture.detectChanges();

    expect(el.querySelector<HTMLButtonElement>('[data-testid="level-create-save"]')!.disabled).toBe(
      true,
    );
  });

  it('blanks the preview and disables save when the unit leaves 1..480', async () => {
    await boot();

    fillNew();
    const unit = el.querySelector<HTMLInputElement>('[data-testid="level-new-thumn-session"]')!;
    unit.value = '120000';
    unit.dispatchEvent(new Event('input'));
    fixture.detectChanges();

    expect(el.querySelector('[data-testid="level-new-name"]')!.textContent).toBe('');
    expect(el.querySelector('[data-testid="level-new-thumn-label"]')!.textContent).toBe('');
    // The week preview rides the thumnDisplay pipe, whose null renders as em-dash.
    expect(el.querySelector('[data-testid="level-new-thumn-week"]')!.textContent).toBe('—');
    expect(el.querySelector<HTMLButtonElement>('[data-testid="level-create-save"]')!.disabled).toBe(
      true,
    );
  });

  it('renders a singular duration label at the fastest in-range pace', async () => {
    await boot();

    fillNew();
    const sessions = el.querySelector<HTMLInputElement>('[data-testid="level-new-sessions"]')!;
    sessions.value = '7';
    sessions.dispatchEvent(new Event('input'));
    const unit = el.querySelector<HTMLInputElement>('[data-testid="level-new-thumn-session"]')!;
    unit.value = '8';
    unit.dispatchEvent(new Event('input'));
    fixture.detectChanges();

    // 7 × 8 = 56 thumn/week → max(1, round(16/56)) = 1 year.
    expect(el.querySelector('[data-testid="level-new-duration"]')!.textContent).toBe('سنة واحدة');
    expect(el.querySelector<HTMLButtonElement>('[data-testid="level-create-save"]')!.disabled).toBe(
      false,
    );
  });

  it('blocks an identical twin before saving and shows the top banner', async () => {
    const twin: LevelResource = {
      ...LEVEL,
      id: 9,
      code: 'L9',
      ahzab_per_term: 2.25,
      ahzab_per_dawra: 11.25,
    };
    await boot([twin]);

    fillNew();
    el.querySelector<HTMLButtonElement>('[data-testid="level-create-save"]')!.click();
    fixture.detectChanges();

    expect(page.errorKey()).toBe('apiErrors.LEVEL_EXISTS');
    expect(el.querySelector('[data-testid="level-create-error"]')).toBeTruthy();
  });

  it('shows the first-term goal and expands the per-term breakdown', async () => {
    await boot();

    expect(el.querySelector('[data-testid="level-goal-1"]')!.textContent).toBe('2.81');
    const toggle = el.querySelector<HTMLButtonElement>('[data-testid="level-goal-toggle-1"]')!;
    expect(toggle.getAttribute('aria-expanded')).toBe('false');

    toggle.click();
    fixture.detectChanges();

    const terms = el.querySelector('[data-testid="level-goal-terms-1"]')!;
    expect(terms.textContent).toContain('الفصل الأول');
    expect(terms.textContent).toContain('6');
    expect(toggle.getAttribute('aria-expanded')).toBe('true');
  });

  it('shows the no-season empty state for a center without seasons', async () => {
    await boot();
    page.setCenterScope('8');
    await cycle();
    await flushWhen('/v1/seasons', envelope(seasonPage([])));
    await cycle();

    expect(page.noSeason()).toBe(true);
    expect(page.seasonId()).toBeNull();
    expect(el.textContent).toContain('level.no_season');
    expect(el.querySelector('[data-testid="level-new"]')).toBeNull();
  });

  it('arms the delete confirm when the row delete button is clicked', async () => {
    await boot();

    const row = el.querySelectorAll('.levels-table tbody tr')[0];
    row.querySelector<HTMLButtonElement>('[data-testid="delete-level-1"]')!.click();
    fixture.detectChanges();

    expect(page.armingDeleteId()).toBe(1);
    expect(el.querySelector('[data-testid="confirm-delete-level-1"]')).toBeTruthy();
  });

  it('recomputes dependents when the edit days or unit change', async () => {
    await boot();

    page.startEdit(LEVEL);
    fixture.detectChanges();

    const sessions = el.querySelector<HTMLInputElement>('[data-testid="level-edit-sessions"]')!;
    sessions.value = '4';
    sessions.dispatchEvent(new Event('input'));
    fixture.detectChanges();

    // 4 days × 1 thumn → week 4; 6 study weeks × 4 × 1 ÷ 8 = 3.
    expect(el.querySelector('[data-testid="level-edit-thumn-week"]')!.textContent).toBe('4');
    expect(el.querySelector('[data-testid="level-edit-ahzab-term"]')!.textContent).toBe('3');
    expect(el.querySelector('[data-testid="level-edit-name"]')!.textContent).toBe('نصف في الأسبوع');
  });

  it('refuses an out-of-range edit unit with the range banner and no PUT', async () => {
    await boot();

    page.startEdit(LEVEL);
    fixture.detectChanges();

    const unit = el.querySelector<HTMLInputElement>('[data-testid="level-edit-thumn-session"]')!;
    unit.value = '0';
    unit.dispatchEvent(new Event('input'));
    fixture.detectChanges();

    el.querySelector<HTMLButtonElement>('[data-testid="level-edit-save"]')!.click();
    fixture.detectChanges();

    expect(page.errorKey()).toBe('level.range');
    http.expectNone((r) => r.method === 'PUT');
  });
});

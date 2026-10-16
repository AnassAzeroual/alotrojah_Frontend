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
import { CurrentUser } from '../../core/api/api-models';
import { AuthService } from '../../core/auth/auth.service';
import { AdminPrefsService } from '../../core/settings/admin-prefs.service';
import { LevelsPage } from './levels.page';

const ADMIN: CurrentUser = {
  id: 1,
  full_name: 'Admin',
  role: 'admin',
  center_id: null,
  teacher_type: 'both',
};

const LEVELS = [
  {
    id: 1,
    code: 'L1',
    name_ar: 'L1',
    center_id: null,
    sessions_per_week: 3,
    thumn_per_session_label: 't',
    thumn_per_session_value: '1.00',
    thumn_per_week_value: '3.00',
    ahzab_per_term: '5.00',
    ahzab_per_dawra: '10.00',
    duration_label: 'd',
    total_ahzab: 60,
  },
];

const envelope = (data: unknown) => ({ success: true, message: null, data });

describe('LevelsPage create', () => {
  let fixture!: ReturnType<typeof TestBed.createComponent<LevelsPage>>;
  let page!: LevelsPage;
  let http!: HttpTestingController;
  let el!: HTMLElement;

  const flushLevels = (body: object = envelope(LEVELS)): void => {
    http.expectOne((r) => r.url.endsWith('/v1/levels') && r.method === 'GET').flush(body);
  };

  const flushCenters = (): void => {
    http.expectOne((r) => r.url.endsWith('/centers') && r.method === 'GET').flush(envelope([]));
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
            currentUser: signal<CurrentUser>(ADMIN),
            role: signal<CurrentUser['role']>('admin'),
          }),
        },
        { provide: AdminPrefsService, useValue: { hideScopePickers: signal(false) } },
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

  it('opens the create form and posts without a code (server assigns L{id})', async () => {
    flushLevels();
    flushCenters();
    await fixture.whenStable();

    expect(el.querySelector('[data-testid="level-create-form"]')).toBeNull();
    fillNew();
    expect(el.querySelector('[data-testid="level-create-form"]')).toBeTruthy();

    const save = el.querySelector<HTMLButtonElement>('[data-testid="level-create-save"]')!;
    expect(save.disabled).toBe(false);
    save.click();

    const req = http.expectOne((r) => r.url.endsWith('/levels') && r.method === 'POST');
    expect(req.request.body.code).toBeUndefined();
    expect(req.request.body.name_ar).toBe('ثمن في الأسبوع');
    expect(req.request.body.thumn_per_session_label).toBe('ثمن');
    expect(req.request.body.thumn_per_week_value).toBe(3);
    expect(req.request.body.ahzab_per_term).toBe(2.25);
    req.flush({ success: true, message: null, data: { ...LEVELS[0], id: 4, code: 'L4' } });
    // Save bumps the tick → the list reloads on the next macrotask; flush it
    // so the harness is clean.
    await new Promise<void>((r) => setTimeout(r, 0));
    fixture.detectChanges();
    http
      .expectOne((r) => r.url.endsWith('/v1/levels') && r.method === 'GET')
      .flush(envelope(LEVELS));
    await fixture.whenStable();

    expect(page.creating()).toBe(false);
    expect(el.querySelector('[data-testid="level-create-form"]')).toBeNull();
  });

  it('keeps save disabled until a unit is set', async () => {
    flushLevels();
    flushCenters();
    await fixture.whenStable();

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
    flushLevels();
    flushCenters();
    await fixture.whenStable();

    fillNew();
    const unit = el.querySelector<HTMLInputElement>('[data-testid="level-new-thumn-session"]')!;
    unit.value = '120000';
    unit.dispatchEvent(new Event('input'));
    fixture.detectChanges();

    expect(el.querySelector<HTMLInputElement>('[data-testid="level-new-name"]')!.value).toBe('');
    expect(el.querySelector<HTMLInputElement>('[data-testid="level-new-thumn-label"]')!.value).toBe(
      '',
    );
    // The week preview rides the thumnDisplay pipe, whose null renders as em-dash.
    expect(el.querySelector<HTMLInputElement>('[data-testid="level-new-thumn-week"]')!.value).toBe(
      '—',
    );
    expect(el.querySelector<HTMLButtonElement>('[data-testid="level-create-save"]')!.disabled).toBe(
      true,
    );
  });

  it('renders a singular duration label at the fastest in-range pace', async () => {
    flushLevels();
    flushCenters();
    await fixture.whenStable();

    fillNew();
    const sessions = el.querySelector<HTMLInputElement>('[data-testid="level-new-sessions"]')!;
    sessions.value = '7';
    sessions.dispatchEvent(new Event('input'));
    const unit = el.querySelector<HTMLInputElement>('[data-testid="level-new-thumn-session"]')!;
    unit.value = '8';
    unit.dispatchEvent(new Event('input'));
    fixture.detectChanges();

    // 7 × 8 = 56 thumn/week → max(1, round(16/56)) = 1 year.
    expect(el.querySelector<HTMLInputElement>('[data-testid="level-new-duration"]')!.value).toBe(
      'سنة واحدة',
    );
    expect(el.querySelector<HTMLButtonElement>('[data-testid="level-create-save"]')!.disabled).toBe(
      false,
    );
  });

  it('blocks an identical twin before saving and shows the top banner', async () => {
    const twin = {
      ...LEVELS[0],
      id: 9,
      code: 'L9',
      thumn_per_week_value: '3.00',
      ahzab_per_term: '2.25',
      ahzab_per_dawra: '11.25',
    };
    flushLevels(envelope([twin]));
    flushCenters();
    await fixture.whenStable();

    fillNew();
    el.querySelector<HTMLButtonElement>('[data-testid="level-create-save"]')!.click();
    fixture.detectChanges();

    expect(page.createErrorKey()).toBe('apiErrors.LEVEL_EXISTS');
    expect(el.querySelector('[data-testid="level-create-error"]')).toBeTruthy();
  });

  it('arms the delete confirm when the row delete button is clicked', async () => {
    flushLevels();
    flushCenters();
    await fixture.whenStable();

    const row = el.querySelectorAll('.levels-table tbody tr')[0];
    row.querySelector<HTMLButtonElement>('[data-testid="delete-level-1"]')!.click();
    fixture.detectChanges();

    expect(page.armingDeleteId()).toBe(1);
    expect(el.querySelector('[data-testid="confirm-delete-level-1"]')).toBeTruthy();
  });

  it('recomputes dependents when the edit days or unit change', async () => {
    flushLevels();
    flushCenters();
    await fixture.whenStable();

    page.startEdit({
      id: 1,
      code: 'L1',
      name_ar: 'L1',
      center_id: null,
      sessions_per_week: 3,
      thumn_per_session_label: 'ثمن',
      thumn_per_session_value: 1,
      thumn_per_week_value: 3,
      ahzab_per_term: 2.25,
      ahzab_per_dawra: 11.25,
      duration_label: 'x',
      total_ahzab: 60,
    });
    fixture.detectChanges();

    const sessions = el.querySelector<HTMLInputElement>('[data-testid="level-edit-sessions"]')!;
    sessions.value = '4';
    sessions.dispatchEvent(new Event('input'));
    fixture.detectChanges();

    // 4 days × 1 thumn → week 4, term 3 (6-week baseline), name derived.
    expect(el.querySelector<HTMLInputElement>('[data-testid="level-edit-thumn-week"]')!.value).toBe(
      '4',
    );
    expect(el.querySelector<HTMLInputElement>('[data-testid="level-edit-ahzab-term"]')!.value).toBe(
      '3',
    );
    expect(el.querySelector<HTMLInputElement>('[data-testid="level-edit-name"]')!.value).toBe(
      'ثمن في الأسبوع',
    );
  });

  it('refuses an out-of-range edit unit with the range banner and no PUT', async () => {
    flushLevels();
    flushCenters();
    await fixture.whenStable();

    page.startEdit({
      id: 1,
      code: 'L1',
      name_ar: 'L1',
      center_id: null,
      sessions_per_week: 3,
      thumn_per_session_label: 'ثمن',
      thumn_per_session_value: 1,
      thumn_per_week_value: 3,
      ahzab_per_term: 2.25,
      ahzab_per_dawra: 11.25,
      duration_label: 'x',
      total_ahzab: 60,
    });
    fixture.detectChanges();

    const unit = el.querySelector<HTMLInputElement>('[data-testid="level-edit-thumn-session"]')!;
    unit.value = '0';
    unit.dispatchEvent(new Event('input'));
    fixture.detectChanges();

    el.querySelector<HTMLButtonElement>('[data-testid="level-edit-save"]')!.click();
    fixture.detectChanges();

    expect(page.editErrorKey()).toBe('level.range');
    http.expectNone((r) => r.method === 'PUT');
  });
});

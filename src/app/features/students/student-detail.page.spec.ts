import { provideHttpClient } from '@angular/common/http';
import { HttpTestingController, provideHttpClientTesting } from '@angular/common/http/testing';
import { Component, signal } from '@angular/core';
import { TestBed } from '@angular/core/testing';
import { provideRouter } from '@angular/router';
import {
  provideTranslateLoader,
  provideTranslateService,
  TranslateNoOpLoader,
} from '@ngx-translate/core';
import { By } from '@angular/platform-browser';
import {
  AuthLoginResponse,
  SeasonDashboardRow,
  SeasonResource,
  StudentResource,
} from '../../core/api/models';
import { AuthService } from '../../core/auth/auth.service';
import { DropdownComponent } from '../../shared/ui/dropdown/dropdown.component';
import { StudentDetailPage } from './student-detail.page';

const STUDENT: StudentResource = {
  id: 11,
  full_name: 'أحمد بن يوسف',
  center_id: 1,
  group: { id: 5, name: 'حلقة النور' },
  level_id: 1,
  birth_date: null,
  enrollment_date: null,
  notes: null,
  user_id: null,
  gender: 'male',
  status: 'active',
  student_type: 'child',
  memorization_mode: 'thumn',
  start_hizb: 3,
};

const ADMIN: AuthLoginResponse['data']['user'] = {
  id: 1,
  full_name: 'Admin',
  role: 'admin',
  center_id: null,
  center_name: null,
  teacher_type: 'both',
};

const authStub = {
  currentUser: signal<AuthLoginResponse['data']['user'] | null>(ADMIN),
  role: signal<AuthLoginResponse['data']['user']['role'] | null>('admin'),
};

// The save flow navigates to /students and /students/:id after a successful
// write; without any route those navigations reject with an unhandled NG04002.
@Component({ standalone: true, template: '' })
class RouterStubComponent {}

describe('StudentDetailPage', () => {
  let fixture!: ReturnType<typeof TestBed.createComponent<StudentDetailPage>>;
  let http!: HttpTestingController;
  let el!: HTMLElement;

  const flushStudent = (s: StudentResource = STUDENT): void => {
    http
      .expectOne((r) => r.url.endsWith('/students/11') && r.method === 'GET')
      .flush({
        success: true,
        message: null,
        data: s,
      });
  };

  const flushSeasons = (): void => {
    const req = http.expectOne((r) => r.url.endsWith('/seasons') && r.method === 'GET');
    // The pupil's center lane only — never the admin-global current row.
    expect(req.request.params.get('center_id')).toBe('1');
    expect(req.request.params.get('current')).toBe('1');
    req.flush({
      success: true,
      message: null,
      data: { data: [] },
    });
  };

  const flushGroups = (): void => {
    const req = http.expectOne((r) => r.url.endsWith('/groups') && r.method === 'GET');
    expect(req.request.params.get('center_id')).toBe('1');
    req.flush({
      success: true,
      message: null,
      data: {
        data: [
          { id: 5, name: 'حلقة النور' },
          { id: 7, name: 'حلقة الفجر' },
        ],
        meta: { current_page: 1, total: 2, per_page: 20 },
      },
    });
  };

  const openDropdown = (): void => {
    el.querySelector<HTMLButtonElement>('.assign-card .dd-btn')!.click();
    fixture.detectChanges();
  };

  const pickOption = (text: string): void => {
    const opt = [...el.querySelectorAll<HTMLButtonElement>('.assign-card .dd-list li button')].find(
      (b) => b.textContent!.includes(text),
    )!;
    opt.click();
    fixture.detectChanges();
  };

  const saveButton = (): HTMLButtonElement =>
    el.querySelector<HTMLButtonElement>('.assign-card .btn-primary')!;

  beforeEach(async () => {
    localStorage.clear();
    sessionStorage.clear();
    await TestBed.configureTestingModule({
      imports: [StudentDetailPage],
      providers: [
        provideHttpClient(),
        provideHttpClientTesting(),
        provideRouter([{ path: '**', component: RouterStubComponent }]),
        provideTranslateService({
          loader: provideTranslateLoader(() => new TranslateNoOpLoader()),
        }),
        { provide: AuthService, useValue: authStub },
      ],
    }).compileComponents();
    http = TestBed.inject(HttpTestingController);
    fixture = TestBed.createComponent(StudentDetailPage);
    fixture.componentRef.setInput('id', '11');
    el = fixture.nativeElement;
    fixture.detectChanges();
    flushStudent();
    // The season lane starts after the pupil resource delivers its center.
    await new Promise<void>((r) => setTimeout(r, 0));
    fixture.detectChanges();
    flushSeasons();
    // Edit-form lookups (levels + centers dropdowns).
    http
      .expectOne((r) => r.url.endsWith('/reference/levels') && r.method === 'GET')
      .flush({ success: true, message: null, data: [] });
    http
      .expectOne((r) => r.url.endsWith('/centers') && r.method === 'GET')
      .flush({ success: true, message: null, data: { data: [] } });
    // Let the student resource value land, then change-detect so the groups
    // resource effect fires; flushing it before whenStable avoids a deadlock
    // (whenStable waits on the pending resource, the test waits on whenStable).
    await new Promise<void>((r) => setTimeout(r, 0));
    fixture.detectChanges();
    flushGroups();
    await fixture.whenStable();
    fixture.detectChanges();
  });

  afterEach(() => http.verify());

  it('renders the hero with the current group and the assign card', () => {
    expect(el.querySelector('h1')!.textContent).toContain('أحمد بن يوسف');
    expect(el.querySelector('.hero')!.textContent).toContain('حلقة النور');
    expect(el.querySelector('.assign-card')).not.toBeNull();
    expect(el.querySelector('.assign-card')!.textContent).toContain('studentDetail.assign_group');
  });

  it('keeps save disabled until a different group is picked', () => {
    expect(saveButton().disabled).toBe(true);

    openDropdown();
    expect(el.querySelectorAll('.assign-card .dd-list button')).toHaveLength(2);
    pickOption('حلقة النور');
    expect(saveButton().disabled).toBe(true);

    openDropdown();
    pickOption('حلقة الفجر');
    expect(saveButton().disabled).toBe(false);
  });

  it('sends the picked group on save and reloads the student', async () => {
    openDropdown();
    pickOption('حلقة الفجر');
    expect(saveButton().disabled).toBe(false);

    saveButton().click();
    const req = http.expectOne((r) => r.url.endsWith('/students/11') && r.method === 'PUT');
    expect(req.request.body).toEqual({ group_id: 7 });
    req.flush({
      success: true,
      message: null,
      data: { ...STUDENT, group: { id: 7, name: 'حلقة الفجر' } },
    });
    fixture.detectChanges(); // tick bump reloads the student
    flushStudent({ ...STUDENT, group: { id: 7, name: 'حلقة الفجر' } });
    // The refreshed pupil re-fires the season lane and groups feed.
    await new Promise<void>((r) => setTimeout(r, 0));
    fixture.detectChanges();
    flushSeasons();
    flushGroups();
    await fixture.whenStable();
    fixture.detectChanges();

    expect(el.querySelector('.hero')!.textContent).toContain('حلقة الفجر');
    expect(saveButton().disabled).toBe(true);
  });
});

describe('StudentDetailPage season lane', () => {
  let fixture!: ReturnType<typeof TestBed.createComponent<StudentDetailPage>>;
  let http!: HttpTestingController;
  let el!: HTMLElement;

  const season = (id: number, centerId: number | null): SeasonResource => ({
    id,
    name: `Season ${id}`,
    hijri_year: null,
    start_date: null,
    end_date: null,
    total_weeks: 0,
    total_sessions: 0,
    is_current: true,
    center_id: centerId,
    first_term_id: null,
  });

  const SUMMARY: SeasonDashboardRow = {
    student_id: 11,
    full_name: STUDENT.full_name,
    level_id: 1,
    group_id: 5,
    season_id: 11,
    season_thumn: 4,
    season_avg_score: 88.5,
    season_avg_sarraj: 90,
    season_attendance_pct: 95,
    season_overall_avg: 89,
    honor_flag: 'none',
  };

  beforeEach(async () => {
    localStorage.clear();
    sessionStorage.clear();
    await TestBed.configureTestingModule({
      imports: [StudentDetailPage],
      providers: [
        provideHttpClient(),
        provideHttpClientTesting(),
        provideRouter([{ path: '**', component: RouterStubComponent }]),
        provideTranslateService({
          loader: provideTranslateLoader(() => new TranslateNoOpLoader()),
        }),
        { provide: AuthService, useValue: authStub },
      ],
    }).compileComponents();
    http = TestBed.inject(HttpTestingController);
    fixture = TestBed.createComponent(StudentDetailPage);
    fixture.componentRef.setInput('id', '11');
    el = fixture.nativeElement;
    fixture.detectChanges();
    http
      .expectOne((r) => r.url.endsWith('/students/11') && r.method === 'GET')
      .flush({ success: true, message: null, data: STUDENT });
    await new Promise<void>((r) => setTimeout(r, 0));
    fixture.detectChanges();
  });

  afterEach(() => http.verify());

  it('resolves the pupil center current season, not a foreign admin current row', async () => {
    const seasonsReq = http.expectOne((r) => r.url.endsWith('/seasons') && r.method === 'GET');
    expect(seasonsReq.request.params.get('center_id')).toBe('1');
    expect(seasonsReq.request.params.get('current')).toBe('1');
    seasonsReq.flush({
      success: true,
      message: null,
      data: {
        data: [
          // Newest admin-global current row belongs to another center.
          season(52, 2),
          season(11, 1),
          season(1, null),
        ],
      },
    });
    http
      .expectOne((r) => r.url.endsWith('/reference/levels') && r.method === 'GET')
      .flush({ success: true, message: null, data: [] });
    http
      .expectOne((r) => r.url.endsWith('/centers') && r.method === 'GET')
      .flush({ success: true, message: null, data: { data: [] } });
    await new Promise<void>((r) => setTimeout(r, 0));
    fixture.detectChanges();
    http
      .expectOne((r) => r.url.endsWith('/groups') && r.method === 'GET')
      .flush({
        success: true,
        message: null,
        data: { data: [], meta: { current_page: 1, total: 0 } },
      });

    const summaryReq = http.expectOne(
      (r) => r.url.endsWith('/dashboard/season') && r.method === 'GET',
    );
    expect(summaryReq.request.params.get('student_id')).toBe('11');
    expect(summaryReq.request.params.get('season_id')).toBe('11');
    const finalReq = http.expectOne(
      (r) => r.url.endsWith('/dashboard/final') && r.method === 'GET',
    );
    expect(finalReq.request.params.get('season_id')).toBe('11');

    summaryReq.flush({ success: true, message: null, data: SUMMARY });
    finalReq.flush({
      success: true,
      message: null,
      data: {
        inputs: { avg_murajaa: 90, avg_weekly: 88, avg_sarraj: 91 },
        quizzes: [],
        divisor: 2,
        final: 84.5,
      },
    });
    await fixture.whenStable();
    fixture.detectChanges();

    const finalCard = el.querySelector('.stat-card.final .stat-value');
    expect(finalCard).not.toBeNull();
    expect(finalCard!.textContent).toContain('84.5');
  });
});

describe('StudentDetailPage account link', () => {
  let fixture!: ReturnType<typeof TestBed.createComponent<StudentDetailPage>>;
  let page!: StudentDetailPage;
  let http!: HttpTestingController;
  let el!: HTMLElement;

  const LINKED: StudentResource = {
    ...STUDENT,
    user: { id: 9, full_name: 'Karim Pupil', email: 'karim@example.org' },
  };

  const ACCOUNTS = [{ id: 9, full_name: 'Karim Pupil', email: 'karim@example.org', center_id: 1 }];
  const GROUPS = {
    success: true,
    message: null,
    data: { data: [{ id: 5, name: 'حلقة النور' }], meta: { current_page: 1, total: 1 } },
  };
  const LEVELS = [{ id: 1, name_ar: 'المستوى الأول' }];

  const flushUrl = (part: string, body: unknown): void => {
    http
      .match((r) => r.url.includes(part) && r.method === 'GET')
      .forEach((req) => req.flush({ success: true, message: null, data: body }));
  };

  const openList = (testId: string): void => {
    const dd = fixture.debugElement
      .queryAll(By.directive(DropdownComponent))
      .map((d) => d.componentInstance)
      .find((c) => c.testId() === testId)!;
    dd.open.set(true);
    fixture.detectChanges();
  };

  const pickText = (text: string): void => {
    const opt = [...el.querySelectorAll<HTMLButtonElement>('.dd.open .dd-list button')].find((b) =>
      b.textContent!.includes(text),
    )!;
    opt.click();
    fixture.detectChanges();
  };

  beforeEach(async () => {
    localStorage.clear();
    sessionStorage.clear();
    await TestBed.configureTestingModule({
      imports: [StudentDetailPage],
      providers: [
        provideHttpClient(),
        provideHttpClientTesting(),
        provideRouter([{ path: '**', component: RouterStubComponent }]),
        provideTranslateService({
          loader: provideTranslateLoader(() => new TranslateNoOpLoader()),
        }),
        { provide: AuthService, useValue: authStub },
      ],
    }).compileComponents();
    http = TestBed.inject(HttpTestingController);
  });

  afterEach(() => http.verify());

  it('shows the linked account read-only in the edit form', async () => {
    fixture = TestBed.createComponent(StudentDetailPage);
    fixture.componentRef.setInput('id', '11');
    page = fixture.componentInstance;
    el = fixture.nativeElement;
    fixture.detectChanges();
    http
      .expectOne((r) => r.url.endsWith('/students/11') && r.method === 'GET')
      .flush({ success: true, message: null, data: LINKED });
    await new Promise<void>((r) => setTimeout(r, 0));
    fixture.detectChanges();
    flushUrl('/seasons', { data: [] });
    flushUrl('/reference/levels', []);
    flushUrl('/centers', { data: [] });
    await new Promise<void>((r) => setTimeout(r, 0));
    fixture.detectChanges();
    flushUrl('/groups', GROUPS.data);
    await fixture.whenStable();
    fixture.detectChanges();

    page.editing.set(true);
    fixture.detectChanges();
    await new Promise<void>((r) => setTimeout(r, 0));
    fixture.detectChanges();
    // Edit mode refires center-dependent feeds (groups/levels/accounts).
    flushUrl('/groups', GROUPS.data);
    flushUrl('/reference/levels', LEVELS);
    flushUrl('/students/unlinked-accounts', ACCOUNTS);
    await fixture.whenStable();
    fixture.detectChanges();

    const linked = el.querySelector('[data-testid="student-account-linked"]')!;
    expect(linked.textContent).toContain('Karim Pupil');
    expect(linked.textContent).toContain('karim@example.org');
    expect(el.querySelector('[data-testid="student-account"]')).toBeNull();
  });

  it('creates the account with the pupil by default and posts the account object', async () => {
    fixture = TestBed.createComponent(StudentDetailPage);
    fixture.componentRef.setInput('id', 'new');
    page = fixture.componentInstance;
    expect(page.isNew()).toBe(true);
    expect(page.accountMode()).toBe('create');
    el = fixture.nativeElement;
    fixture.detectChanges();
    await new Promise<void>((r) => setTimeout(r, 0));
    fixture.detectChanges();
    flushUrl('/seasons', { data: [] });
    flushUrl('/centers', { data: [{ id: 1, name: 'c1' }] });
    flushUrl('/reference/levels', []);
    // Create mode never asks for linkable accounts.
    expect(
      http.match((r) => r.url.endsWith('/students/unlinked-accounts') && r.method === 'GET').length,
    ).toBe(0);
    await new Promise<void>((r) => setTimeout(r, 0));
    fixture.detectChanges();
    flushUrl('/groups', GROUPS.data);
    flushUrl('/reference/levels', LEVELS);
    await fixture.whenStable();
    fixture.detectChanges();

    const set = (testId: string, value: string): void => {
      const input = el.querySelector<HTMLInputElement>(`[data-testid="${testId}"]`)!;
      input.value = value;
      input.dispatchEvent(new Event('input'));
    };
    set('student-name', 'New Pupil');
    set('student-email', 'new.pupil@example.org');
    set('student-password', 'secret123');

    openList('student-group');
    pickText('حلقة النور');
    openList('student-level');
    pickText('المستوى الأول');
    fixture.detectChanges();

    el.querySelector<HTMLFormElement>('form')!.dispatchEvent(new Event('submit'));
    fixture.detectChanges();

    const req = http.expectOne((r) => r.url.endsWith('/students') && r.method === 'POST');
    expect(req.request.body.user_id).toBeUndefined();
    expect(req.request.body.account).toEqual({
      email: 'new.pupil@example.org',
      password: 'secret123',
    });
    expect(req.request.body.full_name).toBe('New Pupil');
    expect(req.request.body.center_id).toBe(1);
    req.flush({ success: true, message: null, data: { id: 12 } });
  });

  it('links an existing account when the mode is switched, prefills the name and posts user_id', async () => {
    fixture = TestBed.createComponent(StudentDetailPage);
    fixture.componentRef.setInput('id', 'new');
    page = fixture.componentInstance;
    expect(page.isNew()).toBe(true);
    el = fixture.nativeElement;
    fixture.detectChanges();
    await new Promise<void>((r) => setTimeout(r, 0));
    fixture.detectChanges();
    flushUrl('/seasons', { data: [] });
    flushUrl('/centers', { data: [{ id: 1, name: 'c1' }] });
    flushUrl('/reference/levels', []);
    await new Promise<void>((r) => setTimeout(r, 0));
    fixture.detectChanges();
    // Single-center auto-select refires the center-dependent feeds.
    flushUrl('/groups', GROUPS.data);
    flushUrl('/reference/levels', LEVELS);
    await fixture.whenStable();
    fixture.detectChanges();

    el.querySelector<HTMLButtonElement>('[data-testid="student-account-link"]')!.click();
    fixture.detectChanges();
    await new Promise<void>((r) => setTimeout(r, 0));
    fixture.detectChanges();
    const accountsReq = http.expectOne(
      (r) => r.url.endsWith('/students/unlinked-accounts') && r.method === 'GET',
    );
    expect(accountsReq.request.params.get('center_id')).toBe('1');
    accountsReq.flush({ success: true, message: null, data: ACCOUNTS });
    await fixture.whenStable();
    fixture.detectChanges();

    openList('student-account');
    pickText('karim@example.org');

    // Smart prefill: empty name takes the account's full name.
    expect(el.querySelector<HTMLInputElement>('[data-testid="student-name"]')!.value).toBe(
      'Karim Pupil',
    );

    openList('student-group');
    pickText('حلقة النور');
    openList('student-level');
    pickText('المستوى الأول');

    const hizb = el.querySelector<HTMLInputElement>('[data-testid="student-start-hizb"]')!;
    hizb.value = '2.5';
    hizb.dispatchEvent(new Event('input'));
    fixture.detectChanges();

    el.querySelector<HTMLFormElement>('form')!.dispatchEvent(new Event('submit'));
    fixture.detectChanges();

    const req = http.expectOne((r) => r.url.endsWith('/students') && r.method === 'POST');
    expect(req.request.body.user_id).toBe(9);
    expect(req.request.body.account).toBeUndefined();
    expect(req.request.body.full_name).toBe('Karim Pupil');
    expect(req.request.body.start_hizb).toBe(2.5);
    expect(req.request.body.center_id).toBe(1);
    expect(req.request.body.group_id).toBe(5);
    expect(req.request.body.level_id).toBe(1);
    req.flush({ success: true, message: null, data: { id: 12 } });
  });
});

describe('StudentDetailPage non-numeric id', () => {
  let fixture!: ReturnType<typeof TestBed.createComponent<StudentDetailPage>>;
  let http!: HttpTestingController;
  let el!: HTMLElement;

  beforeEach(async () => {
    localStorage.clear();
    sessionStorage.clear();
    await TestBed.configureTestingModule({
      imports: [StudentDetailPage],
      providers: [
        provideHttpClient(),
        provideHttpClientTesting(),
        provideRouter([{ path: '**', component: RouterStubComponent }]),
        provideTranslateService({
          loader: provideTranslateLoader(() => new TranslateNoOpLoader()),
        }),
        { provide: AuthService, useValue: authStub },
      ],
    }).compileComponents();
    http = TestBed.inject(HttpTestingController);
    fixture = TestBed.createComponent(StudentDetailPage);
    // Live case 2026-10-17: the route carried /students/NaN.
    fixture.componentRef.setInput('id', 'NaN');
    el = fixture.nativeElement;
    fixture.detectChanges();
  });

  afterEach(() => http.verify());

  it('fires no pupil-scoped HTTP and renders the empty state, not the skeleton', async () => {
    // Benign lookups still fire (seasons, levels, centers for the admin stub).
    http
      .match((r) => !r.url.includes('NaN') && r.method === 'GET')
      .forEach((req) => req.flush({ success: true, message: null, data: { data: [] } }));
    await fixture.whenStable();
    fixture.detectChanges();

    // No request ever carried the non-numeric id (no students/NaN 404, no
    // student_id=NaN 422s) — so no resource errored and nothing froze.
    expect(http.match((r) => r.url.includes('NaN'))).toHaveLength(0);
    expect(el.querySelector('app-empty-state')).not.toBeNull();
    expect(el.querySelector('.skeleton')).toBeNull();
  });
});

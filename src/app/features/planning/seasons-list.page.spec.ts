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
import { AuthLoginResponse } from '../../core/api/models';
import { AuthService } from '../../core/auth/auth.service';
import { SeasonsListPage } from './seasons-list.page';

const ADMIN: AuthLoginResponse['data']['user'] = {
  id: 1,
  full_name: 'Admin',
  role: 'admin',
  center_id: null,
  center_name: null,
  teacher_type: 'both',
};

const TEACHER: AuthLoginResponse['data']['user'] = {
  id: 3,
  full_name: 'Teacher',
  role: 'teacher',
  center_id: 1,
  center_name: 'C',
  teacher_type: 'hifz',
};

const SEASONS = [
  {
    id: 1,
    name: 'موسم أول',
    hijri_year: null,
    start_date: null,
    end_date: null,
    total_weeks: 42,
    total_sessions: 126,
    is_current: true,
    center_id: 1,
    first_term_id: 7,
  },
  {
    id: 2,
    name: 'موسم ثان',
    hijri_year: null,
    start_date: null,
    end_date: null,
    total_weeks: 42,
    total_sessions: 126,
    is_current: false,
    center_id: null,
    first_term_id: 13,
  },
];

const PAGE = {
  success: true,
  message: null,
  data: { data: SEASONS, meta: { current_page: 1, total: 2, per_page: 20 } },
};

const CENTERS = {
  success: true,
  message: null,
  data: {
    data: [
      { id: 1, name: 'مركز النور' },
      { id: 2, name: 'مركز الفرقان' },
    ],
    meta: { current_page: 1, total: 2, per_page: 20 },
  },
};

describe('SeasonsListPage rename', () => {
  let fixture!: ReturnType<typeof TestBed.createComponent<SeasonsListPage>>;
  let page!: SeasonsListPage;
  let http!: HttpTestingController;
  let el!: HTMLElement;
  let role: AuthLoginResponse['data']['user']['role'];

  const settle = async (): Promise<void> => {
    await new Promise<void>((r) => setTimeout(r, 0));
    fixture.detectChanges();
  };

  const mount = (): void => {
    fixture = TestBed.createComponent(SeasonsListPage);
    page = fixture.componentInstance;
    el = fixture.nativeElement;
    fixture.detectChanges();
  };

  const flushList = (): void => {
    http.expectOne((r) => r.url.endsWith('/seasons') && r.method === 'GET').flush(PAGE);
  };

  const flushCenters = (): void => {
    http.expectOne((r) => r.url.endsWith('/centers') && r.method === 'GET').flush(CENTERS);
  };

  const renameInput = (id: number): HTMLInputElement | null =>
    el.querySelector<HTMLInputElement>(`[data-testid="rename-season-input-${id}"]`);

  beforeEach(async () => {
    role = 'admin';
    await TestBed.configureTestingModule({
      imports: [SeasonsListPage],
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
            currentUser: signal<AuthLoginResponse['data']['user']>(
              role === 'admin' ? ADMIN : TEACHER,
            ),
            role: signal<AuthLoginResponse['data']['user']['role']>(role),
          }),
        },
      ],
    }).compileComponents();
    http = TestBed.inject(HttpTestingController);
  });

  afterEach(() => http.verify());

  it('renames a season inline and reloads the list', async () => {
    mount();
    flushCenters();
    flushList();
    await settle();

    el.querySelector<HTMLButtonElement>('[data-testid="rename-season-2"]')!.click();
    fixture.detectChanges();
    expect(renameInput(2)!.value).toBe('موسم ثان');

    renameInput(2)!.value = 'موسم محدث';
    renameInput(2)!.dispatchEvent(new Event('input'));
    fixture.detectChanges();
    el.querySelector<HTMLButtonElement>('[data-testid="rename-season-save-2"]')!.click();
    fixture.detectChanges();

    const req = http.expectOne((r) => r.url.endsWith('/seasons/2') && r.method === 'PUT');
    expect(req.request.body).toEqual({ name: 'موسم محدث' });
    req.flush({ success: true, message: null, data: { ...SEASONS[1], name: 'موسم محدث' } });
    // The list reload runs through the resource effect — let CD tick first.
    await settle();
    flushList();
    await settle();

    // Editor closed after a successful save.
    expect(renameInput(2)).toBeNull();
    expect(el.querySelector<HTMLButtonElement>('[data-testid="rename-season-2"]')).not.toBeNull();
  });

  it('names the owning center on each card and marks legacy shared seasons', async () => {
    mount();
    flushCenters();
    flushList();
    await settle();

    const owners = [...el.querySelectorAll<HTMLElement>('.season-center')];
    expect(owners).toHaveLength(2);
    expect(owners[0].textContent).toContain('مركز النور');
    expect(owners[1].textContent).toContain('planning.shared');
  });

  it('hides rename and delete controls from non-managers', async () => {
    role = 'teacher';
    mount();
    flushCenters();
    flushList();
    await settle();

    expect(page.canManage()).toBe(false);
    expect(el.querySelector('[data-testid="rename-season-1"]')).toBeNull();
    expect(el.querySelector('[data-testid="delete-season-2"]')).toBeNull();
  });

  it('keeps the rename editor open on duplicate-name 422', async () => {
    mount();
    flushCenters();
    flushList();
    await settle();

    el.querySelector<HTMLButtonElement>('[data-testid="rename-season-1"]')!.click();
    fixture.detectChanges();
    renameInput(1)!.value = 'موسم ثان';
    renameInput(1)!.dispatchEvent(new Event('input'));
    fixture.detectChanges();
    el.querySelector<HTMLButtonElement>('[data-testid="rename-season-save-1"]')!.click();
    fixture.detectChanges();

    const req = http.expectOne((r) => r.url.endsWith('/seasons/1') && r.method === 'PUT');
    req.flush(
      { message: 'The name has already been taken.', errors: { name: ['taken'] } },
      { status: 422, statusText: 'Unprocessable Content' },
    );
    await settle();

    expect(renameInput(1)).not.toBeNull();
    expect(page.renameSaving()).toBe(false);
  });
});

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
import { AuthLoginResponse, UserResource } from '../../core/api/models';
import { AuthService } from '../../core/auth/auth.service';
import { UsersListPage } from './users-list.page';

const ADMIN: AuthLoginResponse['data']['user'] = {
  id: 1,
  full_name: 'Admin',
  role: 'admin',
  center_id: null,
  center_name: null,
  teacher_type: 'both',
};

const USERS: UserResource[] = [
  { ...ADMIN, email: 'admin@example.org', phone: null, is_active: true },
  {
    id: 2,
    full_name: 'Sara Teacher',
    role: 'teacher',
    center_id: 1,
    teacher_type: 'hifz',
    email: 'sara@example.org',
    phone: null,
    is_active: true,
  },
];

const CENTERS = [{ id: 1, name: 'مركز النور', city: null }];

const envelope = (data: UserResource[], total = data.length) => ({
  success: true,
  message: null,
  data: { data, meta: { current_page: 1, total, per_page: 20 } },
});

const CENTERS_ENVELOPE = {
  success: true,
  message: null,
  data: { data: CENTERS, meta: { current_page: 1, total: 1, per_page: 20 } },
};

describe('UsersListPage', () => {
  let fixture!: ReturnType<typeof TestBed.createComponent<UsersListPage>>;
  let page!: UsersListPage;
  let http!: HttpTestingController;
  let el!: HTMLElement;

  const settle = async (): Promise<void> => {
    await new Promise<void>((r) => setTimeout(r, 0));
    fixture.detectChanges();
  };

  const flushUsers = (body: object): void => {
    http.expectOne((r) => r.url.endsWith('/users') && r.method === 'GET').flush(body);
  };

  const flushCenters = (): void => {
    http.expectOne((r) => r.url.endsWith('/centers') && r.method === 'GET').flush(CENTERS_ENVELOPE);
  };

  const mountWith = (body: object): void => {
    flushUsers(body);
    flushCenters();
  };

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [UsersListPage],
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
      ],
    }).compileComponents();
    http = TestBed.inject(HttpTestingController);
    fixture = TestBed.createComponent(UsersListPage);
    page = fixture.componentInstance;
    el = fixture.nativeElement;
    fixture.detectChanges();
  });

  afterEach(() => http.verify());

  it('shows the loading status instead of the empty state on first paint', () => {
    expect(el.querySelector('.lt-progress')).toBeTruthy();
    expect(el.querySelector('app-empty-state')).toBeNull();
    mountWith(envelope(USERS));
  });

  it('lists users through the shared table with resolved center names', async () => {
    mountWith(envelope(USERS));
    await settle();

    expect(el.querySelectorAll('.users-table tbody tr').length).toBe(2);
    expect(el.textContent).toContain('Sara Teacher');
    expect(el.textContent).toContain('مركز النور');
    expect(el.querySelector('.lt-progress')).toBeNull();
    expect(el.querySelector('[aria-busy="true"]')).toBeNull();
  });

  it('clears an armed delete and the replacer dialog state when the page changes', async () => {
    flushUsers(envelope(USERS, 25));
    flushCenters();
    await settle();

    el.querySelector<HTMLButtonElement>('[data-testid="delete-user-2"]')!.click();
    fixture.detectChanges();
    expect(el.querySelector('[data-testid="confirm-delete-user-2"]')).toBeTruthy();

    const next = el.querySelectorAll<HTMLButtonElement>('.pager button')[1];
    next.click();
    fixture.detectChanges();

    // The armed row state clears immediately, before the next page arrives.
    expect(page.armingDeleteId()).toBeNull();
    expect(el.querySelector('[data-testid="confirm-delete-user-2"]')).toBeNull();

    // The pager stays mounted on the empty second page (total known) so the
    // user can step back.
    flushUsers(envelope([], 25));
    await settle();
    expect(el.querySelector('app-paginator')).toBeTruthy();
    expect(el.querySelector('app-empty-state')).toBeTruthy();
  });

  it('opens the replacer dialog when delete answers NEED_REPLACER', async () => {
    mountWith(envelope(USERS));
    await settle();

    el.querySelector<HTMLButtonElement>('[data-testid="delete-user-2"]')!.click();
    fixture.detectChanges();
    el.querySelector<HTMLButtonElement>('[data-testid="confirm-delete-user-2"]')!.click();

    const req = http.expectOne((r) => r.url.endsWith('/users/2') && r.method === 'DELETE');
    req.flush(
      {
        success: false,
        message: 'This teacher owns groups or history — choose a replacer.',
        errors: {
          code: 'NEED_REPLACER',
          teacher: { id: 2, full_name: 'Sara Teacher', teacher_type: 'hifz', center_id: 1 },
          groups: [{ id: 7, name: 'G1' }],
        },
      },
      { status: 422, statusText: 'Unprocessable Content' },
    );
    await settle();

    expect(page.busyId()).toBeNull();
    expect(page.pendingReplace()?.id).toBe(2);
    expect(el.querySelector('[data-testid="replace-dialog"]')).toBeTruthy();
  });
});

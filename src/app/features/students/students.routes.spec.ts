import { provideHttpClient } from '@angular/common/http';
import { HttpTestingController, provideHttpClientTesting } from '@angular/common/http/testing';
import { signal } from '@angular/core';
import { TestBed } from '@angular/core/testing';
import { provideRouter, withComponentInputBinding } from '@angular/router';
import { RouterTestingHarness } from '@angular/router/testing';
import {
  provideTranslateLoader,
  provideTranslateService,
  TranslateNoOpLoader,
} from '@ngx-translate/core';
import { AuthLoginResponse } from '../../core/api/models';
import { AuthService } from '../../core/auth/auth.service';
import { StudentDetailPage } from './student-detail.page';
import { STUDENTS_ROUTES } from './students.routes';

const roleData = (path: string): string[] =>
  (STUDENTS_ROUTES.find((r) => r.path === path)?.data?.['roles'] ?? []) as string[];

describe('student routes (pupils never create pupils)', () => {
  it('admits students to the list and their own detail, never to creation', () => {
    expect(roleData('')).toContain('student');
    expect(roleData(':id')).toContain('student');
    expect(roleData('new')).not.toContain('student');
  });

  it("binds the create id on the 'new' route (the static segment has no params)", () => {
    expect(STUDENTS_ROUTES.find((r) => r.path === 'new')?.data?.['id']).toBe('new');
  });
});

describe('students/new renders the create form', () => {
  let harness!: RouterTestingHarness;
  let http!: HttpTestingController;

  beforeEach(async () => {
    localStorage.clear();
    sessionStorage.clear();
    TestBed.configureTestingModule({
      providers: [
        provideHttpClient(),
        provideHttpClientTesting(),
        provideRouter(
          [{ path: 'students', children: STUDENTS_ROUTES }],
          withComponentInputBinding(),
        ),
        provideTranslateService({
          loader: provideTranslateLoader(() => new TranslateNoOpLoader()),
        }),
        {
          provide: AuthService,
          useValue: {
            isLoggedIn: () => true,
            sessionProbed: signal(true),
            ready: Promise.resolve(),
            currentUser: signal<AuthLoginResponse['data']['user'] | null>({
              id: 1,
              full_name: 'Admin',
              role: 'admin',
              center_id: null,
              center_name: null,
              teacher_type: 'both',
            }),
            role: signal<AuthLoginResponse['data']['user']['role']>('admin'),
          },
        },
      ],
    });
    http = TestBed.inject(HttpTestingController);
    harness = await RouterTestingHarness.create();
  });

  afterEach(() => http.verify());

  it('activates the detail page with id=new and shows the form, firing no pupil GET', async () => {
    // Live case 2026-10-17: without the static data above, the required id
    // input throws and the + button lands on a dead page.
    const page = await harness.navigateByUrl('/students/new', StudentDetailPage);
    expect(page).toBeTruthy();

    // Season + create-form lookups fire; the pupil loaders stay quiet. Bodies
    // match each service's unwrapped shape (seasons/centers paginated, levels
    // and accounts raw arrays).
    const fired: string[] = [];
    http
      .match((r) => r.method === 'GET')
      .forEach((req) => {
        fired.push(req.request.url);
        const raw =
          req.request.url.includes('/reference/levels') ||
          req.request.url.endsWith('/students/unlinked-accounts');
        req.flush({ success: true, message: null, data: raw ? [] : { data: [] } });
      });
    await harness.fixture.whenStable();
    harness.fixture.detectChanges();

    // No pupil-scoped GET fired (no /students/NaN, no numeric detail fetch —
    // creation needs none) and the create form rendered.
    expect(fired.filter((u) => /\/students\/(?!unlinked-accounts)[^/]+$/.test(u))).toEqual([]);
    expect(harness.fixture.nativeElement.querySelector('form')).not.toBeNull();
    expect(harness.fixture.nativeElement.querySelector('h1')!.textContent).toContain(
      'students.create',
    );
  });
});

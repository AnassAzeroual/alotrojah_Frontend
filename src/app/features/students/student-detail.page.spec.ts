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
import { CurrentUser, Student } from '../../core/api/api-models';
import { AuthService } from '../../core/auth/auth.service';
import { StudentDetailPage } from './student-detail.page';

const STUDENT: Student = {
  id: 11,
  full_name: 'أحمد بن يوسف',
  center_id: 1,
  group: { id: 5, name: 'حلقة النور' },
  level_id: 1,
  gender: 'male',
  status: 'active',
  student_type: 'child',
  memorization_mode: 'thumn',
  start_hizb: 3,
};

const ADMIN: CurrentUser = {
  id: 1,
  full_name: 'Admin',
  role: 'admin',
  center_id: null,
  teacher_type: 'both',
};

const authStub = {
  currentUser: signal<CurrentUser | null>(ADMIN),
  role: signal<CurrentUser['role'] | null>('admin'),
};

describe('StudentDetailPage', () => {
  let fixture!: ReturnType<typeof TestBed.createComponent<StudentDetailPage>>;
  let http!: HttpTestingController;
  let el!: HTMLElement;

  const flushStudent = (s: Student = STUDENT): void => {
    http
      .expectOne((r) => r.url.endsWith('/students/11') && r.method === 'GET')
      .flush({
        success: true,
        message: null,
        data: s,
      });
  };

  const flushSeasons = (): void => {
    http
      .expectOne((r) => r.url.endsWith('/seasons') && r.method === 'GET')
      .flush({
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
    await TestBed.configureTestingModule({
      imports: [StudentDetailPage],
      providers: [
        provideHttpClient(),
        provideHttpClientTesting(),
        provideRouter([]),
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
    // The refreshed student re-fires the groups feed; flush before whenStable.
    await new Promise<void>((r) => setTimeout(r, 0));
    fixture.detectChanges();
    flushGroups();
    await fixture.whenStable();
    fixture.detectChanges();

    expect(el.querySelector('.hero')!.textContent).toContain('حلقة الفجر');
    expect(saveButton().disabled).toBe(true);
  });
});

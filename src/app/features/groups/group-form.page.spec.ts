import { provideHttpClient } from '@angular/common/http';
import { HttpTestingController, provideHttpClientTesting } from '@angular/common/http/testing';
import { signal } from '@angular/core';
import { TestBed } from '@angular/core/testing';
import { provideRouter, Router } from '@angular/router';
import {
  provideTranslateLoader,
  provideTranslateService,
  TranslateNoOpLoader,
} from '@ngx-translate/core';
import { By } from '@angular/platform-browser';
import { vi } from 'vitest';
import { CurrentUser } from '../../core/api/api-models';
import { AuthService } from '../../core/auth/auth.service';
import { DropdownComponent } from '../../shared/ui/dropdown/dropdown.component';
import { GroupFormPage } from './group-form.page';

const ADMIN: CurrentUser = {
  id: 1,
  full_name: 'Admin',
  role: 'admin',
  center_id: null,
  teacher_type: 'both',
};

const SUPERVISOR: CurrentUser = {
  id: 2,
  full_name: 'المشرف',
  role: 'supervisor',
  center_id: 1,
  teacher_type: 'hifz',
};

const LEVELS = [{ id: 1, code: 'L1', name_ar: 'المستوى الأول' }];

const CENTERS = {
  data: [{ id: 1, name: 'المركز الأول', city: null }],
  meta: { current_page: 1, total: 1, per_page: 20 },
};

const TEACHERS = {
  data: [
    {
      id: 3,
      full_name: 'ياسين العلوي',
      role: 'teacher',
      center_id: 1,
      teacher_type: 'hifz',
      email: 'y@example.com',
      phone: null,
      is_active: true,
    },
  ],
  meta: { current_page: 1, total: 1, per_page: 20 },
};

describe('GroupFormPage', () => {
  let fixture!: ReturnType<typeof TestBed.createComponent<GroupFormPage>>;
  let page!: GroupFormPage;
  let http!: HttpTestingController;
  let el!: HTMLElement;
  let navigate!: ReturnType<typeof vi.spyOn>;
  let role: 'admin' | 'supervisor';

  const settle = async (): Promise<void> => {
    await new Promise<void>((r) => setTimeout(r, 0));
    fixture.detectChanges();
  };

  const mount = (): void => {
    fixture = TestBed.createComponent(GroupFormPage);
    page = fixture.componentInstance;
    el = fixture.nativeElement;
    fixture.detectChanges();
  };

  const flushLevels = (): void => {
    // The levels feed refires whenever the center scope changes.
    http
      .match((r) => r.url.includes('/reference/levels') && r.method === 'GET')
      .forEach((req) => req.flush({ success: true, message: null, data: LEVELS }));
  };

  const flushCenters = (): void => {
    http
      .expectOne((r) => r.url.endsWith('/centers') && r.method === 'GET')
      .flush({ success: true, message: null, data: CENTERS });
  };

  const flushTeachers = (): void => {
    http
      .expectOne(
        (r) =>
          r.url.endsWith('/users') &&
          r.method === 'GET' &&
          r.params.get('role') === 'teacher' &&
          r.params.get('center_id') === '1',
      )
      .flush({ success: true, message: null, data: TEACHERS });
  };

  const dropdown = (key: string): DropdownComponent | undefined =>
    fixture.debugElement
      .queryAll(By.directive(DropdownComponent))
      .map((d) => d.componentInstance)
      .find((c) => c.ariaLabelKey() === key || c.placeholderKey() === key);

  const pick = (key: string, label: string): void => {
    dropdown(key)!.open.set(true);
    fixture.detectChanges();
    const btn = Array.from(el.querySelectorAll<HTMLButtonElement>('.dd-list button')).find(
      (b) => b.textContent!.trim() === label,
    )!;
    btn.click();
    fixture.detectChanges();
  };

  const openTeacherList = (): string[] => {
    dropdown('grp.col_teacher')!.open.set(true);
    fixture.detectChanges();
    return Array.from(el.querySelectorAll<HTMLButtonElement>('.dd-list button')).map((b) =>
      b.textContent!.trim(),
    );
  };

  const type = (selector: string, value: string): void => {
    const input = el.querySelector<HTMLInputElement>(selector)!;
    input.value = value;
    input.dispatchEvent(new Event('input'));
    fixture.detectChanges();
  };

  const saveBtn = (): HTMLButtonElement =>
    el.querySelector<HTMLButtonElement>('.form-actions .btn-primary')!;

  // jsdom never performs implicit form submission: clicks drive the direct
  // handler here, while real browsers additionally submit the form on Enter
  // (both paths share the same saving() guard, so double-fires collapse).
  const submitForm = (): void => {
    saveBtn().click();
    fixture.detectChanges();
  };

  beforeEach(async () => {
    localStorage.clear();
    role = 'admin';
    await TestBed.configureTestingModule({
      imports: [GroupFormPage],
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
            currentUser: signal<CurrentUser>(role === 'admin' ? ADMIN : SUPERVISOR),
            role: signal<CurrentUser['role'] | null>(role),
          }),
        },
      ],
    }).compileComponents();
    http = TestBed.inject(HttpTestingController);
    navigate = vi.spyOn(TestBed.inject(Router), 'navigate');
  });

  afterEach(() => http.verify());

  it('saves an admin-created group with the picked center and navigates back', async () => {
    mount();
    flushLevels();
    flushCenters();
    await settle();

    pick('dash.center', 'المركز الأول');
    await settle();
    flushLevels();
    flushTeachers();
    await settle();

    pick('grp.col_level', 'المستوى الأول');
    type('input[type="text"]', 'حلقة E2E');
    type('input[type="number"]', '20');
    // WEEKDAY_KEYS order: Mon..Sun → index 5 = Sat, index 0 = Mon.
    el.querySelectorAll<HTMLButtonElement>('.day-pick .day-chip')[5].click();
    el.querySelectorAll<HTMLButtonElement>('.day-pick .day-chip')[0].click();
    fixture.detectChanges();

    submitForm();
    const req = http.expectOne((r) => r.url.endsWith('/groups') && r.method === 'POST');
    expect(req.request.body).toEqual({
      name: 'حلقة E2E',
      center_id: 1,
      level_id: 1,
      teacher_id: null,
      capacity: 20,
      schedule_days: 'Sat,Mon',
    });
    req.flush({
      success: true,
      message: null,
      data: {
        id: 9,
        name: 'حلقة E2E',
        center_id: 1,
        level_id: 1,
        capacity: 20,
        schedule_days: 'Sat,Mon',
        is_active: true,
      },
    });
    // save resets the composer (guard-clean), which refires the levels feed
    // at the next change detection — drain before AND after it.
    flushLevels();
    fixture.detectChanges();
    flushLevels();
    fixture.detectChanges();
    expect(navigate).toHaveBeenCalledWith(['/groups']);
  });

  it('offers the flushed same-center teachers in the picker', async () => {
    mount();
    flushLevels();
    flushCenters();
    await settle();

    pick('dash.center', 'المركز الأول');
    await settle();
    flushLevels();
    flushTeachers();
    await settle();

    expect(openTeacherList()).toContain('ياسين العلوي');
  });

  it('scopes supervisors to their own center without a center field', async () => {
    role = 'supervisor';
    mount();
    flushLevels();
    flushTeachers(); // fires immediately with center_id=1 from currentUser
    await settle();

    expect(dropdown('dash.center')).toBeUndefined();
    expect(el.textContent).not.toContain('registrations.pick_center');

    pick('grp.col_level', 'المستوى الأول');
    type('input[type="text"]', 'حلقة المشرف');

    submitForm();
    const req = http.expectOne((r) => r.url.endsWith('/groups') && r.method === 'POST');
    expect(req.request.body).toEqual({
      name: 'حلقة المشرف',
      center_id: 1,
      level_id: 1,
      teacher_id: null,
      capacity: null,
      schedule_days: '',
    });
    req.flush({
      success: true,
      message: null,
      data: {
        id: 10,
        name: 'حلقة المشرف',
        center_id: 1,
        level_id: 1,
        capacity: null,
        schedule_days: '',
        is_active: true,
      },
    });
    // save resets the composer (guard-clean), which refires the levels feed
    // at the next change detection — drain before AND after it.
    flushLevels();
    fixture.detectChanges();
    flushLevels();
    fixture.detectChanges();
    expect(navigate).toHaveBeenCalledWith(['/groups']);
  });

  it('keeps save disabled until name, center and level are set', async () => {
    mount();
    flushLevels();
    flushCenters();
    await settle();

    expect(saveBtn().disabled).toBe(true);

    type('input[type="text"]', 'بلا مستوى');
    expect(saveBtn().disabled).toBe(true);

    pick('dash.center', 'المركز الأول');
    await settle();
    flushLevels();
    flushTeachers();
    await settle();
    expect(saveBtn().disabled).toBe(true);

    pick('grp.col_level', 'المستوى الأول');
    expect(saveBtn().disabled).toBe(false);
    expect(page.saving()).toBe(false);
  });

  describe('edit mode (/groups/:id/edit)', () => {
    const DETAIL = {
      season_name: null,
      group: {
        id: 9,
        name: 'حلقة قديمة',
        center_id: 1,
        level: { id: 1, name_ar: 'المستوى الأول' },
        teacher: null,
        academic_year: null,
        schedule_days: 'Mon',
        is_active: true,
        capacity: 20,
        students_count: 0,
        fill_pct: null,
        avg_score: null,
        attendance_pct: null,
        thumn_total: 0,
        breakdown: [],
      },
      breakdown: [],
      trend: [],
      students: [],
    };

    const mountEdit = async (): Promise<void> => {
      fixture = TestBed.createComponent(GroupFormPage);
      fixture.componentRef.setInput('id', '9');
      page = fixture.componentInstance;
      el = fixture.nativeElement;
      fixture.detectChanges();
      flushCenters(); // admin feed fires on mount, before the detail lands
      http
        .expectOne((r) => r.url.endsWith('/groups/9/detail') && r.method === 'GET')
        .flush({ success: true, message: null, data: DETAIL });
      await settle();
      flushLevels();
      flushTeachers();
      await settle();
    };

    it('seeds the composer from the loaded group and PUTs back to detail', async () => {
      await mountEdit();

      expect(el.querySelector<HTMLInputElement>('input[type="text"]')!.value).toBe('حلقة قديمة');
      expect(el.querySelector<HTMLInputElement>('[data-testid="group-active"]')!.checked).toBe(
        true,
      );
      expect(saveBtn().disabled).toBe(false);
      expect(page.isDirty()).toBe(false);

      type('input[type="text"]', 'حلقة محدثة');
      expect(page.isDirty()).toBe(true);

      submitForm();
      const req = http.expectOne((r) => r.url.endsWith('/groups/9') && r.method === 'PUT');
      expect(req.request.body).toEqual({
        name: 'حلقة محدثة',
        level_id: 1,
        teacher_id: null,
        capacity: 20,
        schedule_days: 'Mon',
        is_active: true,
      });
      req.flush({ success: true, message: null, data: { id: 9 } });
      fixture.detectChanges();
      expect(navigate).toHaveBeenCalledWith(['/groups', 9]);
    });

    it('marks the guard dirty when active is switched off', async () => {
      await mountEdit();
      expect(page.isDirty()).toBe(false);

      const box = el.querySelector<HTMLInputElement>('[data-testid="group-active"]')!;
      box.checked = false;
      box.dispatchEvent(new Event('change'));
      fixture.detectChanges();

      expect(page.isDirty()).toBe(true);
    });
  });
});

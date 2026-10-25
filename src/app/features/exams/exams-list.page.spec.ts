import { Component, signal } from '@angular/core';
import { TestBed } from '@angular/core/testing';
import { provideRouter } from '@angular/router';
import {
  provideTranslateLoader,
  provideTranslateService,
  TranslateNoOpLoader,
} from '@ngx-translate/core';
import { of } from 'rxjs';
import {
  AuthLoginResponse,
  StudentExamBriefResponse,
  StudentResource,
} from '../../core/api/models';
import { AuthService } from '../../core/auth/auth.service';
import { ExamsService } from '../../core/api/exams.service';
import { GroupsService } from '../../core/api/groups.service';
import { PlanningService } from '../../core/api/planning.service';
import { ReferenceService } from '../../core/api/reference.service';
import { StudentsService } from '../../core/api/students.service';
import { ExamsListPage } from './exams-list.page';

@Component({ standalone: true, template: '' })
class RouterStubComponent {}

const ADMIN: AuthLoginResponse['data']['user'] = {
  id: 1,
  full_name: 'Admin',
  role: 'admin',
  center_id: null,
  center_name: null,
  teacher_type: 'both',
};
const STUDENT_USER: AuthLoginResponse['data']['user'] = {
  id: 9,
  full_name: 'Pupil',
  role: 'student',
  center_id: 1,
  center_name: 'C1',
  teacher_type: null,
};

const STUDENT: StudentResource = {
  id: 11,
  full_name: 'Pupil One',
  center_id: 1,
  group: { id: 5, name: 'Group A' },
  level: { id: 1, code: 'L1', name_ar: 'Level 1' },
  level_id: 1,
  birth_date: null,
  enrollment_date: null,
  notes: null,
  user_id: 9,
  gender: 'male',
  status: 'active',
  student_type: 'child',
  memorization_mode: 'thumn',
  start_hizb: 2,
};

const BRIEF: StudentExamBriefResponse['data'] = {
  student: STUDENT,
  group: {
    id: 5,
    name: 'Group A',
    center_id: 1,
    academic_year: null,
    capacity: 20,
    schedule_days: 'Mon,Wed',
    is_active: true,
    teacher: { id: 3, full_name: 'Teacher A', phone: null, teacher_type: 'both' },
  },
  season: { id: 1, name: '2026-2027' },
  summary: {
    season_thumn: 12,
    season_avg_score: 15.5,
    season_avg_sarraj: null,
    season_attendance_pct: 92,
    season_overall_avg: 15,
    honor_flag: null,
  },
  memorization: {
    last: {
      id: 1,
      log_date: '2026-10-20',
      log_mode: 'thumn',
      thumn_amount: 1.25,
      hizb_no: 2,
      thumn_no: 3,
      surah_ref: null,
      ayah_from: null,
      ayah_to: null,
    },
    items: [
      {
        id: 1,
        log_date: '2026-10-20',
        log_mode: 'thumn',
        thumn_amount: 1.25,
        hizb_no: 2,
        thumn_no: 3,
        surah_ref: null,
        ayah_from: null,
        ayah_to: null,
      },
    ],
    total_thumn: 12,
  },
  exams: [],
  current: {
    mode: 'thumn',
    hizb: 2,
    thumn: 3,
    surah: null,
    ayah_from: null,
    ayah_to: null,
    source: 'last_log',
  },
};

const GROUP_PAGE = {
  data: [BRIEF.group!],
  links: { first: null, last: null, prev: null, next: null },
  meta: {
    current_page: 1,
    from: 1,
    last_page: 1,
    links: [],
    path: '/api/v1/groups',
    per_page: 20,
    to: 1,
    total: 1,
  },
};

const STUDENT_PAGE = {
  data: [STUDENT],
  links: { first: null, last: null, prev: null, next: null },
  meta: {
    current_page: 1,
    from: 1,
    last_page: 1,
    links: [],
    path: '/api/v1/students',
    per_page: 20,
    to: 1,
    total: 1,
  },
};

describe('ExamsListPage student-first builder', () => {
  let create: ReturnType<typeof vi.fn>;

  const setup = async (
    userRole: 'admin' | 'student',
  ): Promise<{
    fixture: ReturnType<typeof TestBed.createComponent<ExamsListPage>>;
    el: HTMLElement;
  }> => {
    const role = signal<AuthLoginResponse['data']['user']['role'] | null>(userRole);
    create = vi.fn(() => of({ id: 42 }));
    await TestBed.configureTestingModule({
      imports: [ExamsListPage],
      providers: [
        provideRouter([{ path: 'exams/:id', component: RouterStubComponent }]),
        provideTranslateService({
          loader: provideTranslateLoader(() => new TranslateNoOpLoader()),
        }),
        {
          provide: AuthService,
          useValue: { role, currentUser: signal(userRole === 'admin' ? ADMIN : STUDENT_USER) },
        },
        { provide: GroupsService, useValue: { listAll: async () => GROUP_PAGE.data } },
        {
          provide: StudentsService,
          useValue: {
            listAll: async () => [STUDENT],
            list: () => of(STUDENT_PAGE),
            examBrief: () => of(BRIEF),
          },
        },
        {
          provide: ReferenceService,
          useValue: { surahs: () => of([{ id: 1, name_ar: 'الفاتحة', ayahs_count: 7 }]) },
        },
        { provide: PlanningService, useValue: { terms: () => of([{ id: 1, name_ar: 'T1' }]) } },
        {
          provide: ExamsService,
          useValue: { create, addQuestions: () => of([]) },
        },
      ],
    }).compileComponents();

    const fixture = TestBed.createComponent(ExamsListPage);
    fixture.detectChanges();
    await fixture.whenStable();
    fixture.detectChanges();
    return { fixture, el: fixture.nativeElement };
  };

  it('staff picks a section and pupil from cards, then sees the four test cards', async () => {
    const { fixture, el } = await setup('admin');
    expect(el.querySelector('[data-testid="exam-group-picker"]')).toBeTruthy();
    el.querySelector<HTMLButtonElement>('[data-testid^="exam-group-card-"]')!.click();
    fixture.detectChanges();
    await fixture.whenStable();
    fixture.detectChanges();
    expect(el.querySelector('[data-testid="exam-pupil-picker"]')).toBeTruthy();

    el.querySelector<HTMLButtonElement>('[data-testid^="exam-pupil-card-"]')!.click();
    fixture.detectChanges();
    await fixture.whenStable();
    fixture.detectChanges();

    expect(el.querySelector('[data-testid="exam-student-card"]')).toBeTruthy();
    expect(el.querySelectorAll('[data-testid^="exam-test-"]').length).toBe(4);
    expect(el.querySelector('[data-testid="exam-hizb"]')).toBeTruthy();
    expect(el.querySelector('[data-testid="exam-current-portion"]')!.textContent).toContain(
      'exam.portion_thumn',
    );
  });

  it('starts a live test and saves its weighted question atomically', async () => {
    const { fixture, el } = await setup('admin');
    el.querySelector<HTMLButtonElement>('[data-testid^="exam-group-card-"]')!.click();
    fixture.detectChanges();
    await fixture.whenStable();
    fixture.detectChanges();
    el.querySelector<HTMLButtonElement>('[data-testid^="exam-pupil-card-"]')!.click();
    fixture.detectChanges();
    await fixture.whenStable();
    fixture.detectChanges();

    el.querySelector<HTMLButtonElement>('[data-testid="exam-test-weekly"]')!.click();
    fixture.detectChanges();
    el.querySelector<HTMLButtonElement>('[data-testid="exam-submit"]')!.click();
    fixture.detectChanges();
    expect(el.querySelector('[data-testid="exam-live"]')).toBeTruthy();
    expect(el.querySelector('[data-testid="live-q-weight-0"]')).toBeTruthy();

    const score = el.querySelector<HTMLInputElement>('[data-testid="live-q-score-0"]')!;
    score.value = '15';
    score.dispatchEvent(new Event('input'));
    fixture.detectChanges();

    const finish = el.querySelector<HTMLButtonElement>('[data-testid="exam-live-finish"]')!;
    expect(finish.disabled).toBe(false);
    finish.click();
    fixture.detectChanges();

    expect(create).toHaveBeenCalledTimes(1);
    const payload = create.mock.calls[0][0] as {
      questions: Array<{ max_score: number; score: number }>;
    };
    expect(payload.questions).toHaveLength(1);
    expect(payload.questions[0].max_score).toBe(20);
    expect(payload.questions[0].score).toBe(15);
  });

  it('term exam opens the two printable paper models with Quran references', async () => {
    const { fixture, el } = await setup('admin');
    el.querySelector<HTMLButtonElement>('[data-testid^="exam-group-card-"]')!.click();
    fixture.detectChanges();
    await fixture.whenStable();
    fixture.detectChanges();
    el.querySelector<HTMLButtonElement>('[data-testid^="exam-pupil-card-"]')!.click();
    fixture.detectChanges();
    await fixture.whenStable();
    fixture.detectChanges();

    el.querySelector<HTMLButtonElement>('[data-testid="exam-submit"]')!.click();
    fixture.detectChanges();
    expect(el.querySelector('[data-testid="paper-model1"]')).toBeTruthy();
    expect(el.querySelector('[data-testid="paper-model2"]')).toBeTruthy();
    expect(el.querySelectorAll('[data-testid^="paper-m1-ayah-"]').length).toBe(5);
    expect(el.querySelector('[data-testid="paper-m2-ayah-from"]')).toBeTruthy();
    expect(el.textContent).toContain('exam.print');
  });

  it('a pupil gets their own card but no creation controls', async () => {
    const { el } = await setup('student');
    expect(el.querySelector('[data-testid="exam-student"]')).toBeNull();
    expect(el.querySelector('[data-testid="exam-student-card"]')).toBeTruthy();
    expect(el.querySelectorAll('[data-testid^="exam-test-"]').length).toBe(0);
    expect(el.querySelector('[data-testid="exam-submit"]')).toBeNull();
  });
});

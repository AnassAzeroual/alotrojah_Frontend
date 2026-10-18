import { TestBed } from '@angular/core/testing';
import {
  provideTranslateLoader,
  provideTranslateService,
  TranslateNoOpLoader,
} from '@ngx-translate/core';
import { of } from 'rxjs';
import { AuthService } from '../../core/auth/auth.service';
import { PlanningService } from '../../core/api/planning.service';
import { ReferenceService } from '../../core/api/reference.service';
import { TermResultResource } from '../../core/api/models';
import { ResultsService } from '../../core/api/results.service';
import { StudentsService } from '../../core/api/students.service';
import { TermResultsPage } from './term-results.page';

const OWN_RESULT: TermResultResource = {
  id: 9,
  student_id: 5,
  season_id: 1,
  term_id: 3,
  hifz_total: 17.5,
  murajaa_total: 15,
  exam_score: 18,
  general_avg: 16.8,
  teacher_notes: 'جيد',
  supervisor_note: 'ممتاز',
  honor_flag: 'intibah',
};

const OWN_STUDENT = {
  id: 5,
  full_name: 'أحمد طالب',
  center_id: 1,
  level_id: 1,
  gender: 'male',
  status: 'active',
  student_type: 'child',
  memorization_mode: 'thumn',
  start_hizb: 1,
};

const resultsStub = {
  termResults: () => of({ data: [OWN_RESULT] }),
  upsertTerm: (p: unknown) => of({ data: OWN_RESULT, ...(p as object) }),
};

const studentsStub = {
  list: () => of({ data: [OWN_STUDENT] }),
};

const planningStub = {
  terms: () => of([{ id: 3, name_ar: 'الفصل الأول' }]),
};

const refStub = {
  seasons: () => of({ data: [{ id: 1, is_current: true, name_ar: '1448' }] }),
};

const studentAuth = {
  isLoggedIn: () => true,
  role: () => 'student',
  currentUser: () => ({ id: 1, role: 'student', full_name: 'أحمد طالب' }),
};

const teacherAuth = {
  isLoggedIn: () => true,
  role: () => 'teacher',
  currentUser: () => ({ id: 1, role: 'teacher', full_name: 'معلم' }),
};

describe('TermResultsPage', () => {
  const setup = (auth: unknown) => {
    TestBed.configureTestingModule({
      imports: [TermResultsPage],
      providers: [
        provideTranslateService({
          loader: provideTranslateLoader(() => new TranslateNoOpLoader()),
        }),
        { provide: AuthService, useValue: auth },
        { provide: ResultsService, useValue: resultsStub },
        { provide: StudentsService, useValue: studentsStub },
        { provide: PlanningService, useValue: planningStub },
        { provide: ReferenceService, useValue: refStub },
      ],
    });
    const fixture = TestBed.createComponent(TermResultsPage);
    fixture.detectChanges();
    return fixture;
  };

  afterEach(() => TestBed.resetTestingModule());

  it('auto-targets the pupil own result, read-only', async () => {
    const fixture = setup(studentAuth);
    const page = fixture.componentInstance;
    await fixture.whenStable();
    fixture.detectChanges();
    const el = fixture.nativeElement as HTMLElement;

    // Own student + current season's first term are auto-picked (§C3).
    expect(page.isStudent()).toBe(true);
    expect(page.pickedStudent()).toBe(5);
    expect(page.pickedTerm()).toBe(3);

    // No search UI, no upsert affordances.
    expect(el.querySelector('[data-testid="results-student-search"]')).toBeNull();
    expect(el.querySelector('button[type="submit"]')).toBeNull();

    // The read-only card surfaces the own result.
    const text = el.textContent ?? '';
    expect(text).toContain('16.8');
    expect(text).toContain('intibah');
    expect(page.form.pristine).toBe(true);
  });

  it('keeps the staff search/upsert surface for teachers', async () => {
    const fixture = setup(teacherAuth);
    const page = fixture.componentInstance;
    const el = fixture.nativeElement as HTMLElement;

    expect(page.isStudent()).toBe(false);
    expect(page.pickedStudent()).toBeNull();
    expect(page.pickedTerm()).toBeNull();
    expect(el.querySelector('[data-testid="results-student-search"]')).not.toBeNull();
    // The upsert form only renders once a pupil + term are picked; no auto-pick for staff.
    expect(el.querySelector('button[type="submit"]')).toBeNull();
  });
});

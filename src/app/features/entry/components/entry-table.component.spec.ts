import { HttpErrorResponse } from '@angular/common/http';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import {
  provideTranslateLoader,
  provideTranslateService,
  TranslateNoOpLoader,
} from '@ngx-translate/core';
import { of, throwError } from 'rxjs';
import { ScoringModule, Student } from '../../../core/api/api-models';
import { EntryService } from '../../../core/api/entry.service';
import { EntryTableComponent } from './entry-table.component';

const STUDENTS: Student[] = [
  {
    id: 1,
    full_name: 'A',
    center_id: 1,
    level_id: 1,
    gender: null,
    status: 'active',
    student_type: 'child',
    memorization_mode: 'thumn',
    start_hizb: 1,
  },
  {
    id: 2,
    full_name: 'B',
    center_id: 1,
    level_id: 1,
    gender: null,
    status: 'active',
    student_type: 'child',
    memorization_mode: 'thumn',
    start_hizb: 1,
  },
];

const MODULES: ScoringModule[] = [
  {
    id: 1,
    code: 'hifz',
    name_ar: 'h',
    max_points: 14,
    scope: 'weekly',
    is_active: true,
    is_in_weekly_total: true,
    sort_order: 1,
  },
  {
    id: 2,
    code: 'mowathaba',
    name_ar: 'm',
    max_points: 4,
    scope: 'weekly',
    is_active: true,
    is_in_weekly_total: true,
    sort_order: 2,
  },
  {
    id: 5,
    code: 'sarraj',
    name_ar: 's',
    max_points: 20,
    scope: 'weekly',
    is_active: true,
    is_in_weekly_total: false,
    sort_order: 5,
  },
];

const cap422 = (errors: Record<string, string[]>): HttpErrorResponse =>
  new HttpErrorResponse({ status: 422, error: { message: 'Validation.', errors } });

describe('EntryTableComponent', () => {
  let fixture: ComponentFixture<EntryTableComponent>;
  let cmp: EntryTableComponent;
  let el: HTMLElement;
  const calls: { method: string; args: unknown[] }[] = [];
  const fail: { att?: unknown; scores?: unknown; goal?: unknown } = {};
  const entryMock = {
    attendanceBulk: (...args: unknown[]) => {
      calls.push({ method: 'attendanceBulk', args });
      return fail.att ? throwError(() => fail.att) : of({ attendance_ids: [1] });
    },
    scoresBulk: (...args: unknown[]) => {
      calls.push({ method: 'scoresBulk', args });
      return fail.scores
        ? throwError(() => fail.scores)
        : of({ weekly_totals: {}, memorizations_saved: 1 });
    },
    upsertGoal: (...args: unknown[]) => {
      calls.push({ method: 'upsertGoal', args });
      return fail.goal ? throwError(() => fail.goal) : of({ id: 3 });
    },
    deleteAttendance: (...args: unknown[]) => {
      calls.push({ method: 'deleteAttendance', args });
      return of(null);
    },
    goals: () => of({ data: [] }),
  };

  beforeEach(async () => {
    calls.length = 0;
    delete fail.att;
    delete fail.scores;
    delete fail.goal;
    await TestBed.configureTestingModule({
      imports: [EntryTableComponent],
      providers: [
        { provide: EntryService, useValue: entryMock },
        provideTranslateService({
          loader: provideTranslateLoader(() => new TranslateNoOpLoader()),
        }),
      ],
    }).compileComponents();
    fixture = TestBed.createComponent(EntryTableComponent);
    cmp = fixture.componentInstance;
    el = fixture.nativeElement as HTMLElement;
    fixture.componentRef.setInput('students', STUDENTS);
    fixture.componentRef.setInput('modules', MODULES);
    fixture.componentRef.setInput('scoreRows', []);
    fixture.componentRef.setInput('attendanceRows', []);
    fixture.componentRef.setInput('sessionId', 9);
    fixture.componentRef.setInput('weekId', 7);
    fixture.detectChanges();
  });

  it('renders one row per pupil with module headers and live totals', () => {
    expect(el.querySelectorAll('.erow.line').length).toBe(2);
    expect(el.querySelector('.ehead')!.textContent).toContain('h');
    expect(el.querySelectorAll('.erow.line app-dropdown').length).toBe(2);
    cmp.setScore(1, 'hifz', 13);
    cmp.setScore(1, 'mowathaba', 3);
    cmp.setScore(1, 'sarraj', 17); // separate total, excluded like before
    expect(cmp.totalFor(STUDENTS[0])).toBe(16);
  });

  it('saves only the touched row and only its dirty parts', () => {
    let emitted = 0;
    cmp.saved.subscribe(() => emitted++);
    cmp.setStatus(1, 'late');
    cmp.setScore(1, 'hifz', 13);
    cmp.editGoal(1, { target: 'goal t' });
    cmp.saveRow(1);
    expect(calls.map((c) => c.method)).toEqual(['attendanceBulk', 'scoresBulk', 'upsertGoal']);
    expect(calls[0].args[1]).toEqual([{ student_id: 1, status: 'late' }]);
    expect(emitted).toBe(1);
    expect(cmp.rowDirty(1)).toBe(false);

    // The untouched pupil sends nothing.
    cmp.saveRow(2);
    expect(calls.length).toBe(3);
  });

  it('flags the refused cells and the row banner on a scores 422, keeping edits', () => {
    cmp.setScore(1, 'mowathaba', 5);
    fail.scores = cap422({ 'records.0.score': ['Must be between 0 and 4.'] });
    let emitted = 0;
    cmp.saved.subscribe(() => emitted++);
    cmp.saveRow(1);
    fixture.detectChanges();

    expect(emitted).toBe(0);
    expect(el.querySelector('[data-testid="row-banner"]')).not.toBeNull();
    expect(cmp.badCells().get(1)?.has('1:mowathaba')).toBe(true);
    expect(cmp.cellsFor(STUDENTS[0])[1].current).toBe(5);

    cmp.setScore(1, 'mowathaba', 4);
    fixture.detectChanges();
    expect(el.querySelector('[data-testid="row-banner"]')).toBeNull();
  });

  it('flags the row banner when attendance or goal refuse', () => {
    cmp.setStatus(1, 'late');
    fail.att = cap422({ 'records.0.status': ['Invalid status.'] });
    cmp.saveRow(1);
    fixture.detectChanges();
    expect(el.querySelector('[data-testid="row-banner"]')).not.toBeNull();
    // The refused attendance edit is kept for correction.
    expect(cmp.attStatus(1)).toBe('late');

    cmp.editGoal(1, { target: 'x' });
    fail.goal = cap422({ target_text: ['Too long.'] });
    delete fail.att;
    cmp.saveRow(1);
    fixture.detectChanges();
    expect(el.querySelector('[data-testid="row-banner"]')).not.toBeNull();
  });

  it('skips scores for murajaa teachers but still saves attendance and goal', () => {
    fixture.componentRef.setInput('disabledAll', true);
    fixture.detectChanges();
    cmp.setStatus(1, 'late');
    cmp.editGoal(1, { target: 'g' });
    cmp.saveRow(1);
    expect(calls.map((c) => c.method)).toEqual(['attendanceBulk', 'upsertGoal']);
  });

  it('always sends the memorized amount on memorization sessions', () => {
    fixture.componentRef.setInput('showMemorization', true);
    fixture.componentRef.setInput('defaultMemorization', () => 1.25);
    fixture.detectChanges();
    cmp.saveRow(1);
    const scores = calls.find((c) => c.method === 'scoresBulk');
    expect(scores?.args[2]).toEqual([{ student_id: 1, thumn_amount: 1.25 }]);
  });

  it('drops goal drafts when the week changes', () => {
    cmp.editGoal(1, { target: 'week 7 goal' });
    expect(cmp.goalTarget(1)).toBe('week 7 goal');
    fixture.componentRef.setInput('weekId', 8);
    fixture.detectChanges();
    expect(cmp.goalTarget(1)).toBe('');
  });

  it('deletes the attendance record when the row has one', () => {
    fixture.componentRef.setInput('attendanceRows', [
      { id: 44, student_id: 1, session_id: 9, week_id: 7, status: 'late', notes: null },
    ]);
    fixture.detectChanges();
    let emitted = 0;
    cmp.saved.subscribe(() => emitted++);
    cmp.clearAttendance(1);
    expect(calls.map((c) => c.method)).toEqual(['deleteAttendance']);
    expect(emitted).toBe(1);
  });
});

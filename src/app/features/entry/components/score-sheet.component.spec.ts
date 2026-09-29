import { ComponentFixture, TestBed } from '@angular/core/testing';
import { provideTranslateLoader, provideTranslateService, TranslateNoOpLoader } from '@ngx-translate/core';
import { of } from 'rxjs';
import { ScoringModule, Student } from '../../../core/api/api-models';
import { EntryService } from '../../../core/api/entry.service';
import { ScoreSheetComponent } from './score-sheet.component';

const STUDENTS: Student[] = [
  { id: 1, full_name: 'A', center_id: 1, level_id: 1, gender: null, status: 'active', student_type: 'child', memorization_mode: 'thumn', start_hizb: 1 },
  { id: 2, full_name: 'B', center_id: 1, level_id: 1, gender: null, status: 'active', student_type: 'child', memorization_mode: 'thumn', start_hizb: 1 },
];

const MODULES: ScoringModule[] = [
  { id: 1, code: 'hifz', name_ar: 'h', max_points: 14, scope: 'weekly', is_active: true, is_in_weekly_total: true, sort_order: 1 },
  { id: 2, code: 'mowathaba', name_ar: 'm', max_points: 4, scope: 'weekly', is_active: true, is_in_weekly_total: true, sort_order: 2 },
  { id: 3, code: 'tajwid', name_ar: 't', max_points: 2, scope: 'weekly', is_active: true, is_in_weekly_total: true, sort_order: 3 },
  { id: 5, code: 'sarraj', name_ar: 's', max_points: 20, scope: 'weekly', is_active: true, is_in_weekly_total: false, sort_order: 5 },
];

describe('ScoreSheetComponent', () => {
  let fixture: ComponentFixture<ScoreSheetComponent>;
  let cmp: ScoreSheetComponent;
  const posted: unknown[] = [];
  const entryMock = {
    scoresBulk: (sid: number, records: unknown[]) => {
      posted.push({ sid, records });
      return of({ weekly_totals: {} });
    },
  };

  beforeEach(async () => {
    posted.length = 0;
    await TestBed.configureTestingModule({
      imports: [ScoreSheetComponent],
      providers: [
        { provide: EntryService, useValue: entryMock },
        provideTranslateService({ loader: provideTranslateLoader(() => new TranslateNoOpLoader()) }),
      ],
    }).compileComponents();
    fixture = TestBed.createComponent(ScoreSheetComponent);
    cmp = fixture.componentInstance;
    fixture.componentRef.setInput('students', STUDENTS);
    fixture.componentRef.setInput('modules', MODULES);
    fixture.componentRef.setInput('scoreRows', []);
    fixture.componentRef.setInput('sessionId', 9);
    fixture.detectChanges();
  });

  it('totals only in-total modules (sarraj excluded)', () => {
    cmp.setScore(1, 'hifz', 13);
    cmp.setScore(1, 'mowathaba', 3);
    cmp.setScore(1, 'tajwid', 2);
    cmp.setScore(1, 'sarraj', 17);
    const row = cmp.rows().find((r) => r.student.id === 1);
    expect(row?.total).toBe(18);
    expect(cmp.dirty()).toBe(true);
  });

  it('shows existing values and clears edits on save', () => {
    fixture.componentRef.setInput('scoreRows', [
      { student_id: 2, scores: [{ id: 1, student_id: 2, session_id: 9, module: { code: 'hifz', name_ar: 'h', max_points: 14 }, score: 10 }], weekly_total: 10 },
    ]);
    fixture.detectChanges();
    const row = cmp.rows().find((r) => r.student.id === 2);
    expect(row?.total).toBe(10);
    let emitted = 0;
    cmp.saved.subscribe(() => emitted++);
    cmp.setScore(2, 'mowathaba', 4);
    cmp.save();
    expect(emitted).toBe(1);
    expect(cmp.dirty()).toBe(false);
    expect(posted.length).toBe(1);
  });

  it('sends nothing when disabled (murajaa view)', () => {
    fixture.componentRef.setInput('disabledAll', true);
    fixture.detectChanges();
    cmp.setScore(1, 'hifz', 5);
    cmp.save();
    expect(posted.length).toBe(0);
  });
});

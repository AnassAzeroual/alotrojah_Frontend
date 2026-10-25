import {
  ChangeDetectionStrategy,
  Component,
  ElementRef,
  computed,
  effect,
  inject,
  resource,
  signal,
  viewChild,
} from '@angular/core';
import { FormControl, FormGroup, FormsModule, ReactiveFormsModule } from '@angular/forms';
import { TranslatePipe } from '@ngx-translate/core';
import { firstValueFrom } from 'rxjs';
import { PlanningService } from '../../core/api/planning.service';
import { ReferenceService } from '../../core/api/reference.service';
import { ResultsService } from '../../core/api/results.service';
import {
  HonorFlag,
  StudentResource,
  TermResultResource,
  V1TermBreakdownResponse,
} from '../../core/api/models';
import { leaveController } from '../../core/guards/leave-controller';
import { StudentsService } from '../../core/api/students.service';
import { AuthService } from '../../core/auth/auth.service';
import {
  DropdownComponent,
  DropdownValue,
  dropdownNumber,
} from '../../shared/ui/dropdown/dropdown.component';
import { SpinnerComponent } from '../../shared/ui/spinner/spinner.component';
import { StatusBadgeComponent } from '../../shared/ui/status-badge/status-badge.component';
import { BreakdownMetric, TermBreakdownPanelComponent } from './term-breakdown-panel.component';

const SCORE_FIELDS = ['hifz_total', 'murajaa_total', 'exam_score', 'general_avg'] as const;
const DETAIL_SCORE_FIELDS = ['hifz_total', 'murajaa_total', 'exam_score'] as const;

type SaveState = 'idle' | 'saved' | 'error';

@Component({
  selector: 'app-term-results-page',
  standalone: true,
  imports: [
    FormsModule,
    ReactiveFormsModule,
    TranslatePipe,
    DropdownComponent,
    SpinnerComponent,
    StatusBadgeComponent,
    TermBreakdownPanelComponent,
  ],
  changeDetection: ChangeDetectionStrategy.OnPush,
  templateUrl: './term-results.page.html',
  styleUrl: './term-results.page.scss',
})
export class TermResultsPage {
  private readonly resultsSvc = inject(ResultsService);
  private readonly studentsSvc = inject(StudentsService);
  private readonly planning = inject(PlanningService);
  private readonly ref = inject(ReferenceService);
  private readonly auth = inject(AuthService);
  private readonly detailPanel = viewChild<ElementRef<HTMLElement>>('detailPanel');

  /** §C: pupils read their own result only — no student board, no upsert. */
  readonly isStudent = computed(() => this.auth.role() === 'student');

  readonly pickedStudent = signal<number | null>(null);
  readonly pickedTerm = signal<number | null>(null);
  readonly selectedBreakdown = signal<BreakdownMetric | null>(null);
  readonly saving = signal(false);
  readonly saveState = signal<SaveState>('idle');
  private readonly tick = signal(0);
  private readonly loadedDraftKey = signal<string | null>(null);

  readonly levels = resource({
    params: () => ({}),
    loader: () => firstValueFrom(this.ref.levels()),
  });
  private readonly levelNames = computed(
    () =>
      new Map(
        (this.levels.hasValue() ? (this.levels.value() ?? []) : []).map((level) => [
          level.id,
          level.name_ar,
        ]),
      ),
  );

  readonly seasons = resource({
    params: () => ({}),
    loader: () => firstValueFrom(this.ref.seasons()),
  });

  readonly terms = resource({
    params: () => ({ s: this.currentSeasonId() }),
    loader: ({ params }) =>
      params.s === null ? Promise.resolve([]) : firstValueFrom(this.planning.terms(params.s)),
  });

  private currentSeasonId(): number | null {
    const list = this.seasons.hasValue() ? (this.seasons.value()?.data ?? []) : [];
    return list.find((s) => s.is_current)?.id ?? list[0]?.id ?? null;
  }

  private termRows() {
    return this.terms.hasValue() ? (this.terms.value() ?? []) : [];
  }

  readonly termOptions = computed(() => [
    { value: '', label: '—' },
    ...this.termRows().map((t) => ({ value: t.id, label: t.name_ar })),
  ]);

  readonly selectedTermName = computed(
    () => this.termRows().find((t) => t.id === this.pickedTerm())?.name_ar ?? '',
  );

  readonly honorOptions = [
    { value: 'none', labelKey: 'honor.none' },
    { value: 'tashji3', labelKey: 'honor.tashji3' },
    { value: 'intibah', labelKey: 'honor.intibah' },
  ];

  /**
   * Every pupil is on the board from the start — no search step. The API
   * supports 100/page, and the loader walks any remaining pages so nobody is
   * hidden behind a paginator.
   */
  readonly students = resource({
    params: () => ({}),
    loader: () => this.loadAllStudents(),
  });

  readonly studentRows = computed(() =>
    [...(this.students.hasValue() ? (this.students.value() ?? []) : [])].sort((a, b) =>
      a.full_name.localeCompare(b.full_name, 'ar'),
    ),
  );

  readonly selectedStudent = computed(() => {
    if (this.isStudent()) return this.studentRows()[0] ?? null;
    const id = this.pickedStudent();
    if (id === null) return null;
    return this.studentRows().find((student) => student.id === id) ?? null;
  });

  /** One result-set request per term powers every card + the editor. */
  readonly termResults = resource({
    params: () => ({ t: this.pickedTerm(), tick: this.tick() }),
    loader: ({ params }) =>
      params.t === null ? Promise.resolve([]) : this.loadAllTermResults(params.t),
  });

  /** Loaded once per pupil/term when a proof box is opened. */
  readonly breakdown = resource({
    params: () => ({
      student: this.selectedStudent()?.id ?? null,
      term: this.pickedTerm(),
      open: this.selectedBreakdown() !== null,
    }),
    loader: ({ params }): Promise<V1TermBreakdownResponse['data'] | null> =>
      !params.open || params.student === null || params.term === null
        ? Promise.resolve(null)
        : firstValueFrom(
            this.resultsSvc.termBreakdown({
              student_id: params.student,
              term_id: params.term,
            }),
          ),
  });

  private readonly resultByStudent = computed(
    () =>
      new Map(
        (this.termResults.hasValue() ? (this.termResults.value() ?? []) : []).map((result) => [
          result.student_id,
          result,
        ]),
      ),
  );

  readonly selectedResult = computed(() => {
    const student = this.selectedStudent();
    if (!student) return null;
    return this.resultByStudent().get(student.id) ?? null;
  });

  readonly draftKey = computed(() => {
    const student = this.selectedStudent();
    const term = this.pickedTerm();
    return student && term !== null ? `${student.id}:${term}` : null;
  });

  readonly draftReady = computed(
    () => this.draftKey() !== null && this.loadedDraftKey() === this.draftKey(),
  );

  readonly leave = leaveController();

  readonly form = new FormGroup({
    hifz_total: new FormControl<number | null>(null),
    murajaa_total: new FormControl<number | null>(null),
    exam_score: new FormControl<number | null>(null),
    general_avg: new FormControl<number | null>(null),
    teacher_notes: new FormControl('', { nonNullable: true }),
    supervisor_note: new FormControl('', { nonNullable: true }),
    honor_flag: new FormControl<HonorFlag>('none', { nonNullable: true }),
  });
  readonly scoreFields = SCORE_FIELDS;
  readonly detailScoreFields = DETAIL_SCORE_FIELDS;

  constructor() {
    // Both staff and pupils start on the first term of the current season.
    effect(() => {
      const first = this.termRows()[0];
      if (first && this.pickedTerm() === null) this.pickedTerm.set(first.id);
    });

    // A pupil lands on their own row automatically.
    effect(() => {
      if (!this.isStudent()) return;
      const mine = this.studentRows()[0];
      if (mine && this.pickedStudent() !== mine.id) this.pickedStudent.set(mine.id);
    });

    // Once the term result-set is in, hydrate the editor exactly once per
    // student/term pair. Saving refreshes the set without wiping the form.
    effect(() => {
      const student = this.selectedStudent();
      const term = this.pickedTerm();
      if (!student || term === null || this.termResults.isLoading() || this.termResults.error()) {
        return;
      }
      const key = `${student.id}:${term}`;
      if (this.loadedDraftKey() === key) return;
      this.hydrateDraft(this.selectedResult(), key);
    });
  }

  protected setTerm(value: DropdownValue): void {
    const next = dropdownNumber(value);
    if (next === this.pickedTerm()) return;
    this.withDirtyCheck(() => {
      this.resetDraft();
      this.pickedTerm.set(next);
    });
  }

  protected selectStudent(student: StudentResource): void {
    if (this.pickedStudent() === student.id) {
      this.closeResult();
      return;
    }
    this.withDirtyCheck(() => {
      this.resetDraft();
      this.pickedStudent.set(student.id);
      this.scrollToDetailOnPhone();
    });
  }

  protected closeResult(): void {
    this.withDirtyCheck(() => {
      this.resetDraft();
      this.pickedStudent.set(null);
    });
  }

  protected openBreakdown(metric: BreakdownMetric): void {
    this.selectedBreakdown.update((current) => (current === metric ? null : metric));
  }

  protected closeBreakdown(): void {
    this.selectedBreakdown.set(null);
  }

  protected metricForScore(field: string): BreakdownMetric {
    if (field === 'general_avg') return 'general';
    if (field === 'exam_score') return 'exam';
    if (field === 'murajaa_total') return 'murajaa';
    return 'hifz';
  }

  protected levelName(id: number | null | undefined): string {
    if (id === null || id === undefined) return '';
    return this.levelNames().get(id) ?? '';
  }

  protected initials(name: string): string {
    return name.trim().charAt(0) || '—';
  }

  protected resultFor(studentId: number): TermResultResource | null {
    return this.resultByStudent().get(studentId) ?? null;
  }

  isDirty(): boolean {
    return this.form.dirty;
  }

  submit(): void {
    const student = this.selectedStudent();
    const term = this.pickedTerm();
    if (!student || term === null || this.saving()) return;
    const v = this.form.getRawValue();
    this.saving.set(true);
    this.saveState.set('idle');
    this.resultsSvc
      .upsertTerm({
        student_id: student.id,
        term_id: term,
        hifz_total: v.hifz_total,
        murajaa_total: v.murajaa_total,
        exam_score: v.exam_score,
        general_avg: v.general_avg,
        teacher_notes: v.teacher_notes || null,
        supervisor_note: v.supervisor_note || null,
        honor_flag: v.honor_flag,
      })
      .subscribe({
        next: () => {
          this.saving.set(false);
          this.form.markAsPristine();
          this.saveState.set('saved');
          this.tick.update((n) => n + 1);
        },
        error: () => {
          this.saving.set(false);
          this.saveState.set('error');
        },
      });
  }

  private async loadAllStudents(): Promise<StudentResource[]> {
    const first = await firstValueFrom(this.studentsSvc.list({ page: 1, per_page: 100 }));
    const rows = [...first.data];
    for (let page = 2; page <= first.meta.last_page; page++) {
      const next = await firstValueFrom(this.studentsSvc.list({ page, per_page: 100 }));
      rows.push(...next.data);
    }
    return rows;
  }

  private async loadAllTermResults(termId: number): Promise<TermResultResource[]> {
    const first = await firstValueFrom(this.resultsSvc.termResults({ term_id: termId, page: 1 }));
    const rows = [...first.data];
    for (let page = 2; page <= first.meta.last_page; page++) {
      const next = await firstValueFrom(this.resultsSvc.termResults({ term_id: termId, page }));
      rows.push(...next.data);
    }
    return rows;
  }

  private hydrateDraft(result: TermResultResource | null, key: string): void {
    this.form.reset({
      hifz_total: result?.hifz_total ?? null,
      murajaa_total: result?.murajaa_total ?? null,
      exam_score: result?.exam_score ?? null,
      general_avg: result?.general_avg ?? null,
      teacher_notes: result?.teacher_notes ?? '',
      supervisor_note: result?.supervisor_note ?? '',
      honor_flag: result?.honor_flag ?? 'none',
    });
    this.form.markAsPristine();
    this.saveState.set('idle');
    this.loadedDraftKey.set(key);
  }

  private resetDraft(): void {
    this.selectedBreakdown.set(null);
    this.form.reset({
      hifz_total: null,
      murajaa_total: null,
      exam_score: null,
      general_avg: null,
      teacher_notes: '',
      supervisor_note: '',
      honor_flag: 'none',
    });
    this.form.markAsPristine();
    this.saveState.set('idle');
    this.loadedDraftKey.set(null);
  }

  private withDirtyCheck(action: () => void): void {
    if (!this.form.dirty) {
      action();
      return;
    }
    this.leave.confirmLeave().subscribe((confirmed) => {
      if (confirmed) action();
    });
  }

  private scrollToDetailOnPhone(): void {
    if (!globalThis.matchMedia?.('(max-width: 767px)').matches) return;
    setTimeout(() => this.detailPanel()?.nativeElement.scrollIntoView({ block: 'start' }));
  }
}

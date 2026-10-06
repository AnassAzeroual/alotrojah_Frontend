import {
  ChangeDetectionStrategy,
  Component,
  computed,
  effect,
  inject,
  input,
  resource,
  signal,
} from '@angular/core';
import {
  FormControl,
  FormGroup,
  FormsModule,
  ReactiveFormsModule,
  Validators,
} from '@angular/forms';
import { Router } from '@angular/router';
import { TranslatePipe } from '@ngx-translate/core';
import { firstValueFrom } from 'rxjs';
import { ExamsService } from '../../core/api/exams.service';
import { leaveController } from '../../core/guards/leave-controller';
import { apiErrorKey } from '../../core/api/api-errors';
import { PlanningService } from '../../core/api/planning.service';
import { AuthService } from '../../core/auth/auth.service';
import {
  DropdownComponent,
  DropdownOption,
  dropdownNumber,
} from '../../shared/ui/dropdown/dropdown.component';
import { EmptyStateComponent } from '../../shared/ui/empty-state/empty-state.component';
import { SpinnerComponent } from '../../shared/ui/spinner/spinner.component';
import { ScoreInputComponent } from '../../shared/ui/score-input/score-input.component';

type ExamType = 'hizb_completion' | 'term_batch' | 'final_season';

interface DraftRow {
  key: number;
  question_no: number;
  prompt_text: string;
  max_score: number;
  score: number | null;
}

@Component({
  selector: 'app-exam-detail-page',
  standalone: true,
  imports: [
    FormsModule,
    ReactiveFormsModule,
    TranslatePipe,
    DropdownComponent,
    SpinnerComponent,
    EmptyStateComponent,
    ScoreInputComponent,
  ],
  changeDetection: ChangeDetectionStrategy.OnPush,
  templateUrl: './exam-detail.page.html',
  styleUrl: './exam-detail.page.scss',
})
export class ExamDetailPage {
  readonly id = input.required<number, string>({ transform: (v: string) => Number(v) });

  private readonly examsSvc = inject(ExamsService);
  private readonly planning = inject(PlanningService);
  private readonly auth = inject(AuthService);
  private readonly router = inject(Router);
  private readonly tick = signal(0);
  readonly saving = signal(false);

  readonly canEdit = computed(() =>
    ['admin', 'supervisor', 'teacher'].includes(this.auth.role() ?? ''),
  );
  readonly canDelete = computed(() => ['admin', 'supervisor'].includes(this.auth.role() ?? ''));

  protected readonly num = dropdownNumber;

  readonly examTypeOptions: DropdownOption[] = [
    { value: 'hizb_completion', labelKey: 'examType.hizb_completion' },
    { value: 'term_batch', labelKey: 'examType.term_batch' },
    { value: 'final_season', labelKey: 'examType.final_season' },
  ];

  // Edit-exam signals, initialized from the loaded exam (re-init after each save).
  readonly editDate = signal('');
  readonly editType = signal<ExamType>('term_batch');
  readonly editTerm = signal<number | null>(null);
  private editInit = false;
  readonly editSaving = signal(false);
  readonly editErrorKey = signal<string | null>(null);

  readonly armingDelete = signal(false);
  readonly deleteSaving = signal(false);
  readonly deleteErrorKey = signal<string | null>(null);

  private readonly termsRes = resource({
    params: () => ({ season: this.exam.value()?.season_id ?? null }),
    loader: ({ params }) =>
      params.season === null
        ? Promise.resolve([])
        : firstValueFrom(this.planning.terms(params.season)),
  });

  readonly termOptions = computed<DropdownOption[]>(() => [
    { value: '', label: '—' },
    ...(this.termsRes.value() ?? []).map((t) => ({ value: t.id, label: t.name_ar })),
  ]);

  readonly canSaveEdit = computed(
    () =>
      this.editDate() !== '' &&
      (this.editType() === 'final_season' || this.editTerm() !== null) &&
      !this.editSaving(),
  );

  protected readonly exam = resource({
    params: () => ({ id: this.id(), t: this.tick() }),
    loader: ({ params }) => firstValueFrom(this.examsSvc.get(params.id)),
  });

  readonly addForm = new FormGroup({
    question_no: new FormControl<number | null>(null, {
      validators: [Validators.required, Validators.min(1)],
    }),
    prompt_text: new FormControl('', { nonNullable: true }),
    max_score: new FormControl<number | null>(null, {
      validators: [Validators.required, Validators.min(0.01), Validators.max(20)],
    }),
    score: new FormControl<number | null>(null, {
      validators: [Validators.min(0), Validators.max(20)],
    }),
  });
  readonly addErrorKey = signal<string | null>(null);

  /** Unsaved question batch — saved atomically once weights total 20. */
  readonly draft = signal<DraftRow[]>([]);
  private readonly draftKey = signal(0);

  /** Live weights total — must read exactly 20 (backend 422s otherwise). */
  readonly weightsTotal = computed(
    () =>
      Math.round(
        (this.exam.value()?.questions ?? []).reduce((s, q) => s + (q.max_score ?? 0), 0) * 100,
      ) / 100,
  );

  readonly reweighting = signal(false);
  readonly weights = signal<Record<number, number | null>>({});

  /** Dirty guard: header edits, question composer, queued batch or reweight edits. */
  readonly leave = leaveController();

  private readonly editDirty = computed(() => {
    const e = this.exam.value();
    if (!e) return false;
    return (
      this.editDate() !== (e.exam_date ?? '') ||
      this.editType() !== e.exam_type ||
      this.editTerm() !== e.term_id
    );
  });

  private readonly weightsDirty = computed(() => {
    if (!this.reweighting()) return false;
    const w = this.weights();
    return (this.exam.value()?.questions ?? []).some((q) => (w[q.id] ?? null) !== q.max_score);
  });

  isDirty(): boolean {
    return this.editDirty() || this.addForm.dirty || this.draft().length > 0 || this.weightsDirty();
  }
  readonly reweightSaving = signal(false);
  readonly reweightErrorKey = signal<string | null>(null);

  /** Live total of the reweight draft — must read exactly 20 (§2.10). */
  readonly reweightTotal = computed(() => {
    const sum: number = Object.values(this.weights()).reduce<number>((s, v) => s + (v ?? 0), 0);
    return Math.round(sum * 100) / 100;
  });
  readonly reweightValid = computed(() => {
    const list = this.exam.value()?.questions ?? [];
    if (list.length === 0) return false;
    const w = this.weights();
    const vals = list.map((q) => w[q.id]);
    if (vals.some((v) => v === null || v === undefined)) return false;
    if ((vals as number[]).some((v) => v < 0.01 || v > 20)) return false;
    return this.reweightTotal() === 20;
  });

  constructor() {
    effect(() => {
      const e = this.exam.value();
      if (e && !this.editInit) {
        this.editInit = true;
        this.editDate.set(e.exam_date ?? '');
        this.editType.set(e.exam_type);
        this.editTerm.set(e.term_id);
      }
    });
  }

  submitEdit(): void {
    if (!this.canSaveEdit()) return;
    this.editSaving.set(true);
    this.editErrorKey.set(null);
    const type = this.editType();
    this.examsSvc
      .update(this.id(), {
        exam_date: this.editDate() || null,
        exam_type: type,
        term_id: type === 'final_season' ? null : this.editTerm(),
      })
      .subscribe({
        next: () => {
          this.editSaving.set(false);
          this.editInit = false;
          this.tick.update((n) => n + 1);
        },
        error: (err: unknown) => {
          this.editSaving.set(false);
          this.editErrorKey.set(apiErrorKey(err));
        },
      });
  }

  armDelete(): void {
    this.armingDelete.set(true);
    this.deleteErrorKey.set(null);
  }

  disarmDelete(): void {
    this.armingDelete.set(false);
  }

  confirmDelete(): void {
    if (this.deleteSaving()) return;
    this.deleteSaving.set(true);
    this.deleteErrorKey.set(null);
    this.examsSvc.remove(this.id()).subscribe({
      next: () => {
        this.deleteSaving.set(false);
        // The record is gone: clear every dirty source so the dirty guard
        // does not block the post-delete navigation (same rule as
        // pristine-on-save, but for the delete path).
        this.addForm.reset();
        this.draft.set([]);
        this.reweighting.set(false);
        this.weights.set({});
        void this.router.navigate(['/exams']);
      },
      error: (err: unknown) => {
        this.deleteSaving.set(false);
        this.deleteErrorKey.set(apiErrorKey(err));
      },
    });
  }

  setScore(qid: number, score: number | null): void {
    if (score === null) return;
    this.examsSvc.updateQuestion(qid, { score }).subscribe(() => this.tick.update((n) => n + 1));
  }

  deleteQuestion(qid: number): void {
    this.examsSvc.deleteQuestion(qid).subscribe(() => this.tick.update((n) => n + 1));
  }

  addQuestion(): void {
    if (this.addForm.invalid || this.saving()) return;
    const v = this.addForm.getRawValue();
    const qno = v.question_no;
    const max = v.max_score;
    const score = v.score;
    if (qno === null || max === null) return;
    if (score !== null && score > max) return;
    if (this.draft().some((d) => d.question_no === qno)) {
      this.addErrorKey.set('common.error');
      return;
    }
    this.addErrorKey.set(null);
    this.draftKey.update((n) => n + 1);
    const key = this.draftKey();
    this.draft.update((d) => [
      ...d,
      { key, question_no: qno, prompt_text: v.prompt_text, max_score: max, score },
    ]);
    this.addForm.reset();
  }

  removeDraft(key: number): void {
    this.draft.update((d) => d.filter((r) => r.key !== key));
  }

  readonly draftTotal = computed(
    () => Math.round(this.draft().reduce((s, r) => s + r.max_score, 0) * 100) / 100,
  );

  saveDraft(): void {
    if (this.draft().length === 0 || this.draftTotal() !== 20 || this.saving()) return;
    this.saving.set(true);
    this.addErrorKey.set(null);
    this.examsSvc
      .addQuestions(
        this.id(),
        this.draft().map((r) => ({
          question_no: r.question_no,
          prompt_text: r.prompt_text || undefined,
          max_score: r.max_score,
          score: r.score ?? undefined,
        })),
      )
      .subscribe({
        next: () => {
          this.saving.set(false);
          this.draft.set([]);
          this.tick.update((n) => n + 1);
        },
        error: (err: unknown) => {
          this.saving.set(false);
          this.addErrorKey.set(apiErrorKey(err));
        },
      });
  }

  startReweight(): void {
    const init: Record<number, number | null> = {};
    for (const q of this.exam.value()?.questions ?? []) init[q.id] = q.max_score;
    this.weights.set(init);
    this.reweightErrorKey.set(null);
    this.reweighting.set(true);
  }

  cancelReweight(): void {
    this.reweighting.set(false);
  }

  setWeight(qid: number, v: string): void {
    const n = v.trim() === '' ? null : Number(v);
    this.weights.update((w) => ({
      ...w,
      [qid]: n === null || Number.isNaN(n) ? null : n,
    }));
  }

  submitReweight(): void {
    if (this.reweightSaving()) return;
    if (!this.reweightValid()) {
      this.reweightErrorKey.set('validation.required');
      return;
    }
    const list = this.exam.value()?.questions ?? [];
    const payload = list.map((q) => ({ id: q.id, max_score: this.weights()[q.id] }));
    this.reweightSaving.set(true);
    this.reweightErrorKey.set(null);
    this.examsSvc.reweight(this.id(), payload as { id: number; max_score: number }[]).subscribe({
      next: () => {
        this.reweightSaving.set(false);
        this.reweighting.set(false);
        this.tick.update((n) => n + 1);
      },
      error: (err: unknown) => {
        this.reweightSaving.set(false);
        this.reweightErrorKey.set(apiErrorKey(err));
      },
    });
  }
}

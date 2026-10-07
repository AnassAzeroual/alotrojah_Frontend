import {
  ChangeDetectionStrategy,
  Component,
  computed,
  effect,
  inject,
  input,
  OnDestroy,
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

const SCORE_DEBOUNCE_MS = 400;

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
export class ExamDetailPage implements OnDestroy {
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

  /**
   * Locally-typed scores not yet acked by the server. Feeding these to the
   * inputs shields in-progress typing from reload clobbering: another
   * question's save bumps tick(), and a bare [value]="q.score" would snap
   * this input back to the stale server value mid-typing.
   */
  readonly scoreEdits = signal<Record<number, number>>({});
  private readonly scoreTimers = new Map<number, ReturnType<typeof setTimeout>>();
  private readonly scoreInFlight = new Set<number>();
  private destroyed = false;

  setScore(qid: number, score: number | null): void {
    if (score === null) return;
    this.scoreEdits.update((m) => ({ ...m, [qid]: score }));
    const prev = this.scoreTimers.get(qid);
    if (prev !== undefined) clearTimeout(prev);
    this.scoreTimers.set(
      qid,
      setTimeout(() => this.flushScore(qid), SCORE_DEBOUNCE_MS),
    );
  }

  /** Blur/navigation flush — sends the pending PATCH immediately. */
  flushScore(qid: number): void {
    const timer = this.scoreTimers.get(qid);
    if (timer !== undefined) {
      clearTimeout(timer);
      this.scoreTimers.delete(qid);
    }
    const score = this.scoreEdits()[qid];
    if (score === undefined) return;
    if (this.scoreInFlight.has(qid)) {
      this.scoreTimers.set(
        qid,
        setTimeout(() => this.flushScore(qid), SCORE_DEBOUNCE_MS),
      );
      return;
    }
    this.scoreInFlight.add(qid);
    this.examsSvc.updateQuestion(qid, { score }).subscribe({
      next: () => {
        this.scoreInFlight.delete(qid);
        this.dropEdit(qid, score);
        if (!this.destroyed) this.tick.update((n) => n + 1);
      },
      error: () => {
        // Silent like the pre-debounce path; dropping the edit resyncs the input to server truth.
        this.scoreInFlight.delete(qid);
        this.dropEdit(qid, score);
      },
    });
  }

  private dropEdit(qid: number, sent: number): void {
    this.scoreEdits.update((m) => {
      if (m[qid] !== sent) return m; // a newer keystroke replaced this one mid-flight
      const rest = { ...m };
      delete rest[qid];
      return rest;
    });
  }

  ngOnDestroy(): void {
    this.destroyed = true;
    for (const t of this.scoreTimers.values()) clearTimeout(t);
    this.scoreTimers.clear();
    // Fire every still-pending score without the trailing reload (view is gone).
    for (const [qid, score] of Object.entries(this.scoreEdits())) {
      this.examsSvc.updateQuestion(Number(qid), { score }).subscribe({ error: () => undefined });
    }
    this.scoreEdits.set({});
  }

  deleteQuestion(qid: number): void {
    const timer = this.scoreTimers.get(qid);
    if (timer !== undefined) {
      clearTimeout(timer);
      this.scoreTimers.delete(qid);
    }
    this.scoreEdits.update((m) => {
      if (!(qid in m)) return m;
      const rest = { ...m };
      delete rest[qid];
      return rest;
    });
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

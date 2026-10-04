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
import { FormControl, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { Router } from '@angular/router';
import { TranslatePipe } from '@ngx-translate/core';
import { firstValueFrom } from 'rxjs';
import { ExamsService } from '../../core/api/exams.service';
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

@Component({
  selector: 'app-exam-detail-page',
  standalone: true,
  imports: [
    ReactiveFormsModule,
    TranslatePipe,
    DropdownComponent,
    SpinnerComponent,
    EmptyStateComponent,
    ScoreInputComponent,
  ],
  changeDetection: ChangeDetectionStrategy.OnPush,
  templateUrl: './exam-detail.page.html',
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
  readonly editFailed = signal(false);

  readonly armingDelete = signal(false);
  readonly deleteSaving = signal(false);
  readonly deleteFailed = signal(false);

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
    score: new FormControl<number | null>(null, {
      validators: [Validators.min(0), Validators.max(20)],
    }),
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
    this.editFailed.set(false);
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
        error: () => {
          this.editSaving.set(false);
          this.editFailed.set(true);
        },
      });
  }

  armDelete(): void {
    this.armingDelete.set(true);
    this.deleteFailed.set(false);
  }

  disarmDelete(): void {
    this.armingDelete.set(false);
  }

  confirmDelete(): void {
    if (this.deleteSaving()) return;
    this.deleteSaving.set(true);
    this.deleteFailed.set(false);
    this.examsSvc.remove(this.id()).subscribe({
      next: () => {
        this.deleteSaving.set(false);
        void this.router.navigate(['/exams']);
      },
      error: () => {
        this.deleteSaving.set(false);
        this.deleteFailed.set(true);
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
    if (v.question_no === null) return;
    this.saving.set(true);
    this.examsSvc
      .addQuestions(this.id(), [
        {
          question_no: v.question_no,
          prompt_text: v.prompt_text || undefined,
          score: v.score ?? undefined,
        },
      ])
      .subscribe({
        next: () => {
          this.saving.set(false);
          this.addForm.reset();
          this.tick.update((n) => n + 1);
        },
        error: () => this.saving.set(false),
      });
  }
}

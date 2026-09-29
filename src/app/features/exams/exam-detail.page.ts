import { ChangeDetectionStrategy, Component, inject, input, resource, signal } from '@angular/core';
import { FormControl, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { TranslatePipe } from '@ngx-translate/core';
import { firstValueFrom } from 'rxjs';
import { ExamsService } from '../../core/api/exams.service';
import { EmptyStateComponent } from '../../shared/ui/empty-state/empty-state.component';
import { SpinnerComponent } from '../../shared/ui/spinner/spinner.component';
import { ScoreInputComponent } from '../../shared/ui/score-input/score-input.component';

@Component({
  selector: 'app-exam-detail-page',
  standalone: true,
  imports: [
    ReactiveFormsModule,
    TranslatePipe,
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
  private readonly tick = signal(0);
  readonly saving = signal(false);

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

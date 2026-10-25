import {
  ChangeDetectionStrategy,
  Component,
  computed,
  inject,
  input,
  resource,
  signal,
} from '@angular/core';
import { Router } from '@angular/router';
import { TranslatePipe } from '@ngx-translate/core';
import { firstValueFrom } from 'rxjs';
import { ExamsService } from '../../core/api/exams.service';
import { AuthService } from '../../core/auth/auth.service';
import { EmptyStateComponent } from '../../shared/ui/empty-state/empty-state.component';
import { SpinnerComponent } from '../../shared/ui/spinner/spinner.component';

@Component({
  selector: 'app-exam-detail-page',
  standalone: true,
  imports: [TranslatePipe, SpinnerComponent, EmptyStateComponent],
  changeDetection: ChangeDetectionStrategy.OnPush,
  templateUrl: './exam-detail.page.html',
  styleUrl: './exam-detail.page.scss',
})
export class ExamDetailPage {
  readonly id = input.required<number, string>({ transform: (v: string) => Number(v) });

  private readonly examsSvc = inject(ExamsService);
  private readonly auth = inject(AuthService);
  private readonly router = inject(Router);

  readonly canDelete = computed(() => ['admin', 'supervisor'].includes(this.auth.role() ?? ''));

  protected readonly exam = resource({
    params: () => ({ id: this.id() }),
    loader: ({ params }) => firstValueFrom(this.examsSvc.get(params.id)),
  });

  readonly questions = computed(() => this.exam.value()?.questions ?? []);
  readonly score = computed(() => this.exam.value()?.overall_avg ?? null);
  readonly scorePercent = computed(() =>
    Math.max(0, Math.min(100, Math.round(((this.score() ?? 0) / 20) * 100))),
  );
  readonly answeredCount = computed(
    () => this.questions().filter((q) => q.score !== null && q.score !== undefined).length,
  );
  readonly studentInitial = computed(() => (this.exam.value()?.student_name ?? '?').slice(0, 1));
  readonly weightsTotal = computed(
    () =>
      Math.round(
        (this.questions().reduce((s, q) => s + (q.max_score ?? 0), 0) + Number.EPSILON) * 100,
      ) / 100,
  );

  readonly armingDelete = signal(false);
  readonly deleteSaving = signal(false);

  armDelete(): void {
    this.armingDelete.set(true);
  }

  disarmDelete(): void {
    this.armingDelete.set(false);
  }

  confirmDelete(): void {
    if (this.deleteSaving()) return;
    this.deleteSaving.set(true);
    this.examsSvc.remove(this.id()).subscribe({
      next: () => {
        this.deleteSaving.set(false);
        void this.router.navigate(['/exams']);
      },
      error: () => this.deleteSaving.set(false),
    });
  }
}

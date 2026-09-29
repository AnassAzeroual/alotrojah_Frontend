import { ChangeDetectionStrategy, Component, inject, resource, signal } from '@angular/core';
import { FormControl, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { Router } from '@angular/router';
import { TranslatePipe } from '@ngx-translate/core';
import { firstValueFrom, map } from 'rxjs';
import { ExamsService } from '../../core/api/exams.service';
import { PlanningService } from '../../core/api/planning.service';
import { ReferenceService } from '../../core/api/reference.service';
import { StudentsService } from '../../core/api/students.service';
import { SpinnerComponent } from '../../shared/ui/spinner/spinner.component';

@Component({
  selector: 'app-exam-new-page',
  standalone: true,
  imports: [ReactiveFormsModule, TranslatePipe, SpinnerComponent],
  changeDetection: ChangeDetectionStrategy.OnPush,
  templateUrl: './exam-new.page.html',
})
export class ExamNewPage {
  private readonly examsSvc = inject(ExamsService);
  private readonly studentsSvc = inject(StudentsService);
  private readonly planning = inject(PlanningService);
  private readonly ref = inject(ReferenceService);
  private readonly router = inject(Router);

  readonly search = signal('');
  readonly pickedStudent = signal<number | null>(null);
  readonly saving = signal(false);

  readonly found = resource({
    params: () => ({ q: this.search() }),
    loader: ({ params }) =>
      params.q.trim() === ''
        ? Promise.resolve([])
        : firstValueFrom(this.studentsSvc.list({ q: params.q }).pipe(map((p) => p.data))),
  });

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
    const list = this.seasons.value()?.data ?? [];
    return list.find((s) => s.is_current)?.id ?? list[0]?.id ?? null;
  }

  readonly form = new FormGroup({
    exam_type: new FormControl<'hizb_completion' | 'term_batch' | 'final_season'>('term_batch', { nonNullable: true, validators: [Validators.required] }),
    term_id: new FormControl<number | null>(null),
    exam_date: new FormControl('', { nonNullable: true }),
  });

  submit(): void {
    const st = this.pickedStudent();
    const v = this.form.getRawValue();
    if (st === null || this.saving()) return;
    if (v.exam_type !== 'final_season' && v.term_id === null) return;
    this.saving.set(true);
    this.examsSvc
      .create({
        student_id: st,
        exam_type: v.exam_type,
        term_id: v.exam_type === 'final_season' ? undefined : (v.term_id ?? undefined),
        season_id: v.exam_type === 'final_season' ? this.currentSeasonId() ?? undefined : undefined,
        exam_date: v.exam_date || undefined,
      })
      .subscribe({
        next: (e) => {
          this.saving.set(false);
          void this.router.navigate(['/exams', e.id]);
        },
        error: () => this.saving.set(false),
      });
  }
}

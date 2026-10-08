import {
  ChangeDetectionStrategy,
  Component,
  computed,
  inject,
  resource,
  signal,
} from '@angular/core';
import { toSignal } from '@angular/core/rxjs-interop';
import {
  FormControl,
  FormGroup,
  FormsModule,
  ReactiveFormsModule,
  Validators,
} from '@angular/forms';
import { TranslatePipe, TranslateService } from '@ngx-translate/core';
import { firstValueFrom, map } from 'rxjs';
import { AuthService } from '../../core/auth/auth.service';
import { CalendarService } from '../../core/api/calendar.service';
import { PlanningService } from '../../core/api/planning.service';
import { ReferenceService } from '../../core/api/reference.service';
import { ReviewsService } from '../../core/api/reviews.service';
import { leaveController } from '../../core/guards/leave-controller';
import { StudentsService } from '../../core/api/students.service';
import { DropdownComponent } from '../../shared/ui/dropdown/dropdown.component';
import { EmptyStateComponent } from '../../shared/ui/empty-state/empty-state.component';
import { SpinnerComponent } from '../../shared/ui/spinner/spinner.component';

@Component({
  selector: 'app-reviews-page',
  standalone: true,
  imports: [
    FormsModule,
    ReactiveFormsModule,
    TranslatePipe,
    DropdownComponent,
    SpinnerComponent,
    EmptyStateComponent,
  ],
  changeDetection: ChangeDetectionStrategy.OnPush,
  templateUrl: './reviews.page.html',
})
export class ReviewsPage {
  private readonly reviews = inject(ReviewsService);
  private readonly studentsSvc = inject(StudentsService);
  private readonly calendar = inject(CalendarService);
  private readonly planning = inject(PlanningService);
  private readonly ref = inject(ReferenceService);
  private readonly auth = inject(AuthService);
  private readonly i18n = inject(TranslateService);

  readonly canEnter = computed(() => {
    const t = this.auth.currentUser()?.teacher_type;
    const r = this.auth.currentUser()?.role;
    return r === 'admin' || r === 'supervisor' || t === 'murajaa' || t === 'both';
  });

  /** Practice-row deletes are admin/supervisor-only (policy). */
  readonly canManage = computed(() => {
    const r = this.auth.currentUser()?.role;
    return r === 'admin' || r === 'supervisor';
  });

  readonly search = signal('');
  readonly pickedStudent = signal<number | null>(null);
  readonly saving = signal(false);
  private readonly tick = signal(0);

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

  readonly form = new FormGroup({
    term_id: new FormControl<number | null>(null, { validators: [Validators.required] }),
    session_id: new FormControl<number | null>(null, { validators: [Validators.required] }),
    week_from: new FormControl<number | null>(null, {
      validators: [Validators.required, Validators.min(1)],
    }),
    week_to: new FormControl<number | null>(null, {
      validators: [Validators.required, Validators.min(1)],
    }),
    score: new FormControl<number | null>(null, {
      validators: [Validators.required, Validators.min(0), Validators.max(20)],
    }),
  });

  readonly terms = resource({
    params: () => ({ s: this.currentSeasonId() }),
    loader: ({ params }) =>
      params.s === null ? Promise.resolve([]) : firstValueFrom(this.planning.terms(params.s)),
  });

  private readonly selectedTerm = toSignal(this.form.controls.term_id.valueChanges, {
    initialValue: null,
  });

  readonly termOptions = computed(() => [
    { value: '', label: '—' },
    ...(this.terms.value() ?? []).map((t) => ({ value: t.id, label: t.name_ar })),
  ]);

  readonly sessions = resource({
    params: () => ({ term: this.selectedTerm() }),
    loader: ({ params }) =>
      params.term === null
        ? Promise.resolve([])
        : firstValueFrom(this.calendar.sessions({ term_id: params.term }).pipe(map((p) => p.data))),
  });

  readonly sessionOptions = computed(() => [
    { value: '', label: '—' },
    ...(this.sessions.value() ?? []).map((s) => ({
      value: s.id,
      label: `${this.i18n.instant('common.session')} ${s.session_number_global}`,
    })),
  ]);

  private currentSeasonId(): number | null {
    const list = this.seasons.value()?.data ?? [];
    return list.find((s) => s.is_current)?.id ?? list[0]?.id ?? null;
  }

  readonly cycles = resource({
    params: () => ({ st: this.pickedStudent(), t: this.tick() }),
    loader: ({ params }) =>
      params.st === null
        ? Promise.resolve([])
        : firstValueFrom(this.reviews.cycles({ student_id: params.st }).pipe(map((p) => p.data))),
  });

  readonly logs = resource({
    params: () => ({ st: this.pickedStudent(), t: this.tick() }),
    loader: ({ params }) =>
      params.st === null
        ? Promise.resolve([])
        : firstValueFrom(this.reviews.logs({ student_id: params.st }).pipe(map((p) => p.data))),
  });

  /** Dirty guard: a half-typed review cycle blocks route leave. */
  readonly leave = leaveController();
  isDirty(): boolean {
    return this.form.dirty;
  }

  submit(): void {
    const st = this.pickedStudent();
    const v = this.form.getRawValue();
    if (st === null || this.form.invalid || this.saving()) return;
    if (
      v.term_id === null ||
      v.session_id === null ||
      v.week_from === null ||
      v.week_to === null ||
      v.score === null
    )
      return;
    const span = v.week_to - v.week_from + 1;
    if (span < 1 || span > 3) return; // backend enforces too (422)
    this.saving.set(true);
    this.reviews
      .createCycle({
        student_id: st,
        term_id: v.term_id,
        session_id: v.session_id,
        week_from: v.week_from,
        week_to: v.week_to,
        score: v.score,
      })
      .subscribe({
        next: () => {
          this.saving.set(false);
          this.form.reset();
          this.tick.update((n) => n + 1);
        },
        error: () => this.saving.set(false),
      });
  }

  remove(id: number): void {
    this.reviews.deleteCycle(id).subscribe(() => this.tick.update((n) => n + 1));
  }

  removeLog(id: number): void {
    this.reviews.deleteLog(id).subscribe(() => this.tick.update((n) => n + 1));
  }
}

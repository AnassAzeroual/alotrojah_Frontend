import {
  ChangeDetectionStrategy,
  Component,
  computed,
  inject,
  resource,
  signal,
} from '@angular/core';
import { FormControl, FormGroup, FormsModule, ReactiveFormsModule } from '@angular/forms';
import { TranslatePipe } from '@ngx-translate/core';
import { firstValueFrom, map } from 'rxjs';
import { PlanningService } from '../../core/api/planning.service';
import { ReferenceService } from '../../core/api/reference.service';
import { ResultsService } from '../../core/api/results.service';
import { leaveController } from '../../core/guards/leave-controller';
import { StudentsService } from '../../core/api/students.service';
import {
  DropdownComponent,
  dropdownNumber,
  dropdownText,
} from '../../shared/ui/dropdown/dropdown.component';
import { SpinnerComponent } from '../../shared/ui/spinner/spinner.component';
import { StatusBadgeComponent } from '../../shared/ui/status-badge/status-badge.component';

const SCORE_FIELDS = ['hifz_total', 'murajaa_total', 'exam_score', 'general_avg'] as const;

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
  ],
  changeDetection: ChangeDetectionStrategy.OnPush,
  templateUrl: './term-results.page.html',
})
export class TermResultsPage {
  private readonly results = inject(ResultsService);
  private readonly studentsSvc = inject(StudentsService);
  private readonly planning = inject(PlanningService);
  private readonly ref = inject(ReferenceService);

  protected readonly num = dropdownNumber;
  protected readonly txt = dropdownText;

  readonly search = signal('');
  readonly pickedStudent = signal<number | null>(null);
  readonly pickedTerm = signal<number | null>(null);

  readonly termOptions = computed(() => [
    { value: '', label: '—' },
    ...(this.terms.value() ?? []).map((t) => ({ value: t.id, label: t.name_ar })),
  ]);
  readonly honorOptions = [
    { value: 'none', labelKey: 'honor.none' },
    { value: 'tashji3', labelKey: 'honor.tashji3' },
    { value: 'intibah', labelKey: 'honor.intibah' },
  ];
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

  readonly terms = resource({
    params: () => ({ s: this.currentSeasonId() }),
    loader: ({ params }) =>
      params.s === null ? Promise.resolve([]) : firstValueFrom(this.planning.terms(params.s)),
  });

  private currentSeasonId(): number | null {
    const list = this.seasons.value()?.data ?? [];
    return list.find((s) => s.is_current)?.id ?? list[0]?.id ?? null;
  }

  readonly existing = resource({
    params: () => ({ st: this.pickedStudent(), t: this.pickedTerm(), tick: this.tick() }),
    loader: ({ params }) => {
      if (params.st === null || params.t === null) return Promise.resolve(null);
      return firstValueFrom(
        this.results
          .termResults({ student_id: params.st, term_id: params.t })
          .pipe(map((p) => p.data[0] ?? null)),
      );
    },
  });

  /** Dirty guard: typed-but-unsaved result entries block route leave. */
  readonly leave = leaveController();
  isDirty(): boolean {
    return this.form.dirty;
  }

  readonly form = new FormGroup({
    hifz_total: new FormControl<number | null>(null),
    murajaa_total: new FormControl<number | null>(null),
    exam_score: new FormControl<number | null>(null),
    general_avg: new FormControl<number | null>(null),
    teacher_notes: new FormControl('', { nonNullable: true }),
    supervisor_note: new FormControl('', { nonNullable: true }),
    honor_flag: new FormControl('none', { nonNullable: true }),
  });
  readonly scoreFields = SCORE_FIELDS;

  fill(): void {
    const e = this.existing.value();
    if (!e) return;
    this.form.patchValue({
      hifz_total: e.hifz_total,
      murajaa_total: e.murajaa_total,
      exam_score: e.exam_score,
      general_avg: e.general_avg,
      teacher_notes: e.teacher_notes ?? '',
      supervisor_note: e.supervisor_note ?? '',
      honor_flag: e.honor_flag,
    });
    this.form.markAsPristine();
  }

  submit(): void {
    const st = this.pickedStudent();
    const t = this.pickedTerm();
    if (st === null || t === null || this.saving()) return;
    const v = this.form.getRawValue();
    this.saving.set(true);
    this.results
      .upsertTerm({
        student_id: st,
        term_id: t,
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
          this.tick.update((n) => n + 1);
        },
        error: () => this.saving.set(false),
      });
  }
}

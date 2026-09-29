import { ChangeDetectionStrategy, Component, inject, resource, signal } from '@angular/core';
import { FormControl, FormGroup, ReactiveFormsModule } from '@angular/forms';
import { TranslatePipe } from '@ngx-translate/core';
import { firstValueFrom, map } from 'rxjs';
import { PlanningService } from '../../core/api/planning.service';
import { ReferenceService, Surah } from '../../core/api/reference.service';
import { StudentsService } from '../../core/api/students.service';
import { SpinnerComponent } from '../../shared/ui/spinner/spinner.component';

@Component({
  selector: 'app-plans-page',
  standalone: true,
  imports: [ReactiveFormsModule, TranslatePipe, SpinnerComponent],
  changeDetection: ChangeDetectionStrategy.OnPush,
  templateUrl: './plans.page.html',
})
export class PlansPage {
  private readonly planning = inject(PlanningService);
  private readonly studentsSvc = inject(StudentsService);
  private readonly ref = inject(ReferenceService);

  readonly search = signal('');
  readonly pickedStudent = signal<number | null>(null);
  readonly pickedTerm = signal<number | null>(null);
  readonly saving = signal(false);
  readonly savedTick = signal(0);
  readonly error = signal<string | null>(null);

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

  readonly surahs = resource({
    params: () => ({}),
    loader: () => firstValueFrom(this.ref.surahs()),
  });

  private currentSeasonId(): number | null {
    const list = this.seasons.value()?.data ?? [];
    return list.find((s) => s.is_current)?.id ?? list[0]?.id ?? null;
  }

  readonly plan = resource({
    params: () => ({ st: this.pickedStudent(), t: this.pickedTerm(), tick: this.savedTick() }),
    loader: ({ params }) => {
      if (params.st === null || params.t === null) return Promise.resolve(null);
      return firstValueFrom(
        this.planning
          .plans({ student_id: params.st, term_id: params.t })
          .pipe(map((p) => p.data[0] ?? null)),
      );
    },
  });

  readonly form = new FormGroup({
    plan_mode: new FormControl<'thumn' | 'surah'>('thumn', { nonNullable: true }),
    goal_text: new FormControl('', { nonNullable: true }),
    start_hizb: new FormControl<number | null>(null),
    end_hizb: new FormControl<number | null>(null),
    plan_surah_from: new FormControl<number | null>(null),
    plan_ayah_from: new FormControl<number | null>(null),
    plan_surah_to: new FormControl<number | null>(null),
    plan_ayah_to: new FormControl<number | null>(null),
    expected_hifz_week_thumn: new FormControl<number | null>(null),
    expected_hifz_term_ahzab: new FormControl<number | null>(null),
    khatm_expected_at: new FormControl('', { nonNullable: true }),
  });

  ayahMax(surahId: number | null): number {
    if (surahId === null) return 286;
    return this.surahs.value()?.find((s: Surah) => s.id === surahId)?.ayahs_count ?? 286;
  }

  loadIntoForm(): void {
    const p = this.plan.value();
    if (!p) return;
    this.form.patchValue({
      plan_mode: p.plan_mode,
      goal_text: p.goal_text ?? '',
      start_hizb: p.start_hizb,
      end_hizb: p.end_hizb,
      plan_surah_from: p.plan_surah_from,
      plan_ayah_from: p.plan_ayah_from,
      plan_surah_to: p.plan_surah_to,
      plan_ayah_to: p.plan_ayah_to,
      expected_hifz_week_thumn: p.expected_hifz_week_thumn,
      expected_hifz_term_ahzab: p.expected_hifz_term_ahzab,
      khatm_expected_at: p.khatm_expected_at ?? '',
    });
  }

  submit(): void {
    const st = this.pickedStudent();
    const t = this.pickedTerm();
    if (st === null || t === null || this.saving()) return;
    const v = this.form.getRawValue();
    this.error.set(null);
    if (
      v.plan_mode === 'thumn' &&
      v.start_hizb !== null &&
      v.end_hizb !== null &&
      v.end_hizb < v.start_hizb
    ) {
      this.error.set('validation.range');
      return;
    }
    if (v.plan_mode === 'surah') {
      const bad =
        (v.plan_surah_from !== null && (v.plan_ayah_from ?? 0) > this.ayahMax(v.plan_surah_from)) ||
        (v.plan_surah_to !== null && (v.plan_ayah_to ?? 0) > this.ayahMax(v.plan_surah_to));
      if (bad) {
        this.error.set('validation.max');
        return;
      }
    }
    this.saving.set(true);
    this.planning
      .upsertPlan({
        student_id: st,
        term_id: t,
        plan_mode: v.plan_mode,
        goal_text: v.goal_text || null,
        start_hizb: v.plan_mode === 'thumn' ? v.start_hizb : null,
        end_hizb: v.plan_mode === 'thumn' ? v.end_hizb : null,
        plan_surah_from: v.plan_mode === 'surah' ? v.plan_surah_from : null,
        plan_ayah_from: v.plan_mode === 'surah' ? v.plan_ayah_from : null,
        plan_surah_to: v.plan_mode === 'surah' ? v.plan_surah_to : null,
        plan_ayah_to: v.plan_mode === 'surah' ? v.plan_ayah_to : null,
        expected_hifz_week_thumn: v.expected_hifz_week_thumn,
        expected_hifz_term_ahzab: v.expected_hifz_term_ahzab,
        khatm_expected_at: v.khatm_expected_at || null,
      })
      .subscribe({
        next: () => {
          this.saving.set(false);
          this.savedTick.update((n) => n + 1);
        },
        error: (e) => {
          this.saving.set(false);
          this.error.set(typeof e?.error?.message === 'string' ? e.error.message : 'error');
        },
      });
  }
}

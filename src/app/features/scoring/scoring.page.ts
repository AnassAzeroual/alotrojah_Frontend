import {
  ChangeDetectionStrategy,
  Component,
  computed,
  inject,
  resource,
  signal,
} from '@angular/core';
import { FormControl, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { TranslatePipe } from '@ngx-translate/core';
import { firstValueFrom } from 'rxjs';
import { ScoringService } from '../../core/api/scoring.service';
import { SpinnerComponent } from '../../shared/ui/spinner/spinner.component';

interface Draft {
  max: number | null;
  active: boolean;
  inTotal: boolean;
}

@Component({
  selector: 'app-scoring-page',
  standalone: true,
  imports: [ReactiveFormsModule, TranslatePipe, SpinnerComponent],
  changeDetection: ChangeDetectionStrategy.OnPush,
  templateUrl: './scoring.page.html',
})
export class ScoringPage {
  private readonly scoring = inject(ScoringService);

  private readonly tick = signal(0);
  readonly saving = signal(false);
  readonly error = signal<string | null>(null);
  readonly drafts = signal<ReadonlyMap<string, Draft>>(new Map());

  readonly modules = resource({
    params: () => ({ t: this.tick() }),
    loader: () => firstValueFrom(this.scoring.modules()),
  });

  /** Live sum of active weekly-total modules â€” must stay 20. */
  readonly liveSum = computed(() => {
    const rows = this.modules.value() ?? [];
    return (
      Math.round(
        rows.reduce(
          (a, m) =>
            a + this.effMax(m.code, m.max_points, m.is_active, m.is_in_weekly_total, m.scope),
          0,
        ) * 10,
      ) / 10
    );
  });

  private effMax(
    code: string,
    max: number,
    active: boolean,
    inTotal: boolean,
    scope: string,
  ): number {
    const d = this.drafts().get(code);
    const a = d ? d.active : active;
    const t = d ? d.inTotal : inTotal;
    const v = d?.max ?? max;
    return a && t && scope === 'weekly' ? v : 0;
  }

  edit(code: string, patch: Partial<Draft>, fallback: Draft): void {
    const cur = this.drafts().get(code) ?? fallback;
    this.drafts.update((m) => new Map(m).set(code, { ...cur, ...patch }));
  }

  save(): void {
    const patches = [...this.drafts().entries()].map(([code, d]) => ({
      code,
      ...(d.max !== null ? { max_points: d.max } : {}),
      is_active: d.active,
      is_in_weekly_total: d.inTotal,
    }));
    if (patches.length === 0) return;
    this.saving.set(true);
    this.error.set(null);
    this.scoring.bulk(patches).subscribe({
      next: () => {
        this.saving.set(false);
        this.drafts.set(new Map());
        this.tick.update((n) => n + 1);
      },
      error: (e) => {
        this.saving.set(false);
        this.error.set(typeof e?.error?.message === 'string' ? e.error.message : 'error');
      },
    });
  }

  readonly addForm = new FormGroup({
    code: new FormControl('', {
      nonNullable: true,
      validators: [Validators.required, Validators.pattern(/^[a-z0-9_]+$/)],
    }),
    name_ar: new FormControl('', { nonNullable: true, validators: [Validators.required] }),
    max_points: new FormControl<number | null>(20, {
      validators: [Validators.min(0), Validators.max(20)],
    }),
    scope: new FormControl<'weekly' | 'murajaa'>('weekly', { nonNullable: true }),
    is_in_weekly_total: new FormControl(false, { nonNullable: true }),
  });

  addBook(): void {
    if (this.addForm.invalid || this.saving()) return;
    const v = this.addForm.getRawValue();
    this.saving.set(true);
    this.error.set(null);
    this.scoring
      .create({
        code: v.code,
        name_ar: v.name_ar,
        max_points: v.max_points ?? 20,
        scope: v.scope,
        is_active: true,
        is_in_weekly_total: v.is_in_weekly_total,
      })
      .subscribe({
        next: () => {
          this.saving.set(false);
          this.addForm.reset({
            code: '',
            name_ar: '',
            max_points: 20,
            scope: 'weekly',
            is_in_weekly_total: false,
          });
          this.tick.update((n) => n + 1);
        },
        error: (e) => {
          this.saving.set(false);
          this.error.set(typeof e?.error?.message === 'string' ? e.error.message : 'error');
        },
      });
  }
}

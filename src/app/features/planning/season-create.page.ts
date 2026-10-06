import {
  ChangeDetectionStrategy,
  Component,
  computed,
  inject,
  resource,
  signal,
} from '@angular/core';
import { FormArray, FormControl, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { Router } from '@angular/router';
import { TranslatePipe } from '@ngx-translate/core';
import { firstValueFrom } from 'rxjs';
import { SeasonsService, SeasonTerm } from '../../core/api/seasons.service';
import { CentersService } from '../../core/api/centers.service';
import { AuthService } from '../../core/auth/auth.service';
import { leaveController } from '../../core/guards/leave-controller';
import {
  DropdownComponent,
  DropdownOption,
  dropdownNumber,
} from '../../shared/ui/dropdown/dropdown.component';
import { SpinnerComponent } from '../../shared/ui/spinner/spinner.component';

interface TermRow {
  name: FormControl<string>;
  weeks: FormControl<number>;
}

interface SeasonForm {
  name: FormControl<string>;
  center_id: FormControl<number | null>;
  start_date: FormControl<string>;
  hijri_year: FormControl<string>;
  sessions_per_week: FormControl<number>;
  review_weeks_per_term: FormControl<number>;
  terms: FormArray<FormGroup<TermRow>>;
}

const DEFAULT_TERMS = [
  'الفصل الأول',
  'الفصل الثاني',
  'الفصل الثالث',
  'الفصل الرابع',
  'الفصل الخامس',
  'الفصل السادس',
];

function todayLocal(): string {
  const d = new Date();
  const m = String(d.getMonth() + 1).padStart(2, '0');
  const day = String(d.getDate()).padStart(2, '0');
  return `${d.getFullYear()}-${m}-${day}`;
}

function currentHijriYear(): number {
  const d = new Date();
  for (const cal of ['islamic-umalqura', 'islamic']) {
    try {
      const parts = new Intl.DateTimeFormat(`en-u-ca-${cal}`, { year: 'numeric' }).formatToParts(d);
      const y = Number(parts.find((p) => p.type === 'year')?.value);
      if (Number.isFinite(y) && y > 1300 && y < 1700) return y;
    } catch {
      // try next calendar
    }
  }
  return d.getFullYear() - 579; // rough fallback, editable
}

@Component({
  selector: 'app-season-create-page',
  standalone: true,
  imports: [ReactiveFormsModule, TranslatePipe, SpinnerComponent, DropdownComponent],
  changeDetection: ChangeDetectionStrategy.OnPush,
  templateUrl: './season-create.page.html',
})
export class SeasonCreatePage {
  private readonly seasonsSvc = inject(SeasonsService);
  private readonly centersSvc = inject(CentersService);
  private readonly auth = inject(AuthService);
  private readonly router = inject(Router);

  readonly saving = signal(false);
  readonly error = signal<string | null>(null);

  /** Only the admin picks a center; supervisors are forced onto their own. */
  readonly isAdmin = computed(() => this.auth.role() === 'admin');
  protected readonly num = dropdownNumber;

  private readonly centersRes = resource({
    params: () => ({ allow: this.isAdmin() }),
    loader: ({ params }) =>
      params.allow
        ? firstValueFrom(this.centersSvc.list()).then((p) => p.data)
        : Promise.resolve([]),
  });
  readonly centerOptions = computed<DropdownOption[]>(() =>
    (this.centersRes.value() ?? []).map((c) => ({ value: c.id, label: c.name })),
  );

  /** Dirty guard: a half-built season (typed or templated) blocks leave. */
  readonly leave = leaveController();
  isDirty(): boolean {
    return this.form.dirty;
  }

  readonly form = new FormGroup<SeasonForm>({
    name: new FormControl('', {
      nonNullable: true,
      validators: [Validators.required, Validators.maxLength(50)],
    }),
    center_id: new FormControl<number | null>(null, {
      validators: this.auth.role() === 'admin' ? [Validators.required] : [],
    }),
    start_date: new FormControl('', {
      nonNullable: true,
      validators: [Validators.required],
    }),
    hijri_year: new FormControl('', { nonNullable: true }),
    sessions_per_week: new FormControl(3, {
      nonNullable: true,
      validators: [Validators.min(1), Validators.max(7)],
    }),
    review_weeks_per_term: new FormControl(1, {
      nonNullable: true,
      validators: [Validators.min(0), Validators.max(3)],
    }),
    terms: new FormArray<FormGroup<TermRow>>([]),
  });

  fillTemplate(): void {
    const hijri = currentHijriYear();
    this.form.controls.name.setValue(`موسم ${hijri}`);
    this.form.controls.start_date.setValue(todayLocal());
    this.form.controls.hijri_year.setValue(String(hijri));
    this.form.controls.terms.clear();
    for (const n of DEFAULT_TERMS) this.form.controls.terms.push(this.row(n, 7));
  }

  private row(name: string, weeks: number): FormGroup<TermRow> {
    return new FormGroup<TermRow>({
      name: new FormControl(name, { nonNullable: true, validators: [Validators.required] }),
      weeks: new FormControl(weeks, {
        nonNullable: true,
        validators: [Validators.min(1), Validators.max(12)],
      }),
    });
  }

  addTerm(): void {
    this.form.controls.terms.push(this.row('', 7));
  }

  removeTerm(i: number): void {
    if (this.form.controls.terms.length > 1) this.form.controls.terms.removeAt(i);
  }

  submit(): void {
    if (this.form.invalid || this.saving()) return;
    this.saving.set(true);
    this.error.set(null);
    const v = this.form.getRawValue();
    const terms: SeasonTerm[] = v.terms.map((t) => ({ name: t.name, weeks: t.weeks }));
    this.seasonsSvc
      .create({
        name: v.name,
        center_id: v.center_id,
        start_date: v.start_date,
        hijri_year: v.hijri_year || undefined,
        sessions_per_week: v.sessions_per_week,
        review_weeks_per_term: v.review_weeks_per_term,
        terms,
      })
      .subscribe({
        next: () => {
          this.saving.set(false);
          this.form.markAsPristine();
          void this.router.navigate(['/planning']);
        },
        error: (e) => {
          this.saving.set(false);
          this.error.set(e?.error?.message ?? 'error');
        },
      });
  }
}

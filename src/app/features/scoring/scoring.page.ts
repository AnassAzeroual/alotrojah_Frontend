import {
  ChangeDetectionStrategy,
  Component,
  computed,
  inject,
  resource,
  signal,
  viewChild,
} from '@angular/core';
import {
  FormControl,
  FormGroup,
  FormsModule,
  ReactiveFormsModule,
  Validators,
} from '@angular/forms';
import { TranslatePipe, TranslateService } from '@ngx-translate/core';
import { firstValueFrom, map } from 'rxjs';
import { ScoringService } from '../../core/api/scoring.service';
import { CentersService } from '../../core/api/centers.service';
import { AdminPrefsService } from '../../core/settings/admin-prefs.service';
import { leaveController } from '../../core/guards/leave-controller';
import { LanguageService } from '../../core/i18n/language.service';
import {
  DropdownComponent,
  dropdownNumber,
  DropdownValue,
  dropdownText,
} from '../../shared/ui/dropdown/dropdown.component';
import { EmptyStateComponent } from '../../shared/ui/empty-state/empty-state.component';
import { SpinnerComponent } from '../../shared/ui/spinner/spinner.component';

interface Draft {
  max: number | null;
  active: boolean;
  inTotal: boolean;
}

type TrailFilter = 'center' | 'scope' | 'status';

interface TrailCrumb {
  id: TrailFilter;
  label: string;
}

@Component({
  selector: 'app-scoring-page',
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
  templateUrl: './scoring.page.html',
  styleUrl: './scoring.page.scss',
})
export class ScoringPage {
  private readonly scoring = inject(ScoringService);
  private readonly centersSvc = inject(CentersService);
  private readonly i18n = inject(TranslateService);
  private readonly language = inject(LanguageService);
  protected readonly prefs = inject(AdminPrefsService);

  private readonly tick = signal(0);
  readonly saving = signal(false);
  readonly error = signal<{ key: string; params?: Record<string, string | number> } | null>(null);
  readonly drafts = signal<ReadonlyMap<string, Draft>>(new Map());
  readonly showAdd = signal(false);

  private readonly centerPicker = viewChild<DropdownComponent>('centerPicker');
  private readonly scopePicker = viewChild<DropdownComponent>('scopePicker');
  private readonly statusPicker = viewChild<DropdownComponent>('statusPicker');

  /** Dirty guard: unsent draft edits or a half-filled add form block leave. */
  readonly leave = leaveController();
  isDirty(): boolean {
    return this.drafts().size > 0 || this.addForm.dirty;
  }
  protected readonly txt = dropdownText;
  protected readonly num = dropdownNumber;

  readonly modules = resource({
    params: () => ({ t: this.tick(), c: this.activeScope() }),
    loader: ({ params }) => firstValueFrom(this.scoring.modules(params.c)),
  });

  readonly q = signal('');
  readonly scope = signal<string | null>(null);
  readonly status = signal<string | null>(null);
  /** NULL = shared default set; a center id edits that center's overrides. */
  readonly centerScope = signal<number | null>(null);

  /** T3 kill-switch: hidden pickers force shared-defaults editing. */
  readonly activeScope = computed(() =>
    this.prefs.hideScopePickers() ? null : this.centerScope(),
  );

  readonly centers = resource({
    loader: () => firstValueFrom(this.centersSvc.list().pipe(map((p) => p.data))),
  });

  readonly centerScopeOptions = computed(() => [
    { value: '', labelKey: 'list.all' },
    ...(this.centers.value() ?? []).map((c) => ({ value: String(c.id), label: c.name })),
  ]);

  /** T1: persistent scope banner — shared defaults vs overrides for <center>. */
  readonly centerName = computed(
    () => (this.centers.value() ?? []).find((c) => c.id === this.centerScope())?.name ?? null,
  );

  readonly subjectCount = computed(() => (this.modules.value() ?? []).length);
  readonly activeCount = computed(
    () => (this.modules.value() ?? []).filter((m) => m.is_active).length,
  );
  readonly editedCount = computed(() => this.drafts().size);
  readonly hasActiveFilters = computed(
    () =>
      this.q().trim() !== '' ||
      (!this.prefs.hideScopePickers() && this.centerScope() !== null) ||
      this.scope() !== null ||
      this.status() !== null,
  );

  /**
   * The trail only earns its place once every visible picker has a concrete
   * value. With the scope picker hidden, "center" is the fixed shared scope.
   */
  readonly showTrail = computed(() => {
    const centerReady = this.prefs.hideScopePickers()
      ? true
      : this.centerScope() !== null && this.centerName() !== null;
    return centerReady && this.scope() !== null && this.status() !== null;
  });

  readonly trailCrumbs = computed<TrailCrumb[]>(() => {
    this.language.current();
    const crumbs: TrailCrumb[] = [];
    if (!this.prefs.hideScopePickers() && this.centerScope() !== null) {
      crumbs.push({ id: 'center', label: this.centerName() ?? '' });
    }
    const scope = this.scope();
    if (scope !== null) {
      crumbs.push({ id: 'scope', label: this.i18n.instant(`scopeType.${scope}`) });
    }
    const status = this.status();
    if (status !== null) {
      crumbs.push({
        id: 'status',
        label: this.i18n.instant(status === 'active' ? 'scoring.active' : 'scoring.inactive'),
      });
    }
    return crumbs;
  });

  /** Rows carrying this center's id are overrides; NULL-center rows are inherited defaults. */
  isOverride(centerId: number | null | undefined): boolean {
    return this.activeScope() !== null && centerId === this.activeScope();
  }

  readonly armingReset = signal(false);
  readonly resetBusy = signal(false);

  resetScope(): void {
    const scope = this.activeScope();
    if (scope === null || this.resetBusy()) return;
    this.resetBusy.set(true);
    this.error.set(null);
    this.scoring.reset(scope).subscribe({
      next: () => {
        this.resetBusy.set(false);
        this.armingReset.set(false);
        this.drafts.set(new Map());
        this.tick.update((n) => n + 1);
      },
      error: (e) => {
        this.resetBusy.set(false);
        this.armingReset.set(false);
        this.error.set(this.mapError(e));
      },
    });
  }

  readonly scopeOptions = [
    { value: '', labelKey: 'list.all' },
    { value: 'weekly', labelKey: 'scopeType.weekly' },
    { value: 'murajaa', labelKey: 'scopeType.murajaa' },
  ];

  readonly statusOptions = computed(() => {
    this.language.current();
    return [
      { value: '', label: this.i18n.instant('list.all') },
      { value: 'active', labelKey: 'scoring.active' },
      { value: 'inactive', labelKey: 'scoring.inactive' },
    ];
  });

  /** Switching scope discards unsaved drafts (they belong to the old set). */
  setCenterScope(v: DropdownValue): void {
    this.centerScope.set(dropdownNumber(v));
    this.drafts.set(new Map());
    this.armingReset.set(false);
  }

  clearFilters(): void {
    const centerChanges = !this.prefs.hideScopePickers() && this.centerScope() !== null;
    this.q.set('');
    this.scope.set(null);
    this.status.set(null);
    if (centerChanges) {
      // Reuses the normal scope-switch cleanup: the old drafts belonged to
      // that center's override set.
      this.setCenterScope('');
    } else {
      this.centerScope.set(null);
      this.armingReset.set(false);
    }
  }

  isDirtyCode(code: string): boolean {
    return this.drafts().has(code);
  }

  effectiveMax(code: string, fallback: number): number {
    return this.drafts().get(code)?.max ?? fallback;
  }

  effectiveActive(code: string, fallback: boolean): boolean {
    return this.drafts().get(code)?.active ?? fallback;
  }

  effectiveInTotal(code: string, fallback: boolean): boolean {
    return this.drafts().get(code)?.inTotal ?? fallback;
  }

  openAdd(): void {
    this.error.set(null);
    this.showAdd.set(true);
  }

  closeAdd(): void {
    if (this.saving()) return;
    this.showAdd.set(false);
    this.error.set(null);
  }

  /** A crumb re-opens its picker instead of discarding the other selections. */
  openCrumb(id: TrailFilter, event: Event): void {
    event.stopPropagation();
    const picker =
      id === 'center'
        ? this.centerPicker()
        : id === 'scope'
          ? this.scopePicker()
          : this.statusPicker();
    picker?.openMenu();
  }

  readonly rows = computed(() => {
    const needle = this.q().trim().toLowerCase();
    return (this.modules.value() ?? []).filter(
      (m) =>
        (needle === '' ||
          m.name_ar.toLowerCase().includes(needle) ||
          m.code.toLowerCase().includes(needle)) &&
        (this.scope() === null || m.scope === this.scope()) &&
        (this.status() === null || (this.status() === 'active' ? m.is_active : !m.is_active)),
    );
  });

  readonly armingDeleteId = signal<number | null>(null);
  readonly busyId = signal<number | null>(null);

  /** Live sum of active weekly-total modules — must stay 20. */
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

  readonly sumPct = computed(() => Math.max(0, Math.min(100, (this.liveSum() / 20) * 100)));

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

  /** Maps backend failures to i18n keys so errors follow the app language. */
  private mapError(err: unknown): { key: string; params?: Record<string, string | number> } {
    const body = (err as { error?: { errors?: Record<string, unknown>; message?: unknown } })
      ?.error;
    const raw = body?.errors?.['code'];
    const code = Array.isArray(raw) ? raw[0] : raw;
    if (typeof code === 'string' && code !== 'ERROR') return { key: `apiErrors.${code}` };
    if (typeof body?.message === 'string') {
      const m = body.message.match(/Weekly total would be ([\d.]+)/);
      if (m) return { key: 'scoring.sum_bad_server', params: { total: m[1] } };
    }
    return { key: 'common.error' };
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
    if (patches.length === 0 || this.saving()) return;
    this.saving.set(true);
    this.error.set(null);
    this.scoring.bulk(patches, this.activeScope()).subscribe({
      next: () => {
        this.saving.set(false);
        this.drafts.set(new Map());
        this.tick.update((n) => n + 1);
      },
      error: (e) => {
        this.saving.set(false);
        this.error.set(this.mapError(e));
      },
    });
  }

  armDelete(id: number): void {
    this.armingDeleteId.set(id);
  }

  disarmDelete(): void {
    this.armingDeleteId.set(null);
  }

  remove(id: number): void {
    if (this.busyId() !== null) return;
    this.busyId.set(id);
    this.scoring.remove(id).subscribe({
      next: () => {
        this.busyId.set(null);
        this.armingDeleteId.set(null);
        this.tick.update((n) => n + 1);
      },
      error: () => {
        this.busyId.set(null);
        this.armingDeleteId.set(null);
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
    if (this.addForm.invalid || this.saving()) {
      this.addForm.markAllAsTouched();
      return;
    }
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
        center_id: this.activeScope(),
      })
      .subscribe({
        next: () => {
          this.saving.set(false);
          this.showAdd.set(false);
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
          this.error.set(this.mapError(e));
        },
      });
  }
}

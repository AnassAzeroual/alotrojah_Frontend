import {
  ChangeDetectionStrategy,
  Component,
  computed,
  inject,
  resource,
  signal,
} from '@angular/core';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { TranslatePipe } from '@ngx-translate/core';
import { firstValueFrom, map } from 'rxjs';
import { apiErrorKey } from '../../core/api/api-errors';
import { AdminPrefsService } from '../../core/settings/admin-prefs.service';
import { LanguageService } from '../../core/i18n/language.service';
import { ThumnDisplayPipe } from '../../shared/ui/thumn-display/thumn-display.pipe';
import { sessionAmountLabel } from '../../shared/ui/thumn-display/thumn-label';
import { leaveController } from '../../core/guards/leave-controller';
import { CentersService } from '../../core/api/centers.service';
import { Level, LevelsService } from '../../core/api/levels.service';
import {
  DropdownComponent,
  DropdownValue,
  dropdownNumber,
  dropdownText,
} from '../../shared/ui/dropdown/dropdown.component';
import { EmptyStateComponent } from '../../shared/ui/empty-state/empty-state.component';
import { SpinnerComponent } from '../../shared/ui/spinner/spinner.component';

interface LevelDraft {
  name_ar: string;
  sessions_per_week: number | null;
  thumn_session_label: string;
  thumn_session_value: number | null;
  thumn_week_value: number | null;
  ahzab_term: number | null;
  ahzab_dawra: number | null;
  duration: string;
  total_ahzab: number | null;
}

const BLANK_DRAFT: LevelDraft = {
  name_ar: '',
  sessions_per_week: 3,
  thumn_session_label: '',
  thumn_session_value: null,
  thumn_week_value: null,
  ahzab_term: null,
  ahzab_dawra: null,
  duration: '',
  total_ahzab: 60,
};

/** Seed wording lives in sessionAmountLabel; the name derives from it. */
const round2 = (n: number): number => Math.round(n * 100) / 100;

/** Shared auto-calc engine (create preview + reactive edit). */
interface AutoFields {
  label: string;
  week: number;
  term: number;
  dawra: number;
  duration: string;
}

/** Owner-locked bounds (2026-10-15): 1 thumn floor, full-Quran 480 ceiling. */
const unitInRange = (unit: number | null): unit is number =>
  unit !== null && unit >= 1 && unit <= 480;

const autoFields = (sessions: number | null, unit: number | null): AutoFields | null => {
  // Out-of-range input yields no preview (never garbage) and blocks the save.
  if (sessions === null || !unitInRange(unit)) return null;
  const week = round2(sessions * unit);
  const term = round2((week / 8) * 6);
  const dawra = round2(term * 5);
  const years = week > 0 ? Math.max(1, Math.round(16 / week)) : 0;
  return {
    label: sessionAmountLabel(unit),
    week,
    term,
    dawra,
    duration: years === 0 ? '' : years === 1 ? 'سنة واحدة' : `${years} سنوات`,
  };
};

const draftOf = (l: Level): LevelDraft => ({
  name_ar: l.name_ar,
  sessions_per_week: l.sessions_per_week,
  thumn_session_label: l.thumn_per_session_label,
  thumn_session_value: Number(l.thumn_per_session_value),
  thumn_week_value: Number(l.thumn_per_week_value),
  ahzab_term: Number(l.ahzab_per_term),
  ahzab_dawra: Number(l.ahzab_per_dawra),
  duration: l.duration_label,
  total_ahzab: l.total_ahzab,
});

@Component({
  selector: 'app-levels-page',
  standalone: true,
  imports: [
    FormsModule,
    ReactiveFormsModule,
    TranslatePipe,
    ThumnDisplayPipe,
    DropdownComponent,
    EmptyStateComponent,
    SpinnerComponent,
  ],
  changeDetection: ChangeDetectionStrategy.OnPush,
  templateUrl: './levels.page.html',
  styleUrl: './levels.page.scss',
})
export class LevelsPage {
  private readonly levelsSvc = inject(LevelsService);
  private readonly centersSvc = inject(CentersService);
  protected readonly prefs = inject(AdminPrefsService);
  protected readonly language = inject(LanguageService);

  protected readonly txt = dropdownText;
  protected readonly num = dropdownNumber;

  private readonly tick = signal(0);
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

  /** Rows carrying this center's id are overrides; NULL-center rows are inherited defaults. */
  isOverride(centerId: number | null | undefined): boolean {
    return this.activeScope() !== null && centerId === this.activeScope();
  }

  readonly armingReset = signal(false);
  readonly resetBusy = signal(false);
  readonly resetErrorKey = signal<string | null>(null);

  resetScope(): void {
    const scope = this.activeScope();
    if (scope === null || this.resetBusy()) return;
    this.resetBusy.set(true);
    this.resetErrorKey.set(null);
    this.levelsSvc.reset(scope).subscribe({
      next: () => {
        this.resetBusy.set(false);
        this.armingReset.set(false);
        this.tick.update((n) => n + 1);
      },
      error: (err: unknown) => {
        this.resetBusy.set(false);
        this.armingReset.set(false);
        this.resetErrorKey.set(apiErrorKey(err));
      },
    });
  }

  readonly levels = resource({
    params: () => ({ t: this.tick(), c: this.activeScope() }),
    loader: ({ params }) => firstValueFrom(this.levelsSvc.list(params.c)),
  });

  readonly editingId = signal<number | null>(null);
  readonly draft = signal<LevelDraft | null>(null);
  private readonly editSeed = signal<LevelDraft | null>(null);

  readonly creating = signal(false);
  readonly createDraft = signal<LevelDraft>({ ...BLANK_DRAFT });
  readonly createSaving = signal(false);
  readonly createErrorKey = signal<string | null>(null);

  /** Dirty guard: an edited-but-unsaved row OR a touched create form blocks leave. */
  readonly leave = leaveController();
  isDirty(): boolean {
    if (this.creating()) return JSON.stringify(this.createDraft()) !== JSON.stringify(BLANK_DRAFT);
    if (this.editingId() === null) return false;
    const seed = this.editSeed();
    const d = this.draft();
    if (!seed || !d) return true;
    return JSON.stringify(d) !== JSON.stringify(seed);
  }
  readonly editSaving = signal(false);
  readonly editErrorKey = signal<string | null>(null);

  readonly armingDeleteId = signal<number | null>(null);
  readonly busyId = signal<number | null>(null);
  readonly deleteErrorKey = signal<string | null>(null);

  setCenterScope(v: DropdownValue): void {
    this.centerScope.set(dropdownNumber(v));
    this.editingId.set(null);
    this.armingDeleteId.set(null);
    this.armingReset.set(false);
    this.resetErrorKey.set(null);
    this.creating.set(false);
  }

  startEdit(l: Level): void {
    this.armingDeleteId.set(null);
    this.creating.set(false);
    this.editingId.set(l.id);
    this.draft.set(draftOf(l));
    this.editSeed.set(draftOf(l));
    this.editErrorKey.set(null);
  }

  setDraft(field: keyof LevelDraft, value: string): void {
    const d = this.draft();
    if (!d) return;
    const numeric: (keyof LevelDraft)[] = [
      'sessions_per_week',
      'thumn_session_value',
      'thumn_week_value',
      'ahzab_term',
      'ahzab_dawra',
      'total_ahzab',
    ];
    const next = {
      ...d,
      [field]: numeric.includes(field) ? (value.trim() === '' ? null : Number(value)) : value,
    } as LevelDraft;
    // Reactive edit, identical to create: touching days or the unit recomputes
    // the dependents AND the derived name through the same engine.
    if (field === 'sessions_per_week' || field === 'thumn_session_value') {
      const auto = autoFields(next.sessions_per_week, next.thumn_session_value);
      if (auto !== null) {
        next.thumn_session_label = auto.label;
        next.thumn_week_value = auto.week;
        next.ahzab_term = auto.term;
        next.ahzab_dawra = auto.dawra;
        next.duration = auto.duration;
        next.name_ar = `${auto.label} في الأسبوع`;
      }
    }
    this.draft.set(next);
  }

  cancelEdit(): void {
    this.editingId.set(null);
    this.draft.set(null);
    this.editSeed.set(null);
    this.editErrorKey.set(null);
  }

  startCreate(): void {
    this.editingId.set(null);
    this.armingDeleteId.set(null);
    this.createDraft.set({ ...BLANK_DRAFT });
    this.createErrorKey.set(null);
    this.creating.set(true);
  }

  cancelCreate(): void {
    this.creating.set(false);
    this.createDraft.set({ ...BLANK_DRAFT });
    this.createErrorKey.set(null);
  }

  setCreateDraft(field: keyof LevelDraft, value: string): void {
    const numeric: (keyof LevelDraft)[] = [
      'sessions_per_week',
      'thumn_session_value',
      'thumn_week_value',
      'ahzab_term',
      'ahzab_dawra',
      'total_ahzab',
    ];
    this.createDraft.update((d) => ({
      ...d,
      [field]: numeric.includes(field) ? (value.trim() === '' ? null : Number(value)) : value,
    }));
  }

  /** Auto-calculation: the two hand inputs are days + per-session unit.
   * thumn/week is exact (days × unit); total is the constant 60. The rest are
   * documented baselines, refinable any time through the edit form:
   * ahzab/term assumes a standard 6-week term, dawra 5 such terms, duration
   * ≈30 study weeks a year. Seed rows (L1–L3) predate this and stay manual. */
  readonly autoThumnWeek = computed(() => {
    const d = this.createDraft();
    return autoFields(d.sessions_per_week, d.thumn_session_value)?.week ?? null;
  });
  readonly autoLabel = computed(() => {
    const d = this.createDraft();
    return autoFields(d.sessions_per_week, d.thumn_session_value)?.label ?? '';
  });
  /** Level name derives from the amount label: "<label> في الأسبوع". */
  readonly autoName = computed(() => {
    const unit = this.createDraft().thumn_session_value;
    if (!unitInRange(unit)) return '';
    const label = sessionAmountLabel(unit);
    return label === '' ? '' : `${label} في الأسبوع`;
  });
  readonly autoAhzabTerm = computed(() => {
    const d = this.createDraft();
    return autoFields(d.sessions_per_week, d.thumn_session_value)?.term ?? null;
  });
  readonly autoAhzabDawra = computed(() => {
    const d = this.createDraft();
    return autoFields(d.sessions_per_week, d.thumn_session_value)?.dawra ?? null;
  });
  readonly autoDuration = computed(() => {
    const d = this.createDraft();
    return autoFields(d.sessions_per_week, d.thumn_session_value)?.duration ?? '';
  });

  /** Only days + unit are hand inputs; name derives from the amount label. */
  readonly createValid = computed(() => {
    const d = this.createDraft();
    return (
      d.sessions_per_week !== null &&
      d.thumn_session_value !== null &&
      this.autoName().trim() !== '' &&
      this.autoThumnWeek() !== null &&
      this.autoLabel().trim() !== '' &&
      this.autoAhzabTerm() !== null &&
      this.autoAhzabDawra() !== null &&
      this.autoDuration().trim() !== '' &&
      d.total_ahzab !== null
    );
  });

  saveCreate(): void {
    const d = this.createDraft();
    const name = this.autoName().trim();
    const week = this.autoThumnWeek();
    const term = this.autoAhzabTerm();
    const dawra = this.autoAhzabDawra();
    const label = this.autoLabel().trim();
    const duration = this.autoDuration().trim();
    if (!this.createValid() || this.createSaving()) return;
    // Instant identical-twin check against the loaded scope (the server
    // re-checks race-safely and answers the same LEVEL_EXISTS banner).
    const sameScope = (this.levels.value() ?? []).filter(
      (l) => (l.center_id ?? null) === this.activeScope(),
    );
    const twin = sameScope.some(
      (l) =>
        l.sessions_per_week === d.sessions_per_week &&
        Number(l.thumn_per_session_value) === d.thumn_session_value &&
        Number(l.thumn_per_week_value) === week &&
        Number(l.ahzab_per_term) === term &&
        Number(l.ahzab_per_dawra) === dawra &&
        l.total_ahzab === d.total_ahzab,
    );
    if (twin) {
      this.createErrorKey.set('apiErrors.LEVEL_EXISTS');
      return;
    }
    this.createSaving.set(true);
    this.createErrorKey.set(null);
    this.levelsSvc
      .create({
        name_ar: name,
        center_id: this.activeScope(),
        sessions_per_week: d.sessions_per_week!,
        thumn_per_session_label: label,
        thumn_per_session_value: d.thumn_session_value!,
        thumn_per_week_value: week!,
        ahzab_per_term: term!,
        ahzab_per_dawra: dawra!,
        duration_label: duration,
        total_ahzab: d.total_ahzab!,
      })
      .subscribe({
        next: () => {
          this.createSaving.set(false);
          this.creating.set(false);
          this.createDraft.set({ ...BLANK_DRAFT });
          this.tick.update((n) => n + 1);
        },
        error: (err: unknown) => {
          this.createSaving.set(false);
          this.createErrorKey.set(apiErrorKey(err));
        },
      });
  }

  saveEdit(id: number): void {
    const d = this.draft();
    if (!d || d.name_ar.trim() === '' || this.editSaving()) return;
    const u = d.thumn_session_value;
    if (u !== null && !unitInRange(u)) {
      this.editErrorKey.set('level.range');
      return;
    }
    this.editSaving.set(true);
    this.editErrorKey.set(null);
    this.levelsSvc
      .update(id, {
        name_ar: d.name_ar.trim(),
        sessions_per_week: d.sessions_per_week ?? undefined,
        thumn_per_session_label: d.thumn_session_label.trim() || undefined,
        thumn_per_session_value: d.thumn_session_value ?? undefined,
        thumn_per_week_value: d.thumn_week_value ?? undefined,
        ahzab_per_term: d.ahzab_term ?? undefined,
        ahzab_per_dawra: d.ahzab_dawra ?? undefined,
        duration_label: d.duration.trim() || undefined,
        total_ahzab: d.total_ahzab ?? undefined,
        center_id: this.activeScope(),
      })
      .subscribe({
        next: () => {
          this.editSaving.set(false);
          this.editingId.set(null);
          this.draft.set(null);
          this.editSeed.set(null);
          this.tick.update((n) => n + 1);
        },
        error: (err: unknown) => {
          this.editSaving.set(false);
          this.editErrorKey.set(apiErrorKey(err));
        },
      });
  }

  armDelete(id: number): void {
    this.editingId.set(null);
    this.armingDeleteId.set(id);
    this.deleteErrorKey.set(null);
  }

  disarmDelete(): void {
    this.armingDeleteId.set(null);
  }

  remove(id: number): void {
    if (this.busyId() !== null) return;
    this.busyId.set(id);
    this.deleteErrorKey.set(null);
    this.levelsSvc.remove(id).subscribe({
      next: () => {
        this.busyId.set(null);
        this.armingDeleteId.set(null);
        this.tick.update((n) => n + 1);
      },
      error: (err: unknown) => {
        this.busyId.set(null);
        this.armingDeleteId.set(null);
        this.deleteErrorKey.set(apiErrorKey(err));
      },
    });
  }
}

import {
  ChangeDetectionStrategy,
  Component,
  computed,
  effect,
  inject,
  resource,
  signal,
} from '@angular/core';
import { FormsModule } from '@angular/forms';
import { TranslatePipe } from '@ngx-translate/core';
import { firstValueFrom, map } from 'rxjs';
import { AdminPrefsService } from '../../core/settings/admin-prefs.service';
import { LanguageService } from '../../core/i18n/language.service';
import { ThumnDisplayPipe } from '../../shared/ui/thumn-display/thumn-display.pipe';
import { sessionAmountLabel, weekAmountLabel } from '../../shared/ui/thumn-display/thumn-label';
import { leaveController } from '../../core/guards/leave-controller';
import { CentersService } from '../../core/api/centers.service';
import { LevelsService } from '../../core/api/levels.service';
import { ReferenceService } from '../../core/api/reference.service';
import { LevelResource, SeasonResource, StoreLevelRequest } from '../../core/api/models';
import {
  DropdownComponent,
  DropdownValue,
  dropdownNumber,
  dropdownText,
} from '../../shared/ui/dropdown/dropdown.component';
import { EmptyStateComponent } from '../../shared/ui/empty-state/empty-state.component';
import { SpinnerComponent } from '../../shared/ui/spinner/spinner.component';

/** The only two hand inputs; every other value on both forms is derived. */
type LevelInput = 'sessions_per_week' | 'thumn_session_value';

/** Full form state: the two inputs plus the read-only values they drive. */
interface LevelForm {
  sessions_per_week: number | null;
  thumn_session_value: number | null;
  name_ar: string;
  thumn_session_label: string;
  thumn_week_value: number | null;
  ahzab_term: number | null;
  ahzab_dawra: number | null;
  duration: string;
  total_ahzab: number;
}

/** Owner-locked total ahzab on a new level. */
const TOTAL_AHZAB = 60;

/** Standard term length when the season calendar is unknown. */
const DEFAULT_STUDY_WEEKS = 6;

const BLANK_FORM: LevelForm = {
  sessions_per_week: 3,
  thumn_session_value: null,
  name_ar: '',
  thumn_session_label: '',
  thumn_week_value: null,
  ahzab_term: null,
  ahzab_dawra: null,
  duration: '',
  total_ahzab: TOTAL_AHZAB,
};

/** Seed wording lives in sessionAmountLabel; the name derives from it. */
const round2 = (n: number): number => Math.round(n * 100) / 100;

/** Everything the two inputs produce (create preview + reactive edit). */
interface AutoFields {
  label: string;
  name: string;
  week: number;
  term: number;
  dawra: number;
  duration: string;
}

/** Owner-locked bounds (2026-10-15): 1 thumn floor, full-Quran 480 ceiling. */
const unitInRange = (unit: number | null): unit is number =>
  unit !== null && unit >= 1 && unit <= 480;

/**
 * The term goal counts STUDY weeks only (murajaa/review weeks carry no new
 * hifz), so the season's first-term length is the divisor — not a hardcoded 6.
 */
const autoFields = (
  sessions: number | null,
  unit: number | null,
  studyWeeks: number,
): AutoFields | null => {
  // Out-of-range input yields no preview (never garbage) and blocks the save.
  if (sessions === null || sessions < 1 || !unitInRange(unit)) return null;
  const week = round2(sessions * unit);
  const term = round2((week / 8) * studyWeeks);
  const dawra = round2(term * 5);
  const years = Math.max(1, Math.round(16 / week));
  const label = sessionAmountLabel(unit);
  // The name is the WEEKLY amount (seeds: 3 × 1 → "3 أثمان في الأسبوع");
  // the label stays per session, which is what one lesson covers.
  const weekName = weekAmountLabel(week);
  return {
    label,
    name: weekName === '' ? '' : `${weekName} في الأسبوع`,
    week,
    term,
    dawra,
    duration: years === 1 ? 'سنة واحدة' : `${years} سنوات`,
  };
};

/** Recompute the read-only fields; an invalid pair blanks them (never stale). */
const withDerived = (f: LevelForm, studyWeeks: number): LevelForm => {
  const auto = autoFields(f.sessions_per_week, f.thumn_session_value, studyWeeks);
  if (auto === null) {
    return {
      ...f,
      name_ar: '',
      thumn_session_label: '',
      thumn_week_value: null,
      ahzab_term: null,
      ahzab_dawra: null,
      duration: '',
    };
  }
  return {
    ...f,
    name_ar: auto.name,
    thumn_session_label: auto.label,
    thumn_week_value: auto.week,
    ahzab_term: auto.term,
    ahzab_dawra: auto.dawra,
    duration: auto.duration,
  };
};

/** Seed rows keep their hand-tuned values until an input actually changes. */
const formOf = (l: LevelResource): LevelForm => ({
  sessions_per_week: l.sessions_per_week,
  thumn_session_value: Number(l.thumn_per_session_value),
  name_ar: l.name_ar,
  thumn_session_label: l.thumn_per_session_label,
  thumn_week_value: Number(l.thumn_per_week_value),
  ahzab_term: Number(l.ahzab_per_term),
  ahzab_dawra: Number(l.ahzab_per_dawra),
  duration: l.duration_label,
  total_ahzab: l.total_ahzab,
});

/** Empty or non-numeric text → null; otherwise a finite number. */
const toNumber = (raw: string): number | null => {
  const text = raw.trim();
  if (text === '') return null;
  const n = Number(text);
  return Number.isFinite(n) ? n : null;
};

@Component({
  selector: 'app-levels-page',
  standalone: true,
  imports: [
    FormsModule,
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
  private readonly ref = inject(ReferenceService);
  protected readonly prefs = inject(AdminPrefsService);
  protected readonly language = inject(LanguageService);

  protected readonly txt = dropdownText;

  private readonly tick = signal(0);
  /** Every level belongs to a center's season; null = nothing picked yet. */
  readonly centerScope = signal<number | null>(null);
  /** The season whose level set is shown (and edited). */
  readonly seasonId = signal<number | null>(null);

  readonly centers = resource({
    // Every center must be reachable: the list endpoint paginates at 20.
    loader: () => firstValueFrom(this.centersSvc.listAll()),
  });

  readonly centerScopeOptions = computed(() =>
    (this.centers.value() ?? []).map((c) => ({ value: String(c.id), label: c.name })),
  );

  readonly centerName = computed(
    () => (this.centers.value() ?? []).find((c) => c.id === this.centerScope())?.name ?? null,
  );

  /** The picked center's lane: its own seasons plus the legacy shared one. */
  readonly seasons = resource({
    params: () => ({ c: this.centerScope() }),
    loader: ({ params }) =>
      params.c === null
        ? Promise.resolve([] as SeasonResource[])
        : firstValueFrom(this.ref.seasons(params.c).pipe(map((p) => p.data ?? []))),
  });

  readonly seasonOptions = computed(() =>
    (this.seasons.value() ?? []).map((s) => ({ value: String(s.id), label: s.name })),
  );

  readonly selectedSeason = computed(
    () => (this.seasons.value() ?? []).find((s) => s.id === this.seasonId()) ?? null,
  );

  readonly seasonName = computed(() => this.selectedSeason()?.name ?? null);

  /** Legacy shared lane (center_id NULL): one set serving every center. */
  readonly seasonIsShared = computed(() => this.selectedSeason()?.center_id === null);

  /** A center with no season at all owns no levels yet. */
  readonly noSeason = computed(
    () =>
      this.centerScope() !== null &&
      this.seasons.hasValue() &&
      (this.seasons.value() ?? []).length === 0,
  );

  /** Nothing can be created before the first center exists. */
  readonly noCenter = computed(
    () => this.centers.hasValue() && (this.centers.value() ?? []).length === 0,
  );

  constructor() {
    // Pick the lane's current season (else its latest, else the shared one)
    // whenever the center changes or its season list arrives.
    effect(() => {
      const centerId = this.centerScope();
      if (centerId === null) {
        if (this.seasonId() !== null) this.seasonId.set(null);
        return;
      }
      if (!this.seasons.hasValue()) return;
      const rows = this.seasons.value() ?? [];
      const selected = this.seasonId();
      if (selected !== null && rows.some((s) => s.id === selected)) return;
      const pick =
        rows.find((s) => s.is_current && s.center_id === centerId) ??
        rows.find((s) => s.center_id === centerId) ??
        rows.find((s) => s.is_current && s.center_id === null) ??
        rows[0] ??
        null;
      this.seasonId.set(pick?.id ?? null);
    });

    // Levels are never global: pick the admin's preferred center (else the
    // first) as soon as the center list arrives. The season effect above then
    // picks that center's current (else latest) season.
    effect(() => {
      if (this.centerScope() !== null) return;
      const rows = this.centers.value() ?? [];
      if (rows.length === 0) return;
      const preferred = this.prefs.appearanceCenterId();
      this.centerScope.set((rows.find((c) => c.id === preferred) ?? rows[0]).id);
    });
  }

  readonly armingReset = signal(false);
  readonly resetBusy = signal(false);

  resetScope(): void {
    const season = this.seasonId();
    if (season === null || this.resetBusy()) return;
    this.resetBusy.set(true);
    this.levelsSvc.reset(season).subscribe({
      next: () => {
        this.resetBusy.set(false);
        this.armingReset.set(false);
        this.tick.update((n) => n + 1);
      },
      error: () => {
        this.resetBusy.set(false);
        this.armingReset.set(false);
      },
    });
  }

  readonly levels = resource({
    params: () => ({ t: this.tick(), c: this.centerScope(), s: this.seasonId() }),
    loader: ({ params }) => {
      // No center/season = nothing to show: there is no global level set.
      if (params.c === null || params.s === null) return Promise.resolve([]);
      return firstValueFrom(this.levelsSvc.list(params.s));
    },
  });

  /** First-term length of the picked season, for the form's goal preview. */
  readonly studyWeeks = computed(() => {
    const goals = (this.levels.value() ?? []).flatMap((l) => l.term_goals);
    return goals[0]?.study_weeks ?? DEFAULT_STUDY_WEEKS;
  });

  readonly editingId = signal<number | null>(null);
  readonly creating = signal(false);

  /** One form state for both modes: create seeds blanks, edit seeds the row. */
  readonly form = signal<LevelForm>({ ...BLANK_FORM });
  private readonly editSeed = signal<LevelForm | null>(null);

  readonly saving = signal(false);
  readonly errorKey = signal<string | null>(null);

  /** Dirty guard: an edited-but-unsaved row OR a touched create form blocks leave. */
  readonly leave = leaveController();
  isDirty(): boolean {
    if (this.creating()) return JSON.stringify(this.form()) !== JSON.stringify(BLANK_FORM);
    if (this.editingId() === null) return false;
    const seed = this.editSeed();
    return seed === null || JSON.stringify(this.form()) !== JSON.stringify(seed);
  }

  readonly armingDeleteId = signal<number | null>(null);
  readonly busyId = signal<number | null>(null);
  readonly openGoalsId = signal<number | null>(null);

  /** The headline goal: the first term's exact value (stored value for seeds). */
  goalHeadline(l: LevelResource): number {
    return l.ahzab_first_term ?? l.ahzab_per_term;
  }

  toggleGoals(id: number): void {
    this.openGoalsId.set(this.openGoalsId() === id ? null : id);
  }

  setCenterScope(v: DropdownValue): void {
    const id = dropdownNumber(v);
    if (id === this.centerScope()) return;
    this.centerScope.set(id);
    this.seasonId.set(null);
    this.clearTransient();
  }

  setSeason(v: DropdownValue): void {
    const id = dropdownNumber(v);
    if (id === this.seasonId()) return;
    this.seasonId.set(id);
    this.clearTransient();
  }

  /** Switching scope abandons any open form/confirmation. */
  private clearTransient(): void {
    this.editingId.set(null);
    this.armingDeleteId.set(null);
    this.armingReset.set(false);
    this.openGoalsId.set(null);
    this.creating.set(false);
    this.resetForm();
  }

  /** Clear the shared form state (create and edit never coexist). */
  private resetForm(): void {
    this.form.set({ ...BLANK_FORM });
    this.editSeed.set(null);
    this.errorKey.set(null);
  }

  startEdit(l: LevelResource): void {
    if (this.seasonId() === null) return;
    this.armingDeleteId.set(null);
    this.creating.set(false);
    this.editingId.set(l.id);
    const seed = formOf(l);
    this.form.set(seed);
    this.editSeed.set(seed);
    this.errorKey.set(null);
  }

  cancelEdit(): void {
    this.editingId.set(null);
    this.resetForm();
  }

  startCreate(): void {
    if (this.seasonId() === null) return;
    this.editingId.set(null);
    this.armingDeleteId.set(null);
    this.creating.set(true);
    this.resetForm();
  }

  cancelCreate(): void {
    this.creating.set(false);
    this.resetForm();
  }

  /** The only writable fields: every other value recomputes from these two. */
  setInput(field: LevelInput, value: string): void {
    this.form.update((f) => withDerived({ ...f, [field]: toNumber(value) }, this.studyWeeks()));
  }

  /** Auto-calculation: the two hand inputs are days + per-session unit.
   * thumn/week is exact (days × unit); total is the constant 60. The term goal
   * is study weeks × days × unit ÷ 8 (review weeks excluded), using the picked
   * season's first-term length; dawra assumes 5 such terms, duration ≈30 study
   * weeks a year. Existing rows keep their stored values until one of the two
   * inputs changes. */
  readonly createValid = computed(
    () =>
      autoFields(
        this.form().sessions_per_week,
        this.form().thumn_session_value,
        this.studyWeeks(),
      ) !== null,
  );

  /** One payload for both modes, so create and edit can never drift apart. */
  private payload(f: LevelForm): StoreLevelRequest {
    return {
      name_ar: f.name_ar.trim(),
      season_id: this.seasonId()!,
      sessions_per_week: f.sessions_per_week!,
      thumn_per_session_label: f.thumn_session_label.trim(),
      thumn_per_session_value: f.thumn_session_value!,
      thumn_per_week_value: f.thumn_week_value!,
      ahzab_per_term: f.ahzab_term!,
      ahzab_per_dawra: f.ahzab_dawra!,
      duration_label: f.duration.trim(),
      total_ahzab: f.total_ahzab,
    };
  }

  saveCreate(): void {
    if (this.seasonId() === null || !this.createValid() || this.saving()) return;
    const payload = this.payload(this.form());
    // Instant identical-twin check against the loaded season (the server
    // re-checks race-safely and answers the same LEVEL_EXISTS banner).
    const twin = (this.levels.value() ?? []).some(
      (l) =>
        l.sessions_per_week === payload.sessions_per_week &&
        Number(l.thumn_per_session_value) === payload.thumn_per_session_value &&
        Number(l.thumn_per_week_value) === payload.thumn_per_week_value &&
        Number(l.ahzab_per_term) === payload.ahzab_per_term &&
        Number(l.ahzab_per_dawra) === payload.ahzab_per_dawra &&
        l.total_ahzab === payload.total_ahzab,
    );
    if (twin) {
      this.errorKey.set('apiErrors.LEVEL_EXISTS');
      return;
    }
    this.saving.set(true);
    this.errorKey.set(null);
    this.levelsSvc.create(payload).subscribe({
      next: () => {
        this.saving.set(false);
        this.creating.set(false);
        this.resetForm();
        this.tick.update((n) => n + 1);
      },
      error: () => this.saving.set(false),
    });
  }

  saveEdit(id: number): void {
    if (this.seasonId() === null || this.saving()) return;
    const f = this.form();
    // The button stays live so an invalid/empty pair gets the range banner
    // instead of a dead control with no explanation.
    if (autoFields(f.sessions_per_week, f.thumn_session_value, this.studyWeeks()) === null) {
      this.errorKey.set('level.range');
      return;
    }
    this.saving.set(true);
    this.errorKey.set(null);
    this.levelsSvc.update(id, this.payload(f)).subscribe({
      next: () => {
        this.saving.set(false);
        this.editingId.set(null);
        this.resetForm();
        this.tick.update((n) => n + 1);
      },
      error: () => this.saving.set(false),
    });
  }

  armDelete(id: number): void {
    if (this.seasonId() === null) return;
    this.editingId.set(null);
    this.armingDeleteId.set(id);
  }

  disarmDelete(): void {
    this.armingDeleteId.set(null);
  }

  remove(id: number): void {
    if (this.seasonId() === null || this.busyId() !== null) return;
    this.busyId.set(id);
    this.levelsSvc.remove(id).subscribe({
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
}

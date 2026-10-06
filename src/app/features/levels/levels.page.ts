import {
  ChangeDetectionStrategy,
  Component,
  computed,
  inject,
  resource,
  signal,
} from '@angular/core';
import { ReactiveFormsModule } from '@angular/forms';
import { TranslatePipe } from '@ngx-translate/core';
import { firstValueFrom, map } from 'rxjs';
import { apiErrorKey } from '../../core/api/api-errors';
import { AdminPrefsService } from '../../core/settings/admin-prefs.service';
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
    ReactiveFormsModule,
    TranslatePipe,
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
  }

  startEdit(l: Level): void {
    this.armingDeleteId.set(null);
    this.editingId.set(l.id);
    this.draft.set(draftOf(l));
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
    this.draft.set({
      ...d,
      [field]: numeric.includes(field) ? (value.trim() === '' ? null : Number(value)) : value,
    } as LevelDraft);
  }

  cancelEdit(): void {
    this.editingId.set(null);
    this.draft.set(null);
    this.editErrorKey.set(null);
  }

  saveEdit(id: number): void {
    const d = this.draft();
    if (!d || d.name_ar.trim() === '' || this.editSaving()) return;
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

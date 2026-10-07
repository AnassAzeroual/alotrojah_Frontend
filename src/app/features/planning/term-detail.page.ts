import {
  ChangeDetectionStrategy,
  Component,
  computed,
  effect,
  inject,
  input,
  resource,
  signal,
} from '@angular/core';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { TranslatePipe } from '@ngx-translate/core';
import { firstValueFrom } from 'rxjs';
import { PlanningService } from '../../core/api/planning.service';
import { leaveController } from '../../core/guards/leave-controller';
import { apiErrorKey } from '../../core/api/api-errors';
import { DatePickerComponent } from '../../shared/ui/date-picker/date-picker.component';
import {
  DropdownComponent,
  DropdownOption,
  dropdownNumber,
  dropdownText,
} from '../../shared/ui/dropdown/dropdown.component';
import { EmptyStateComponent } from '../../shared/ui/empty-state/empty-state.component';
import { SpinnerComponent } from '../../shared/ui/spinner/spinner.component';
import { StatusBadgeComponent } from '../../shared/ui/status-badge/status-badge.component';

@Component({
  selector: 'app-term-detail-page',
  standalone: true,
  imports: [
    FormsModule,
    TranslatePipe,
    DatePickerComponent,
    DropdownComponent,
    EmptyStateComponent,
    SpinnerComponent,
    StatusBadgeComponent,
  ],
  changeDetection: ChangeDetectionStrategy.OnPush,
  templateUrl: './term-detail.page.html',
})
export class TermDetailPage {
  readonly id = input.required<number, string>({ transform: (v: string) => Number(v) });

  private readonly planning = inject(PlanningService);
  private readonly router = inject(Router);
  private readonly tick = signal(0);

  protected readonly term = resource({
    params: () => ({ id: this.id(), t: this.tick() }),
    loader: ({ params }) => firstValueFrom(this.planning.termDetail(params.id)),
  });

  /** Sibling terms of the same season — the terms list this page was missing. */
  private readonly siblings = resource({
    params: () => ({ s: this.term.value()?.season_id ?? null }),
    loader: ({ params }) =>
      params.s === null ? Promise.resolve([]) : firstValueFrom(this.planning.terms(params.s)),
  });

  protected readonly termOptions = computed<DropdownOption[]>(() =>
    (this.siblings.value() ?? []).map((t) => ({ value: String(t.id), label: t.name_ar })),
  );

  protected readonly num = dropdownNumber;

  protected goTerm(v: number | null): void {
    if (v === null || v === this.id()) return;
    void this.router.navigate(['/planning/terms', v]);
  }

  protected openWeek = signal<number | null>(null);
  private readonly expandedSeed = signal<number | null>(null);
  protected readonly txt = dropdownText;

  readonly renaming = signal(false);
  readonly renameValue = signal('');

  /** Dirty guard: a renamed-but-unsaved term title blocks route leave. */
  readonly leave = leaveController();
  isDirty(): boolean {
    if (!this.renaming()) return false;
    const cur = this.renameValue().trim();
    if (cur === '') return false;
    return cur !== (this.term.value()?.name_ar ?? '');
  }
  readonly renameSaving = signal(false);
  readonly renameErrorKey = signal<string | null>(null);

  constructor() {
    effect(() => {
      const t = this.term.value();
      if (t && !this.renaming()) this.renameValue.set(t.name_ar);
      // Never render a wall of collapsed cards: open the first week on each
      // fresh term load (user toggles afterwards are never overridden).
      if (t && this.expandedSeed() !== this.id()) {
        this.expandedSeed.set(this.id());
        this.openWeek.set(t.weeks[0]?.id ?? null);
      }
    });
  }

  protected toggleWeek(id: number): void {
    this.openWeek.update((v) => (v === id ? null : id));
  }

  startRename(): void {
    this.renameErrorKey.set(null);
    this.renaming.set(true);
  }

  cancelRename(): void {
    this.renaming.set(false);
    this.renameErrorKey.set(null);
  }

  submitRename(): void {
    const name = this.renameValue().trim();
    if (name === '' || name.length > 50 || this.renameSaving()) return;
    this.renameSaving.set(true);
    this.renameErrorKey.set(null);
    this.planning.renameTerm(this.id(), name).subscribe({
      next: () => {
        this.renameSaving.set(false);
        this.renaming.set(false);
        this.tick.update((n) => n + 1);
      },
      error: (err: unknown) => {
        this.renameSaving.set(false);
        this.renameErrorKey.set(apiErrorKey(err));
      },
    });
  }

  protected setWeekType(weekId: number, type: string): void {
    this.planning.setWeekType(weekId, type).subscribe(() => this.tick.update((n) => n + 1));
  }

  protected setSession(id: number, patch: Record<string, string>): void {
    this.planning.updateSession(id, patch).subscribe(() => this.tick.update((n) => n + 1));
  }

  readonly sessionTypeOptions = [
    { value: 'memorization', labelKey: 'sessionType.memorization' },
    { value: 'revision', labelKey: 'sessionType.revision' },
    { value: 'exam', labelKey: 'sessionType.exam' },
  ];
  readonly sessionStatusOptions = [
    { value: 'planned', labelKey: 'sessionStatus.planned' },
    { value: 'done', labelKey: 'sessionStatus.done' },
    { value: 'cancelled', labelKey: 'sessionStatus.cancelled' },
  ];
}

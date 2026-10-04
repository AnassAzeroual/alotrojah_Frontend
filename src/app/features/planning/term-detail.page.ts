import {
  ChangeDetectionStrategy,
  Component,
  effect,
  inject,
  input,
  resource,
  signal,
} from '@angular/core';
import { TranslatePipe } from '@ngx-translate/core';
import { firstValueFrom } from 'rxjs';
import { PlanningService } from '../../core/api/planning.service';
import { DropdownComponent, dropdownText } from '../../shared/ui/dropdown/dropdown.component';
import { EmptyStateComponent } from '../../shared/ui/empty-state/empty-state.component';
import { SpinnerComponent } from '../../shared/ui/spinner/spinner.component';
import { StatusBadgeComponent } from '../../shared/ui/status-badge/status-badge.component';

@Component({
  selector: 'app-term-detail-page',
  standalone: true,
  imports: [
    TranslatePipe,
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
  private readonly tick = signal(0);

  protected readonly term = resource({
    params: () => ({ id: this.id(), t: this.tick() }),
    loader: ({ params }) => firstValueFrom(this.planning.termDetail(params.id)),
  });

  protected openWeek = signal<number | null>(null);
  protected readonly txt = dropdownText;

  readonly renaming = signal(false);
  readonly renameValue = signal('');
  readonly renameSaving = signal(false);
  readonly renameFailed = signal(false);

  constructor() {
    effect(() => {
      const t = this.term.value();
      if (t && !this.renaming()) this.renameValue.set(t.name_ar);
    });
  }

  protected toggleWeek(id: number): void {
    this.openWeek.update((v) => (v === id ? null : id));
  }

  startRename(): void {
    this.renameFailed.set(false);
    this.renaming.set(true);
  }

  cancelRename(): void {
    this.renaming.set(false);
    this.renameFailed.set(false);
  }

  submitRename(): void {
    const name = this.renameValue().trim();
    if (name === '' || name.length > 50 || this.renameSaving()) return;
    this.renameSaving.set(true);
    this.renameFailed.set(false);
    this.planning.renameTerm(this.id(), name).subscribe({
      next: () => {
        this.renameSaving.set(false);
        this.renaming.set(false);
        this.tick.update((n) => n + 1);
      },
      error: () => {
        this.renameSaving.set(false);
        this.renameFailed.set(true);
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

  protected sessVal(event: Event): string {
    return (event.target as HTMLInputElement).value;
  }
}

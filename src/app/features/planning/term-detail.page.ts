import { ChangeDetectionStrategy, Component, inject, input, resource, signal } from '@angular/core';
import { TranslatePipe } from '@ngx-translate/core';
import { firstValueFrom } from 'rxjs';
import { PlanningService } from '../../core/api/planning.service';
import { EmptyStateComponent } from '../../shared/ui/empty-state/empty-state.component';
import { StatusBadgeComponent } from '../../shared/ui/status-badge/status-badge.component';

@Component({
  selector: 'app-term-detail-page',
  standalone: true,
  imports: [TranslatePipe, EmptyStateComponent, StatusBadgeComponent],
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

  protected toggleWeek(id: number): void {
    this.openWeek.update((v) => (v === id ? null : id));
  }

  protected setWeekType(weekId: number, type: string): void {
    this.planning.setWeekType(weekId, type).subscribe(() => this.tick.update((n) => n + 1));
  }

  protected setSession(id: number, patch: Record<string, string>): void {
    this.planning.updateSession(id, patch).subscribe(() => this.tick.update((n) => n + 1));
  }

  protected sessVal(event: Event): string {
    return (event.target as HTMLSelectElement).value;
  }
}

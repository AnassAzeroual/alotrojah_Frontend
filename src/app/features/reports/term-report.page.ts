import {
  ChangeDetectionStrategy,
  Component,
  computed,
  inject,
  resource,
  signal,
} from '@angular/core';
import { TranslatePipe } from '@ngx-translate/core';
import { firstValueFrom, map } from 'rxjs';
import { PlanningService } from '../../core/api/planning.service';
import { ReferenceService } from '../../core/api/reference.service';
import { ReportsService } from '../../core/api/reports.service';
import { StudentsService } from '../../core/api/students.service';
import {
  DropdownComponent,
  dropdownNumber,
  dropdownText,
} from '../../shared/ui/dropdown/dropdown.component';
import { EmptyStateComponent } from '../../shared/ui/empty-state/empty-state.component';
import { StatusBadgeComponent } from '../../shared/ui/status-badge/status-badge.component';

@Component({
  selector: 'app-term-report-page',
  standalone: true,
  imports: [TranslatePipe, DropdownComponent, EmptyStateComponent, StatusBadgeComponent],
  changeDetection: ChangeDetectionStrategy.OnPush,
  templateUrl: './term-report.page.html',
})
export class TermReportPage {
  private readonly reports = inject(ReportsService);
  private readonly studentsSvc = inject(StudentsService);
  private readonly planning = inject(PlanningService);
  private readonly ref = inject(ReferenceService);

  protected readonly num = dropdownNumber;
  protected readonly txt = dropdownText;

  readonly search = signal('');
  readonly pickedStudent = signal<number | null>(null);
  readonly pickedTerm = signal<number | null>(null);

  readonly termOptions = computed(() => [
    { value: '', label: '—' },
    ...(this.terms.value() ?? []).map((t) => ({ value: t.id, label: t.name_ar })),
  ]);

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

  private currentSeasonId(): number | null {
    const list = this.seasons.value()?.data ?? [];
    return list.find((s) => s.is_current)?.id ?? list[0]?.id ?? null;
  }

  readonly report = resource({
    params: () => ({ st: this.pickedStudent(), t: this.pickedTerm() }),
    loader: ({ params }) => {
      if (params.st === null || params.t === null) return Promise.resolve(null);
      return firstValueFrom(this.reports.term(params.st, params.t));
    },
  });

  protected print(): void {
    window.print();
  }
}

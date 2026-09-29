import { ChangeDetectionStrategy, Component, inject, resource, signal } from '@angular/core';
import { TranslatePipe } from '@ngx-translate/core';
import { firstValueFrom, map } from 'rxjs';
import { ReferenceService } from '../../core/api/reference.service';
import { ReportsService } from '../../core/api/reports.service';
import { StudentsService } from '../../core/api/students.service';
import { EmptyStateComponent } from '../../shared/ui/empty-state/empty-state.component';
import { SpinnerComponent } from '../../shared/ui/spinner/spinner.component';
import { StatusBadgeComponent } from '../../shared/ui/status-badge/status-badge.component';

@Component({
  selector: 'app-season-report-page',
  standalone: true,
  imports: [TranslatePipe, SpinnerComponent, EmptyStateComponent, StatusBadgeComponent],
  changeDetection: ChangeDetectionStrategy.OnPush,
  templateUrl: './season-report.page.html',
})
export class SeasonReportPage {
  private readonly reports = inject(ReportsService);
  private readonly studentsSvc = inject(StudentsService);
  private readonly ref = inject(ReferenceService);

  readonly search = signal('');
  readonly pickedStudent = signal<number | null>(null);

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

  private currentSeasonId(): number | null {
    const list = this.seasons.value()?.data ?? [];
    return list.find((s) => s.is_current)?.id ?? list[0]?.id ?? null;
  }

  readonly report = resource({
    params: () => ({ st: this.pickedStudent(), s: this.currentSeasonId() }),
    loader: ({ params }) => {
      if (params.st === null || params.s === null) return Promise.resolve(null);
      return firstValueFrom(this.reports.season(params.st, params.s));
    },
  });

  protected print(): void {
    window.print();
  }
}

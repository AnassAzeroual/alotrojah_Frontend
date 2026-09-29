import {
  ChangeDetectionStrategy,
  Component,
  computed,
  inject,
  resource,
  signal,
} from '@angular/core';
import { toSignal } from '@angular/core/rxjs-interop';
import { TranslatePipe } from '@ngx-translate/core';
import { ChartData } from 'chart.js';
import { firstValueFrom, map } from 'rxjs';
import { CentersService } from '../../core/api/centers.service';
import { CenterDashboard, DashboardService } from '../../core/api/dashboard.service';
import { ReferenceService } from '../../core/api/reference.service';
import { StudentsService } from '../../core/api/students.service';
import { SpinnerComponent } from '../../shared/ui/spinner/spinner.component';
import { ChartComponent } from '../../shared/ui/chart/chart.component';

@Component({
  selector: 'app-dashboard-page',
  standalone: true,
  imports: [TranslatePipe, SpinnerComponent, ChartComponent],
  changeDetection: ChangeDetectionStrategy.OnPush,
  templateUrl: './dashboard.page.html',
})
export class DashboardPage {
  private readonly dash = inject(DashboardService);
  private readonly centersSvc = inject(CentersService);
  private readonly studentsSvc = inject(StudentsService);
  private readonly ref = inject(ReferenceService);

  readonly centers = toSignal(this.centersSvc.list().pipe(map((p) => p.data)), {
    initialValue: [],
  });
  readonly pickedCenter = signal<number | null>(null);
  readonly search = signal('');
  readonly pickedStudent = signal<number | null>(null);

  readonly seasonId = resource({
    params: () => ({}),
    loader: () =>
      firstValueFrom(this.ref.seasons()).then(
        (r) => r.data.find((s) => s.is_current)?.id ?? r.data[0]?.id ?? 1,
      ),
  });

  readonly centerData = resource({
    params: () => ({ c: this.pickedCenter(), s: this.seasonId.value() ?? null }),
    loader: ({ params }): Promise<CenterDashboard | null> => {
      if (params.c === null || params.s === null) return Promise.resolve(null);
      return firstValueFrom(this.dash.center(params.c, params.s));
    },
  });

  readonly found = resource({
    params: () => ({ q: this.search() }),
    loader: ({ params }) =>
      params.q.trim() === ''
        ? Promise.resolve([])
        : firstValueFrom(this.studentsSvc.list({ q: params.q }).pipe(map((p) => p.data))),
  });

  readonly weekly = resource({
    params: () => ({ st: this.pickedStudent(), s: this.seasonId.value() ?? null }),
    loader: ({ params }) => {
      if (params.st === null || params.s === null) return Promise.resolve([]);
      return firstValueFrom(this.dash.weekly(params.st, params.s));
    },
  });

  readonly weeklyChart = computed((): ChartData => {
    const rows = this.weekly.value() ?? [];
    return {
      labels: rows.map((r) => `W${r.week_id}`),
      datasets: [{ label: 'thumn', data: rows.map((r) => Number(r.total_thumn)) }],
    };
  });

  readonly honorsChart = computed((): ChartData => {
    const rows = this.centerData.value()?.honors ?? [];
    return { labels: rows.map((r) => r.honor_flag), datasets: [{ data: rows.map((r) => r.n) }] };
  });

  readonly attendanceChart = computed((): ChartData => {
    const rows = this.centerData.value()?.attendance ?? [];
    return { labels: rows.map((r) => r.status), datasets: [{ data: rows.map((r) => r.n) }] };
  });
}

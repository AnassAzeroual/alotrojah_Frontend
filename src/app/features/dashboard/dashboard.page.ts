import {
  ChangeDetectionStrategy,
  Component,
  computed,
  inject,
  resource,
  signal,
} from '@angular/core';
import { TranslatePipe, TranslateService } from '@ngx-translate/core';
import { ChartData, ChartOptions } from 'chart.js';
import { DashboardOverview, DashboardService } from '../../core/api/dashboard.service';
import { DashboardMeResponse } from '../../core/api/models';
import { AuthService } from '../../core/auth/auth.service';
import { LanguageService } from '../../core/i18n/language.service';
import { ChartComponent } from '../../shared/ui/chart/chart.component';
import { DropdownComponent, DropdownOption } from '../../shared/ui/dropdown/dropdown.component';
import { EmptyStateComponent } from '../../shared/ui/empty-state/empty-state.component';

const ATTENDANCE_COLORS: Record<string, string> = {
  present: '#00b8a9',
  late: '#f59e0b',
  absent: '#ef4444',
  excused: '#8b5cf6',
};

const HONOR_COLORS: Record<string, string> = {
  tashji3: '#00b8a9',
  intibah: '#f59e0b',
  none: '#64748b',
};

const SCORE_COLORS = ['#ef4444', '#f59e0b', '#0ea5e9', '#00b8a9'];

@Component({
  selector: 'app-dashboard-page',
  standalone: true,
  imports: [TranslatePipe, ChartComponent, DropdownComponent, EmptyStateComponent],
  changeDetection: ChangeDetectionStrategy.OnPush,
  templateUrl: './dashboard.page.html',
  styleUrl: './dashboard.page.scss',
})
export class DashboardPage {
  private readonly dash = inject(DashboardService);
  private readonly auth = inject(AuthService);
  private readonly i18n = inject(TranslateService);
  readonly language = inject(LanguageService);

  readonly role = computed(() => this.auth.role());
  readonly isStudent = computed(() => this.role() === 'student');
  readonly user = computed(() => this.auth.currentUser());

  readonly centerId = signal<number | null>(null);

  readonly overview = resource({
    params: () => ({ student: this.isStudent(), center: this.centerId() }),
    loader: ({ params }): Promise<DashboardOverview | null> => {
      if (params.student) return Promise.resolve(null);
      return new Promise((resolve, reject) =>
        this.dash
          .overview(params.center === null ? undefined : { center_id: params.center })
          .subscribe({ next: resolve, error: reject }),
      );
    },
  });

  readonly me = resource({
    params: () => ({ student: this.isStudent() }),
    loader: ({ params }): Promise<DashboardMeResponse['data'] | null> => {
      if (!params.student) return Promise.resolve(null);
      return new Promise((resolve, reject) =>
        this.dash.me().subscribe({ next: resolve, error: reject }),
      );
    },
  });

  readonly centerOptions = computed<DropdownOption[]>(() => [
    { value: '', label: this.instant('dash.allCenters') },
    ...(this.overview.value()?.scope.centers ?? []).map((center) => ({
      value: String(center.id),
      label: center.name,
    })),
  ]);

  readonly greeting = computed(() => {
    const name = this.user()?.full_name?.split(' ').slice(0, 2).join(' ') ?? '';
    return name;
  });

  readonly scopeLabel = computed(() => {
    const scope = this.overview.value()?.scope;
    const center = (scope?.centers ?? []).find((item) => item.id === scope?.center_id);
    return scope?.center_name ?? center?.name ?? this.instant('dash.allCenters');
  });

  // Student view ------------------------------------------------------------
  readonly meKpis = computed(() => {
    const data = this.me.value();
    return {
      avgScore: data?.season?.season_avg_score ?? null,
      avgSarraj: data?.season?.season_avg_sarraj ?? null,
      attendance: data?.season?.season_attendance_pct ?? null,
      final: data?.final ?? null,
      student: data?.student ?? null,
    };
  });

  readonly studentTrend = computed<ChartData<'line'>>(() => {
    const rows = this.me.value()?.weekly ?? [];
    return {
      labels: rows.map((row) => `W${row.week_id}`),
      datasets: [
        {
          label: this.instant('dash.thumn'),
          data: rows.map((row) => row.total_thumn),
          borderColor: '#00b8a9',
          backgroundColor: 'rgba(0,184,169,.16)',
          fill: true,
          tension: 0.35,
          pointRadius: 0,
          borderWidth: 2,
        },
      ],
    };
  });

  readonly studentAttendance = computed<ChartData<'doughnut'>>(() => {
    const rate = this.meKpis().attendance ?? 0;
    const present = Math.max(0, Math.min(100, rate));
    return {
      labels: [this.instant('dash.present'), this.instant('dash.missed')],
      datasets: [
        {
          data: [present, Math.max(0, 100 - present)],
          backgroundColor: ['#00b8a9', 'rgba(239,68,68,.22)'],
          borderWidth: 0,
        },
      ],
    };
  });

  // Staff view --------------------------------------------------------------
  readonly kpis = computed(() => this.overview.value()?.kpis ?? null);
  readonly groups = computed(() => this.overview.value()?.groups ?? []);
  readonly centers = computed(() => this.overview.value()?.centers ?? []);
  readonly topStudents = computed(() => this.overview.value()?.top_students ?? []);

  readonly weeklyChart = computed<ChartData<'line'>>(() => {
    const rows = this.overview.value()?.trends.weekly ?? [];
    return {
      labels: rows.map((row) => `W${row.week}`),
      datasets: [
        {
          label: this.instant('dash.score'),
          data: rows.map((row) => row.avg_score),
          borderColor: '#00b8a9',
          backgroundColor: 'rgba(0,184,169,.15)',
          fill: true,
          tension: 0.35,
          pointRadius: 0,
          borderWidth: 2,
          yAxisID: 'y',
        },
        {
          label: this.instant('dash.attendance'),
          data: rows.map((row) => row.attendance_pct),
          borderColor: '#8b5cf6',
          backgroundColor: 'transparent',
          tension: 0.35,
          pointRadius: 0,
          borderWidth: 1.5,
          borderDash: [4, 4],
          yAxisID: 'y1',
        },
      ],
    };
  });

  readonly weeklyOptions: ChartOptions<'line'> = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: { legend: { position: 'bottom', labels: { usePointStyle: true, boxWidth: 8 } } },
    scales: {
      x: { grid: { display: false } },
      y: { position: 'left', min: 0, max: 20, grid: { color: 'rgba(255,255,255,.06)' } },
      y1: {
        position: 'right',
        min: 0,
        max: 100,
        grid: { drawOnChartArea: false },
        ticks: { callback: (value) => `${value}%` },
      },
    },
  };

  readonly attendanceChart = computed<ChartData<'doughnut'>>(() => {
    const rows = this.overview.value()?.distributions.attendance ?? [];
    return {
      labels: rows.map((row) => this.instant(`attendance.${row.status}`)),
      datasets: [
        {
          data: rows.map((row) => row.n),
          backgroundColor: rows.map((row) => ATTENDANCE_COLORS[row.status] ?? '#64748b'),
          borderWidth: 0,
        },
      ],
    };
  });

  readonly scoreChart = computed<ChartData<'bar'>>(() => {
    const rows = this.overview.value()?.distributions.scores ?? [];
    return {
      labels: rows.map((row) => this.instant(`dash.band_${row.band}`)),
      datasets: [
        {
          label: this.instant('dash.studentsTitle'),
          data: rows.map((row) => row.n),
          backgroundColor: SCORE_COLORS,
          borderRadius: 8,
          borderSkipped: false,
          maxBarThickness: 38,
        },
      ],
    };
  });

  readonly honorChart = computed<ChartData<'doughnut'>>(() => {
    const honors = this.kpis()?.honors;
    const rows = [
      ['tashji3', honors?.tashji3 ?? 0],
      ['intibah', honors?.intibah ?? 0],
      ['none', honors?.none ?? 0],
    ] as const;
    return {
      labels: rows.map(([key]) => this.instant(`honor.${key}`)),
      datasets: [
        {
          data: rows.map(([, value]) => value),
          backgroundColor: rows.map(([key]) => HONOR_COLORS[key]),
          borderWidth: 0,
        },
      ],
    };
  });

  readonly groupChart = computed<ChartData<'bar'>>(() => {
    const rows = this.groups().slice(0, 8);
    return {
      labels: rows.map((row) => row.name),
      datasets: [
        {
          label: this.instant('dash.avgScore'),
          data: rows.map((row) => row.avg_score),
          backgroundColor: 'rgba(0,184,169,.75)',
          borderRadius: 6,
          maxBarThickness: 28,
        },
      ],
    };
  });

  readonly centerChart = computed<ChartData<'bar'>>(() => {
    const rows = this.centers();
    return {
      labels: rows.map((row) => row.name),
      datasets: [
        {
          label: this.instant('dash.avgScore'),
          data: rows.map((row) => row.avg_score),
          backgroundColor: ['rgba(0,184,169,.8)', 'rgba(139,92,246,.7)'],
          borderRadius: 8,
          maxBarThickness: 36,
        },
      ],
    };
  });

  readonly levelChart = computed<ChartData<'doughnut'>>(() => {
    const rows = this.overview.value()?.distributions.levels ?? [];
    return {
      labels: rows.map((row) => row.label),
      datasets: [
        {
          data: rows.map((row) => row.n),
          backgroundColor: ['#00b8a9', '#0ea5e9', '#8b5cf6', '#f59e0b', '#ef4444', '#64748b'],
          borderWidth: 0,
        },
      ],
    };
  });

  readonly genderChart = computed<ChartData<'doughnut'>>(() => {
    const rows = this.overview.value()?.distributions.genders ?? [];
    return {
      labels: rows.map((row) => this.instant(`gender.${row.gender}`)),
      datasets: [
        {
          data: rows.map((row) => row.n),
          backgroundColor: ['#0ea5e9', '#f472b6', '#64748b'],
          borderWidth: 0,
        },
      ],
    };
  });

  readonly compactBarOptions: ChartOptions<'bar'> = {
    responsive: true,
    maintainAspectRatio: false,
    indexAxis: 'y',
    plugins: { legend: { display: false } },
    scales: {
      x: { min: 0, max: 20, grid: { color: 'rgba(255,255,255,.06)' } },
      y: { grid: { display: false } },
    },
  };

  readonly barOptions: ChartOptions<'bar'> = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: { legend: { display: false } },
    scales: {
      x: { grid: { display: false } },
      y: { min: 0, max: 20, grid: { color: 'rgba(255,255,255,.06)' } },
    },
  };

  readonly scoreOptions: ChartOptions<'bar'> = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: { legend: { display: false } },
    scales: {
      x: { grid: { display: false } },
      y: { beginAtZero: true, grid: { color: 'rgba(255,255,255,.06)' } },
    },
  };

  readonly doughnutOptions: ChartOptions<'doughnut'> = {
    responsive: true,
    maintainAspectRatio: false,
    cutout: '68%',
    plugins: { legend: { position: 'bottom', labels: { usePointStyle: true, boxWidth: 8 } } },
  };

  protected setCenter(value: string): void {
    this.centerId.set(value === '' ? null : Number(value));
  }

  protected instant(key: string): string {
    this.language.current();
    return this.i18n.instant(key);
  }
}

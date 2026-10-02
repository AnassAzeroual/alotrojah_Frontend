import {
  ChangeDetectionStrategy,
  Component,
  computed,
  effect,
  inject,
  resource,
  signal,
} from '@angular/core';
import { toSignal } from '@angular/core/rxjs-interop';
import { TranslatePipe, TranslateService } from '@ngx-translate/core';
import { ChartData } from 'chart.js';
import { firstValueFrom, map } from 'rxjs';
import { CentersService } from '../../core/api/centers.service';
import { CenterDashboard, DashboardService } from '../../core/api/dashboard.service';
import { ReferenceService } from '../../core/api/reference.service';
import { StudentsService } from '../../core/api/students.service';
import { Paginated, Student } from '../../core/api/api-models';
import { LanguageService } from '../../core/i18n/language.service';
import {
  DropdownComponent,
  DropdownOption,
  dropdownNumber,
  dropdownText,
} from '../../shared/ui/dropdown/dropdown.component';
import { EmptyStateComponent } from '../../shared/ui/empty-state/empty-state.component';
import { PaginatorComponent } from '../../shared/ui/paginator/paginator.component';
import { ChartComponent } from '../../shared/ui/chart/chart.component';

const STATUSES = ['active', 'paused', 'graduated', 'left'] as const;

const ATTENDANCE_COLORS: Record<string, string> = {
  present: '#00b8a9',
  late: '#f59e0b',
  absent: '#ef4444',
  excused: '#8b5cf6',
};

@Component({
  selector: 'app-dashboard-page',
  standalone: true,
  imports: [
    TranslatePipe,
    ChartComponent,
    DropdownComponent,
    EmptyStateComponent,
    PaginatorComponent,
  ],
  changeDetection: ChangeDetectionStrategy.OnPush,
  templateUrl: './dashboard.page.html',
  styleUrl: './dashboard.page.scss',
})
export class DashboardPage {
  private readonly dash = inject(DashboardService);
  private readonly centersSvc = inject(CentersService);
  private readonly studentsSvc = inject(StudentsService);
  private readonly ref = inject(ReferenceService);
  private readonly i18n = inject(TranslateService);
  private readonly language = inject(LanguageService);

  readonly centers = toSignal(this.centersSvc.list().pipe(map((p) => p.data)), {
    initialValue: [],
  });
  readonly levels = toSignal(this.ref.levels(), { initialValue: [] });

  private readonly autoCenter = effect(() => {
    if (this.pickedCenter() === null) {
      const first = this.centers()[0];
      if (first) this.pickedCenter.set(first.id);
    }
  });

  private allOption(key: string): DropdownOption {
    this.language.current();
    const t = (k: string): string => this.i18n.instant(k);
    return { value: '', label: `${t(key)}: ${t('list.all')}` };
  }

  readonly statusOptions = computed(() => [
    this.allOption('list.status'),
    ...STATUSES.map((s) => ({ value: s, labelKey: `studentStatus.${s}` })),
  ]);
  readonly levelOptions = computed(() => [
    this.allOption('list.level'),
    ...this.levels().map((l) => ({ value: String(l.id), label: l.name_ar })),
  ]);
  readonly centerOptions = computed(() =>
    this.centers().map((c) => ({ value: String(c.id), label: c.name })),
  );

  private instant(key: string): string {
    this.language.current();
    return this.i18n.instant(key);
  }
  protected readonly num = dropdownNumber;
  protected readonly txt = dropdownText;

  readonly pickedCenter = signal<number | null>(null);
  readonly search = signal('');
  readonly filterLevel = signal('');
  readonly filterStatus = signal('');
  readonly pickedStudent = signal<number | null>(null);
  readonly page = signal(1);

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

  readonly students = resource({
    params: () => ({
      q: this.search(),
      s: this.filterStatus(),
      l: this.filterLevel(),
      c: this.pickedCenter(),
      p: this.page(),
    }),
    loader: ({ params }): Promise<Paginated<Student>> => {
      const query: Record<string, string | number> = { page: params.p };
      if (params.q.trim() !== '') query['q'] = params.q.trim();
      if (params.s !== '') query['status'] = params.s;
      if (params.l !== '') query['level_id'] = params.l;
      if (params.c !== null) query['center_id'] = params.c;
      return firstValueFrom(this.studentsSvc.list(query));
    },
  });

  readonly weekly = resource({
    params: () => ({ st: this.pickedStudent(), s: this.seasonId.value() ?? null }),
    loader: ({ params }) => {
      if (params.st === null || params.s === null) return Promise.resolve([]);
      return firstValueFrom(this.dash.weekly(params.st, params.s));
    },
  });

  readonly kpis = computed(() => {
    const cards = this.centerData.value()?.cards;
    return {
      students: cards?.students ?? null,
      avgScore: cards?.avg_score ?? null,
      avgSarraj: cards?.avg_sarraj ?? null,
      rate: cards?.avg_attendance != null ? Math.round(cards.avg_attendance) : null,
    };
  });

  readonly ringDash = computed(() => {
    const rate = this.kpis().rate ?? 0;
    const C = 2 * Math.PI * 34;
    return `${(rate / 100) * C} ${C}`;
  });

  protected pickCenter(value: number | null): void {
    this.pickedStudent.set(null);
    this.pickedCenter.set(value);
    this.page.set(1);
  }

  protected setSearch(value: string): void {
    this.search.set(value);
    this.page.set(1);
  }

  protected setStatus(value: string): void {
    this.filterStatus.set(value);
    this.page.set(1);
  }

  protected setLevel(value: string): void {
    this.filterLevel.set(value);
    this.page.set(1);
  }

  readonly rows = () => this.students.value()?.data ?? [];
  readonly total = () => this.students.value()?.meta.total ?? 0;

  readonly monthlyChart = computed((): ChartData => {
    const rows = this.weekly.value() ?? [];
    return {
      labels: rows.map((r) => `W${r.week_id}`),
      datasets: [
        {
          label: this.instant('mode.thumn'),
          data: rows.map((r) => Number(r.total_thumn)),
          borderColor: '#00b8a9',
          backgroundColor: 'rgba(0,184,169,.22)',
          fill: true,
          tension: 0.45,
          pointRadius: 0,
        },
      ],
    };
  });

  readonly distChart = computed((): ChartData => {
    const rows = this.centerData.value()?.attendance ?? [];
    return {
      labels: rows.map((r) => this.instant(`attendance.${r.status}`)),
      datasets: [
        {
          data: rows.map((r) => r.n),
          backgroundColor: rows.map((r) => ATTENDANCE_COLORS[r.status] ?? '#64748b'),
        },
      ],
    };
  });

  readonly distLegend = computed(() => {
    const rows = this.centerData.value()?.attendance ?? [];
    const total = rows.reduce((sum, r) => sum + r.n, 0);
    return rows.map((r) => ({
      status: r.status,
      color: ATTENDANCE_COLORS[r.status] ?? '#64748b',
      pct: total > 0 ? Math.round((r.n / total) * 100) : 0,
    }));
  });
}

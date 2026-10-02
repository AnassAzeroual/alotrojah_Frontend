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
import { ChartComponent } from '../../shared/ui/chart/chart.component';

interface DemoStudent {
  id: number;
  name: string;
  surah: string;
  progress: number;
  status: 'active' | 'paused';
  exam: string;
}

const DEMO_STUDENTS: DemoStudent[] = [
  {
    id: 170,
    name: 'اسم على العليون',
    surah: 'البقرة: 5 أجزاء',
    progress: 78,
    status: 'active',
    exam: '2023-06-25',
  },
  {
    id: 182,
    name: 'اسم على الرايل',
    surah: 'آل عمران: 150 آية',
    progress: 64,
    status: 'active',
    exam: '2022-02-26',
  },
  {
    id: 153,
    name: 'محمد الدخالي',
    surah: 'النساء: 150 آية',
    progress: 41,
    status: 'paused',
    exam: '2023-10-11',
  },
  {
    id: 148,
    name: 'يوسف بن أحمد',
    surah: 'المائدة: 3 أجزاء',
    progress: 86,
    status: 'active',
    exam: '2023-08-14',
  },
  {
    id: 131,
    name: 'مريم الزهراء',
    surah: 'الأنعام: 2 جزء',
    progress: 52,
    status: 'active',
    exam: '2023-09-02',
  },
];

@Component({
  selector: 'app-dashboard-page',
  standalone: true,
  imports: [TranslatePipe, ChartComponent],
  changeDetection: ChangeDetectionStrategy.OnPush,
  templateUrl: './dashboard.page.html',
  styleUrl: './dashboard.page.scss',
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
  readonly filterLevel = signal('');
  readonly filterStatus = signal('');
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

  // KPIs with live fallback to demo numbers
  readonly kpis = computed(() => {
    const d = this.centerData.value();
    return {
      students: d?.cards.students ?? 1240,
      studentsDelta: '+12%',
      groups: 52,
      groupsDelta: '+2%',
      sessions: 8,
      sessionsDelta: '+1',
      rate: d?.cards.avg_attendance != null ? Math.round(d.cards.avg_attendance) : 78,
    };
  });

  readonly tableRows = computed<DemoStudent[]>(() => {
    const q = this.search().trim();
    const st = this.filterStatus();
    let rows = DEMO_STUDENTS;
    if (q) rows = rows.filter((r) => r.name.includes(q) || String(r.id).includes(q));
    if (st) rows = rows.filter((r) => r.status === st);
    return rows;
  });

  readonly ringDash = computed(() => {
    const rate = this.kpis().rate;
    const C = 2 * Math.PI * 34;
    return { array: `${(rate / 100) * C} ${C}`, rate };
  });

  readonly monthlyChart = computed((): ChartData => {
    const rows = this.weekly.value() ?? [];
    if (rows.length > 0) {
      return {
        labels: rows.map((r) => `W${r.week_id}`),
        datasets: [
          {
            label: 'thumn',
            data: rows.map((r) => Number(r.total_thumn)),
            borderColor: '#00b8a9',
            backgroundColor: 'rgba(0,184,169,.22)',
            fill: true,
            tension: 0.45,
            pointRadius: 0,
          },
        ],
      };
    }
    return {
      labels: ['الأحد', 'الاثنين', 'الثلاثاء', 'الأربعاء', 'الخميس', 'الجمعة', 'السبت'],
      datasets: [
        {
          label: 'الحفظ',
          data: [420, 620, 480, 720, 560, 980, 760],
          borderColor: '#00b8a9',
          backgroundColor: 'rgba(0,184,169,.25)',
          fill: true,
          tension: 0.5,
          pointRadius: 0,
        },
        {
          label: 'المراجعة',
          data: [300, 420, 560, 380, 820, 640, 1120],
          borderColor: '#8b5cf6',
          backgroundColor: 'rgba(139,92,246,.18)',
          fill: true,
          tension: 0.5,
          pointRadius: 0,
        },
      ],
    };
  });

  readonly distChart = computed((): ChartData => ({
    labels: ['ممتاز', 'جيد', 'يحتاج دعم'],
    datasets: [
      {
        data: [45, 30, 25],
        backgroundColor: ['#00b8a9', '#0e9f6e', '#cbd5e1'],
        borderWidth: 3,
        borderColor: '#fff',
      },
    ],
  }));
}

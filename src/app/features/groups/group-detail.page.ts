import {
  ChangeDetectionStrategy,
  Component,
  computed,
  inject,
  input,
  resource,
  signal,
} from '@angular/core';
import { Router } from '@angular/router';
import { TranslatePipe, TranslateService } from '@ngx-translate/core';
import { ChartData } from 'chart.js';
import { firstValueFrom } from 'rxjs';
import { GroupDetail } from '../../core/api/api-models';
import { GroupsService } from '../../core/api/groups.service';
import { LanguageService } from '../../core/i18n/language.service';
import { ChartComponent } from '../../shared/ui/chart/chart.component';
import { EmptyStateComponent } from '../../shared/ui/empty-state/empty-state.component';

const MODE_COLORS: Record<string, string> = {
  thumn: '#00b8a9',
  surah: '#8b5cf6',
};

const SCORE_BUCKETS: { from: number; to: number | null }[] = [
  { from: 0, to: 5 },
  { from: 5, to: 10 },
  { from: 10, to: 15 },
  { from: 15, to: null },
];

const WEEKDAY_KEYS = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'] as const;

@Component({
  selector: 'app-group-detail-page',
  standalone: true,
  imports: [TranslatePipe, ChartComponent, EmptyStateComponent],
  changeDetection: ChangeDetectionStrategy.OnPush,
  templateUrl: './group-detail.page.html',
  styleUrl: './group-detail.page.scss',
})
export class GroupDetailPage {
  readonly id = input.required<number, string>({ transform: (v: string) => Number(v) });

  protected readonly noLegend = { plugins: { legend: { display: false } } };

  private readonly groupsSvc = inject(GroupsService);
  private readonly i18n = inject(TranslateService);
  private readonly language = inject(LanguageService);
  private readonly router = inject(Router);

  private readonly data = resource({
    params: () => ({ id: this.id() }),
    loader: ({ params }) => firstValueFrom(this.groupsSvc.detail(params.id)),
  });

  readonly loading = () => this.data.isLoading();
  readonly detail = (): GroupDetail | null => this.data.value() ?? null;
  readonly group = () => this.detail()?.group ?? null;
  readonly seasonName = () => this.detail()?.season_name ?? null;
  readonly students = () => this.detail()?.students ?? [];

  readonly expandedId = signal<number | null>(null);

  protected toggleExpand(id: number): void {
    this.expandedId.set(this.expandedId() === id ? null : id);
  }

  protected open(id: number): void {
    void this.router.navigate(['/students', id]);
  }

  protected back(): void {
    void this.router.navigate(['/groups']);
  }

  private instant(key: string): string {
    this.language.current();
    return this.i18n.instant(key);
  }

  protected scheduleKeys(days: string): string[] {
    return days
      .split(',')
      .map((d) => d.trim())
      .filter((d) => (WEEKDAY_KEYS as readonly string[]).includes(d));
  }

  protected waLink(phone: string | null): string | null {
    const digits = phone?.replace(/\D/g, '');
    return digits ? `https://wa.me/${digits}` : null;
  }

  protected fillWidth(pct: number | null): string {
    return `${Math.min(100, Math.max(0, pct ?? 0))}%`;
  }

  protected typeLabelKey(k: string): string {
    return k === 'child' || k === 'adult' ? `grp.type_${k}` : 'grp.unknown';
  }

  // Charts

  readonly trendChart = computed((): ChartData => {
    const rows = this.detail()?.trend ?? [];
    this.language.current();
    return {
      labels: rows.map((r) => `${this.i18n.instant('grp.week')} ${r.week}`),
      datasets: [
        {
          data: rows.map((r) => r.avg_score),
          borderColor: '#00b8a9',
          backgroundColor: 'rgba(0,184,169,.22)',
          fill: true,
          tension: 0.45,
          pointRadius: 0,
        },
      ],
    };
  });

  readonly hasTrend = computed(() => (this.detail()?.trend.length ?? 0) > 0);

  readonly distChart = computed((): ChartData => {
    const students = this.students();
    this.language.current();
    const labels = SCORE_BUCKETS.map((b) =>
      b.to === null ? `${b.from}+` : `${b.from}–${b.to}`,
    );
    const counts = SCORE_BUCKETS.map((b) => {
      const to = b.to;
      if (to === null) {
        return students.filter((s) => s.avg_score !== null && s.avg_score >= b.from).length;
      }
      return students.filter(
        (s) => s.avg_score !== null && s.avg_score >= b.from && s.avg_score < to,
      ).length;
    });
    return {
      labels,
      datasets: [{ data: counts, backgroundColor: ['#00b8a9', '#0e9f6e', '#06b6d4', '#8b5cf6'] }],
    };
  });

  readonly modeChart = computed((): ChartData => {
    const b = this.detail()?.breakdown?.memorization_mode ?? {};
    this.language.current();
    const entries = Object.entries(b);
    return {
      labels: entries.map(([k]) => this.i18n.instant(`mode.${k}`)),
      datasets: [
        {
          data: entries.map(([, n]) => n),
          backgroundColor: entries.map((e, i) => MODE_COLORS[e[0]] ?? ['#00b8a9', '#8b5cf6'][i % 2]),
        },
      ],
    };
  });

  readonly hasMode = computed(
    () => Object.keys(this.detail()?.breakdown?.memorization_mode ?? {}).length > 0,
  );
}

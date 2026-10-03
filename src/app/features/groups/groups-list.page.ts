import {
  ChangeDetectionStrategy,
  Component,
  computed,
  inject,
  resource,
  signal,
} from '@angular/core';
import { Router } from '@angular/router';
import { TranslatePipe, TranslateService } from '@ngx-translate/core';
import { ChartData } from 'chart.js';
import { firstValueFrom } from 'rxjs';
import { GroupStatsRow } from '../../core/api/api-models';
import { GroupsService } from '../../core/api/groups.service';
import { LanguageService } from '../../core/i18n/language.service';
import {
  DropdownComponent,
  DropdownOption,
  dropdownText,
} from '../../shared/ui/dropdown/dropdown.component';
import { EmptyStateComponent } from '../../shared/ui/empty-state/empty-state.component';
import { PaginatorComponent } from '../../shared/ui/paginator/paginator.component';
import { ChartComponent } from '../../shared/ui/chart/chart.component';

const STATUS_COLORS: Record<string, string> = {
  active: '#0e9f6e',
  paused: '#f59e0b',
  graduated: '#06b6d4',
  left: '#64748b',
};

const GENDER_COLORS: Record<string, string> = {
  male: '#06b6d4',
  female: '#8b5cf6',
};

const WEEKDAY_KEYS = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'] as const;
const PER_PAGE = 20;

type SortKey = 'name' | 'teacher' | 'level' | 'students' | 'fill' | 'score' | 'attendance';

function csvCell(v: string | number): string {
  const s = String(v);
  return /[",\n]/.test(s) ? `"${s.replace(/"/g, '""')}"` : s;
}

function numOr(v: number | null | undefined, fallback: number): number {
  return v === null || v === undefined ? fallback : v;
}

@Component({
  selector: 'app-groups-list-page',
  standalone: true,
  imports: [
    TranslatePipe,
    ChartComponent,
    DropdownComponent,
    EmptyStateComponent,
    PaginatorComponent,
  ],
  changeDetection: ChangeDetectionStrategy.OnPush,
  templateUrl: './groups-list.page.html',
  styleUrl: './groups-list.page.scss',
})
export class GroupsListPage {
  private readonly groupsSvc = inject(GroupsService);
  private readonly i18n = inject(TranslateService);
  private readonly language = inject(LanguageService);
  private readonly router = inject(Router);

  private readonly stats = resource({
    params: () => ({}),
    loader: () => firstValueFrom(this.groupsSvc.stats()),
  });

  readonly loading = () => this.stats.isLoading();
  readonly seasonName = () => this.stats.value()?.season_name ?? null;
  readonly rows = () => this.stats.value()?.groups ?? [];

  readonly q = signal('');
  readonly levelId = signal('');
  readonly status = signal('');
  readonly page = signal(1);
  readonly sortKey = signal<SortKey>('name');
  readonly sortDir = signal<1 | -1>(1);
  readonly expandedId = signal<number | null>(null);

  protected readonly txt = dropdownText;
  protected readonly perPage = PER_PAGE;
  protected readonly noLegend = { plugins: { legend: { display: false } } };

  private instant(key: string): string {
    this.language.current();
    return this.i18n.instant(key);
  }

  readonly levelOptions = computed<DropdownOption[]>(() => {
    const seen = new Map<number, string>();
    for (const g of this.rows()) {
      if (g.level) seen.set(g.level.id, g.level.name_ar);
    }
    this.language.current();
    return [
      { value: '', label: `${this.i18n.instant('list.level')}: ${this.i18n.instant('list.all')}` },
      ...[...seen.entries()].map(([id, name]) => ({ value: String(id), label: name })),
    ];
  });

  readonly statusOptions = computed<DropdownOption[]>(() => {
    this.language.current();
    return [
      { value: '', label: this.i18n.instant('grp.all_status') },
      { value: 'active', labelKey: 'grp.active' },
      { value: 'inactive', labelKey: 'grp.inactive' },
    ];
  });

  readonly kpis = computed(() => this.stats.value()?.kpis ?? null);

  private filtered = computed(() => {
    const needle = this.q().trim().toLowerCase();
    const lvl = this.levelId();
    const st = this.status();
    let rows = this.rows();
    if (needle !== '') {
      rows = rows.filter(
        (g) =>
          g.name.toLowerCase().includes(needle) ||
          (g.teacher?.full_name ?? '').toLowerCase().includes(needle),
      );
    }
    if (lvl !== '') rows = rows.filter((g) => g.level?.id === Number(lvl));
    if (st !== '') rows = rows.filter((g) => (st === 'active') === g.is_active);
    return rows;
  });

  readonly total = computed(() => this.filtered().length);

  readonly sorted = computed(() => {
    const key = this.sortKey();
    const dir = this.sortDir();
    const val = (g: GroupStatsRow): string | number => {
      switch (key) {
        case 'name':
          return g.name;
        case 'teacher':
          return g.teacher?.full_name ?? '';
        case 'level':
          return g.level?.name_ar ?? '';
        case 'students':
          return g.students_count;
        case 'fill':
          return numOr(g.fill_pct, -1);
        case 'score':
          return numOr(g.avg_score, -1);
        case 'attendance':
          return numOr(g.attendance_pct, -1);
      }
    };
    return [...this.filtered()].sort((a, b) => {
      const x = val(a);
      const y = val(b);
      if (typeof x === 'number' && typeof y === 'number') return dir * (x - y);
      return dir * String(x).localeCompare(String(y), this.language.current());
    });
  });

  readonly paged = computed(() => {
    const p = this.page();
    return this.sorted().slice((p - 1) * PER_PAGE, p * PER_PAGE);
  });

  protected toggleSort(key: SortKey): void {
    if (this.sortKey() === key) {
      this.sortDir.set(this.sortDir() === 1 ? -1 : 1);
    } else {
      this.sortKey.set(key);
      this.sortDir.set(1);
    }
  }

  protected sortMark(key: SortKey): string {
    if (this.sortKey() !== key) return '';
    return this.sortDir() === 1 ? '▲' : '▼';
  }

  protected toggleExpand(id: number): void {
    this.expandedId.set(this.expandedId() === id ? null : id);
  }

  protected open(id: number): void {
    void this.router.navigate(['/groups', id]);
  }

  protected scheduleKeys(days: string): string[] {
    return days
      .split(',')
      .map((d) => d.trim())
      .filter((d) => (WEEKDAY_KEYS as readonly string[]).includes(d));
  }

  protected chips(
    b: GroupStatsRow['breakdown'],
    dim: 'status' | 'gender' | 'student_type' | 'memorization_mode',
    labelKey: (k: string) => string,
  ): { label: string; n: number }[] {
    if (Array.isArray(b)) return [];
    const rec = b[dim] ?? {};
    this.language.current();
    return Object.entries(rec).map(([key, n]) => ({ label: this.i18n.instant(labelKey(key)), n }));
  }

  protected typeLabelKey(k: string): string {
    return k === 'child' || k === 'adult' ? `grp.type_${k}` : 'grp.unknown';
  }

  protected statusLabelKey(k: string): string {
    return `studentStatus.${k}`;
  }

  // Charts

  readonly fillChart = computed((): ChartData => {
    const rows = this.rows();
    this.language.current();
    return {
      labels: rows.map((g) => g.name),
      datasets: [
        {
          label: this.i18n.instant('grp.students_axis'),
          data: rows.map((g) => g.students_count),
          backgroundColor: '#00b8a9',
        },
        {
          label: this.i18n.instant('grp.capacity_axis'),
          data: rows.map((g) => g.capacity ?? 0),
          backgroundColor: 'rgba(139,92,246,.55)',
        },
      ],
    };
  });

  private doughnut(entries: { key: string; n: number }[], keyOf: (k: string) => string): ChartData {
    return {
      labels: entries.map((e) => this.instant(keyOf(e.key))),
      datasets: [
        {
          data: entries.map((e) => e.n),
          backgroundColor: entries.map(
            (e, i) => STATUS_COLORS[e.key] ?? GENDER_COLORS[e.key] ?? ['#00b8a9', '#8b5cf6', '#0e9f6e', '#06b6d4', '#f59e0b', '#64748b'][i % 6],
          ),
        },
      ],
    };
  }

  readonly hasStatus = computed(
    () => Object.keys(this.stats.value()?.breakdown?.status ?? {}).length > 0,
  );
  readonly hasGender = computed(
    () => Object.keys(this.stats.value()?.breakdown?.gender ?? {}).length > 0,
  );
  readonly hasScores = computed(() => this.rows().some((g) => g.avg_score !== null));
  readonly hasAtt = computed(() => this.rows().some((g) => g.attendance_pct !== null));

  readonly statusChart = computed((): ChartData => {
    const b = this.stats.value()?.breakdown?.status ?? {};
    return this.doughnut(
      Object.entries(b).map(([key, n]) => ({ key, n })),
      (k) => `studentStatus.${k}`,
    );
  });

  readonly genderChart = computed((): ChartData => {
    const b = this.stats.value()?.breakdown?.gender ?? {};
    return this.doughnut(
      Object.entries(b).map(([key, n]) => ({ key, n })),
      (k) => `gender.${k}`,
    );
  });

  readonly scoreChart = computed((): ChartData => {
    const rows = this.rows().filter((g) => g.avg_score !== null);
    return {
      labels: rows.map((g) => g.name),
      datasets: [{ data: rows.map((g) => numOr(g.avg_score, 0)), backgroundColor: '#00b8a9' }],
    };
  });

  readonly attChart = computed((): ChartData => {
    const rows = this.rows().filter((g) => g.attendance_pct !== null);
    return {
      labels: rows.map((g) => g.name),
      datasets: [{ data: rows.map((g) => numOr(g.attendance_pct, 0)), backgroundColor: '#8b5cf6' }],
    };
  });

  // CSV export

  protected exportCsv(): void {
    this.language.current();
    const t = (k: string): string => this.i18n.instant(k);
    const header = [
      t('grp.col_name'),
      t('grp.col_teacher'),
      t('grp.col_level'),
      t('grp.col_students'),
      t('grp.col_capacity'),
      t('grp.col_fill'),
      t('grp.col_score'),
      t('grp.col_att'),
      t('grp.col_thumn'),
      t('grp.col_status'),
    ];
    const lines = this.sorted().map((g) => [
      g.name,
      g.teacher?.full_name ?? '',
      g.level?.name_ar ?? '',
      g.students_count,
      g.capacity ?? '',
      g.fill_pct ?? '',
      g.avg_score ?? '',
      g.attendance_pct ?? '',
      g.thumn_total,
      t(g.is_active ? 'grp.active' : 'grp.inactive'),
    ]);
    // \uFEFF BOM keeps Excel from mangling Arabic headers.
    const csv = '﻿' + [header, ...lines].map((cols) => cols.map(csvCell).join(',')).join('\r\n');
    const url = URL.createObjectURL(new Blob([csv], { type: 'text/csv;charset=utf-8' }));
    const a = document.createElement('a');
    a.href = url;
    a.download = 'groups.csv';
    a.click();
    URL.revokeObjectURL(url);
  }
}

import {
  ChangeDetectionStrategy,
  Component,
  computed,
  inject,
  input,
  resource,
  signal,
} from '@angular/core';
import { toSignal } from '@angular/core/rxjs-interop';
import { Router } from '@angular/router';
import { TranslatePipe, TranslateService } from '@ngx-translate/core';
import { ChartData } from 'chart.js';
import { firstValueFrom } from 'rxjs';
import { GroupDetail } from '../../core/api/api-models';
import { GroupsService } from '../../core/api/groups.service';
import { ReferenceService, Level } from '../../core/api/reference.service';
import { UsersService } from '../../core/api/users.service';
import { AuthService } from '../../core/auth/auth.service';
import { LanguageService } from '../../core/i18n/language.service';
import { ChartComponent } from '../../shared/ui/chart/chart.component';
import {
  DropdownComponent,
  dropdownNumber,
  DropdownOption,
} from '../../shared/ui/dropdown/dropdown.component';
import { EmptyStateComponent } from '../../shared/ui/empty-state/empty-state.component';
import { SpinnerComponent } from '../../shared/ui/spinner/spinner.component';

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
  imports: [
    TranslatePipe,
    ChartComponent,
    DropdownComponent,
    EmptyStateComponent,
    SpinnerComponent,
  ],
  changeDetection: ChangeDetectionStrategy.OnPush,
  templateUrl: './group-detail.page.html',
  styleUrl: './group-detail.page.scss',
})
export class GroupDetailPage {
  readonly id = input.required<number, string>({ transform: (v: string) => Number(v) });

  protected readonly noLegend = { plugins: { legend: { display: false } } };
  protected readonly num = dropdownNumber;
  protected readonly weekdayKeys = WEEKDAY_KEYS;

  private readonly groupsSvc = inject(GroupsService);
  private readonly i18n = inject(TranslateService);
  private readonly language = inject(LanguageService);
  private readonly router = inject(Router);
  private readonly auth = inject(AuthService);
  private readonly refSvc = inject(ReferenceService);
  private readonly usersSvc = inject(UsersService);

  private readonly tick = signal(0);

  private readonly data = resource({
    params: () => ({ id: this.id(), t: this.tick() }),
    loader: ({ params }) => firstValueFrom(this.groupsSvc.detail(params.id)),
  });

  readonly loading = () => this.data.isLoading();
  readonly detail = (): GroupDetail | null => this.data.value() ?? null;
  readonly group = () => this.detail()?.group ?? null;
  readonly seasonName = () => this.detail()?.season_name ?? null;
  readonly students = () => this.detail()?.students ?? [];

  readonly expandedId = signal<number | null>(null);

  // Inline edit (GroupPolicy: admin/supervisor, or the group's own teacher)

  protected readonly canEdit = computed(() => {
    const role = this.auth.role();
    const g = this.group();
    if (!g || !role) return false;
    if (role === 'admin' || role === 'supervisor') return true;
    return role === 'teacher' && g.teacher?.id === this.auth.currentUser()?.id;
  });

  /** Teacher reassignment needs the users directory, which only admin/supervisor may list. */
  protected readonly canPickTeacher = computed(() =>
    ['admin', 'supervisor'].includes(this.auth.role() ?? ''),
  );

  readonly editing = signal(false);
  readonly saving = signal(false);
  readonly saveFailed = signal(false);

  protected readonly editName = signal('');
  protected readonly editLevelId = signal<number | null>(null);
  protected readonly editTeacherId = signal<number | null>(null);
  protected readonly editCapacity = signal<number | null>(null);
  protected readonly editDays = signal<string[]>([]);
  protected readonly editActive = signal(true);

  protected readonly levels = toSignal(this.refSvc.levels(), { initialValue: [] as Level[] });
  protected readonly levelOptions = computed(() =>
    this.levels().map((l) => ({ value: l.id, label: l.name_ar })),
  );

  private readonly teachersRes = resource({
    params: () => ({ centerId: this.group()?.center_id ?? null, allow: this.canPickTeacher() }),
    loader: ({ params }) => {
      if (params.centerId === null || !params.allow) return Promise.resolve(null);
      return firstValueFrom(this.usersSvc.list({ role: 'teacher', center_id: params.centerId }));
    },
  });

  protected readonly teacherOptions = computed<DropdownOption[]>(() => {
    const opts: DropdownOption[] = (this.teachersRes.value()?.data ?? []).map((u) => ({
      value: u.id,
      label: u.full_name,
    }));
    return [{ value: '', labelKey: 'grp.no_teacher' }, ...opts];
  });

  protected startEdit(): void {
    const g = this.group();
    if (!g) return;
    this.editName.set(g.name);
    this.editLevelId.set(g.level?.id ?? null);
    this.editTeacherId.set(g.teacher?.id ?? null);
    this.editCapacity.set(g.capacity);
    this.editDays.set(this.scheduleKeys(g.schedule_days));
    this.editActive.set(g.is_active);
    this.saveFailed.set(false);
    this.editing.set(true);
  }

  protected cancelEdit(): void {
    this.editing.set(false);
  }

  protected toggleDay(day: string): void {
    this.editDays.update((d) => (d.includes(day) ? d.filter((x) => x !== day) : [...d, day]));
  }

  protected onCapacityInput(v: string): void {
    if (v.trim() === '') {
      this.editCapacity.set(null);
      return;
    }
    const n = Number(v);
    this.editCapacity.set(Number.isNaN(n) ? null : n);
  }

  protected saveEdit(): void {
    const g = this.group();
    const name = this.editName().trim();
    const levelId = this.editLevelId();
    if (!g || !name || levelId === null || this.saving()) return;
    this.saving.set(true);
    this.saveFailed.set(false);
    this.groupsSvc
      .update(g.id, {
        name,
        level_id: levelId,
        ...(this.canPickTeacher() ? { teacher_id: this.editTeacherId() } : {}),
        capacity: this.editCapacity(),
        schedule_days: this.editDays().join(','),
        is_active: this.editActive(),
      })
      .subscribe({
        next: () => {
          this.saving.set(false);
          this.editing.set(false);
          this.tick.update((n) => n + 1);
        },
        error: () => {
          this.saving.set(false);
          this.saveFailed.set(true);
        },
      });
  }

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
    const labels = SCORE_BUCKETS.map((b) => (b.to === null ? `${b.from}+` : `${b.from}–${b.to}`));
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
          backgroundColor: entries.map(
            (e, i) => MODE_COLORS[e[0]] ?? ['#00b8a9', '#8b5cf6'][i % 2],
          ),
        },
      ],
    };
  });

  readonly hasMode = computed(
    () => Object.keys(this.detail()?.breakdown?.memorization_mode ?? {}).length > 0,
  );
}

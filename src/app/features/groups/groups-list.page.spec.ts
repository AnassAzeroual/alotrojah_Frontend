import { provideHttpClient } from '@angular/common/http';
import { HttpTestingController, provideHttpClientTesting } from '@angular/common/http/testing';
import { TestBed } from '@angular/core/testing';
import { provideRouter, Router } from '@angular/router';
import {
  provideTranslateLoader,
  provideTranslateService,
  TranslateNoOpLoader,
} from '@ngx-translate/core';
import { By } from '@angular/platform-browser';
import { vi } from 'vitest';
import { GroupStats, GroupStatsRow } from '../../core/api/api-models';
import { ChartComponent } from '../../shared/ui/chart/chart.component';
import { GroupsListPage } from './groups-list.page';

// jsdom has no canvas 2d context; swap Chart.js for an inert double so
// <app-chart> renders without painting.
vi.mock('chart.js', () => {
  class InertChart {
    static register(): void {}
    update(): void {}
    destroy(): void {}
  }
  const fake = class {};
  return {
    Chart: InertChart,
    LineController: fake,
    BarController: fake,
    DoughnutController: fake,
    LineElement: fake,
    PointElement: fake,
    BarElement: fake,
    ArcElement: fake,
    CategoryScale: fake,
    LinearScale: fake,
    Filler: fake,
    Legend: fake,
    Tooltip: fake,
  };
});

const NOOR: GroupStatsRow = {
  id: 1,
  name: 'حلقة النور — L1',
  center_id: 1,
  level: { id: 1, name_ar: 'المستوى الأول' },
  teacher: { id: 3, full_name: 'ياسين العلوي', phone: '0611223344', teacher_type: 'hifz' },
  academic_year: '2025/2026',
  schedule_days: 'Sat,Mon',
  is_active: true,
  capacity: 20,
  students_count: 9,
  fill_pct: 45,
  avg_score: 16.5,
  attendance_pct: 96,
  thumn_total: 12,
  breakdown: { status: { active: 9 }, student_type: { child: 9 } },
};

// Teacher-less, paused, no metrics, and breakdown serialised as [] by PHP.
const FURQAN: GroupStatsRow = {
  id: 2,
  name: 'حلقة الفرقان — L2',
  center_id: 1,
  level: { id: 2, name_ar: 'المستوى الثاني' },
  teacher: null,
  academic_year: null,
  schedule_days: '',
  is_active: false,
  capacity: null,
  students_count: 8,
  fill_pct: null,
  avg_score: null,
  attendance_pct: null,
  thumn_total: 0,
  breakdown: [],
};

const STATS: GroupStats = {
  season: { id: 3 },
  season_name: '2025/2026',
  kpis: { groups: 2, students: 17, avg_score: 14.54, attendance_pct: 95.2, fill_pct: 7.4 },
  breakdown: { status: { active: 1, inactive: 1 }, gender: { male: 9, female: 8 } },
  groups: [NOOR, FURQAN],
};

describe('GroupsListPage', () => {
  let fixture!: ReturnType<typeof TestBed.createComponent<GroupsListPage>>;
  let page!: GroupsListPage;
  let http!: HttpTestingController;
  let el!: HTMLElement;
  let navigate!: ReturnType<typeof vi.spyOn>;

  const flushStats = (): void => {
    const req = http.expectOne((r) => r.url.endsWith('/groups/stats') && r.method === 'GET');
    req.flush({ success: true, message: null, data: STATS });
  };

  const chart = (label: string): ChartComponent =>
    fixture.debugElement
      .queryAll(By.directive(ChartComponent))
      .map((d) => d.componentInstance)
      .find((c) => c.label() === label)!;

  const rowNames = (): (string | null)[] =>
    [...el.querySelectorAll('tbody tr.row-link .cell-name strong')].map((s) => s.textContent);

  // Default order is name sort: 'الفرقان' precedes 'النور' — pick rows by content.
  const rowOf = (name: string): HTMLElement =>
    [...el.querySelectorAll<HTMLElement>('tbody tr.row-link')].find((r) =>
      r.textContent!.includes(name),
    )!;

  beforeEach(async () => {
    localStorage.clear();
    await TestBed.configureTestingModule({
      imports: [GroupsListPage],
      providers: [
        provideHttpClient(),
        provideHttpClientTesting(),
        provideRouter([]),
        provideTranslateService({
          loader: provideTranslateLoader(() => new TranslateNoOpLoader()),
        }),
      ],
    }).compileComponents();
    http = TestBed.inject(HttpTestingController);
    navigate = vi.spyOn(TestBed.inject(Router), 'navigate');
    fixture = TestBed.createComponent(GroupsListPage);
    page = fixture.componentInstance;
    el = fixture.nativeElement;
    fixture.detectChanges();
    flushStats();
    await fixture.whenStable();
    fixture.detectChanges();
  });

  afterEach(() => http.verify());

  it('loads /groups/stats and renders KPIs, rows, and all five charts', () => {
    expect(el.querySelectorAll('.kpi').length).toBe(5);
    const kpiValues = [...el.querySelectorAll('.kpi-txt strong')].map((s) => s.textContent);
    expect(kpiValues).toContain('2');
    expect(kpiValues).toContain('17');

    expect(el.querySelectorAll('tbody tr.row-link').length).toBe(2);
    expect(el.textContent).toContain('حلقة النور — L1');
    expect(el.textContent).toContain('ياسين العلوي');
    // teacher-less row renders the em-dash fallback
    expect(el.textContent).toContain('—');

    expect(chart('fill')).toBeDefined();
    expect(chart('status')).toBeDefined();
    expect(chart('gender')).toBeDefined();
    expect(chart('score')).toBeDefined();
    expect(chart('attendance')).toBeDefined();
  });

  it('maps stats rows into the chart configs', () => {
    const fill = chart('fill').data();
    expect(fill.labels).toEqual(['حلقة النور — L1', 'حلقة الفرقان — L2']);
    expect(fill.datasets[0].data).toEqual([9, 8]);
    expect(fill.datasets[1].data).toEqual([20, 0]);

    const status = chart('status').data();
    expect(status.labels).toEqual(['studentStatus.active', 'studentStatus.inactive']);

    const gender = chart('gender').data();
    expect(gender.labels).toEqual(['gender.male', 'gender.female']);
  });

  it('drops metric-less rows from the score and attendance charts', () => {
    const score = chart('score').data();
    expect(score.labels).toEqual(['حلقة النور — L1']);
    expect(score.datasets[0].data).toEqual([16.5]);

    const att = chart('attendance').data();
    expect(att.labels).toEqual(['حلقة النور — L1']);
    expect(att.datasets[0].data).toEqual([96]);
  });

  it('hides the legend on the single-series charts', () => {
    const legendDisplay = (c: ChartComponent): boolean =>
      (c.options() as { plugins: { legend: { display: boolean } } }).plugins.legend.display;
    expect(legendDisplay(chart('score'))).toBe(false);
    expect(legendDisplay(chart('attendance'))).toBe(false);
    // the doughnuts keep their data-driven legends
    expect(chart('status').options()).toBeUndefined();
  });

  it('narrows rows through the search box and resets to page 1', () => {
    const input = el.querySelector<HTMLInputElement>('.toolbar input[type="search"]')!;
    input.value = 'الفرقان';
    input.dispatchEvent(new Event('change'));
    fixture.detectChanges();

    expect(page.q()).toBe('الفرقان');
    expect(page.page()).toBe(1);
    expect(rowNames()).toEqual(['حلقة الفرقان — L2']);
  });

  it('filters by status and level signals', () => {
    page.status.set('active');
    fixture.detectChanges();
    expect(rowNames()).toEqual(['حلقة النور — L1']);

    page.status.set('');
    page.levelId.set('2');
    fixture.detectChanges();
    expect(rowNames()).toEqual(['حلقة الفرقان — L2']);
  });

  it('sorts by student count when the column header is clicked, flipping on a second click', () => {
    const th = [...el.querySelectorAll<HTMLButtonElement>('.th-sort')].find((b) =>
      b.textContent!.includes('grp.col_students'),
    )!;

    th.click();
    fixture.detectChanges();
    expect(rowNames()).toEqual(['حلقة الفرقان — L2', 'حلقة النور — L1']);
    expect(th.textContent).toContain('▲');

    th.click();
    fixture.detectChanges();
    expect(rowNames()).toEqual(['حلقة النور — L1', 'حلقة الفرقان — L2']);
    expect(th.textContent).toContain('▼');
  });

  it('expands a row with schedule days and breakdown chips', () => {
    const expander = rowOf('حلقة النور').querySelector<HTMLButtonElement>('.expander')!;
    expander.click();
    fixture.detectChanges();

    const detailRow = el.querySelector('tr.detail-row')!;
    expect(expander.getAttribute('aria-label')).toBe('grp.collapse');
    expect(detailRow.querySelectorAll('.day-chip').length).toBe(2);
    expect(detailRow.querySelectorAll('.chip').length).toBe(2);
    expect(detailRow.textContent).toContain('teacher_type.hifz');
    expect(detailRow.textContent).toContain('0611223344');

    // PHP serialises an empty breakdown as [] — the row expands without chips
    rowOf('حلقة الفرقان').querySelector<HTMLButtonElement>('.expander')!.click();
    fixture.detectChanges();
    const rows = el.querySelectorAll('tr.detail-row');
    expect(rows.length).toBe(1);
    expect(rows[0].querySelectorAll('.chip').length).toBe(0);
    expect(rows[0].querySelectorAll('.day-chip').length).toBe(0);
  });

  it('navigates to the detail page when a row is activated', () => {
    rowOf('حلقة النور').click();
    expect(navigate).toHaveBeenCalledWith(['/groups', 1]);
  });

  it('exports the visible rows as a CSV download', async () => {
    const create = vi.fn().mockReturnValue('blob:mock');
    (URL as unknown as { createObjectURL: unknown }).createObjectURL = create;
    (URL as unknown as { revokeObjectURL: unknown }).revokeObjectURL = vi.fn();

    const btn = [...el.querySelectorAll<HTMLButtonElement>('button')].find((b) =>
      b.textContent!.includes('grp.export_csv'),
    )!;
    btn.click();

    expect(create).toHaveBeenCalledTimes(1);
    const text = await (create.mock.calls[0][0] as Blob).text();
    expect(text).toContain('grp.col_name');
    expect(text).toContain('حلقة النور — L1');
    expect(text).toContain('ياسين العلوي');
  });
});

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
import { GroupDetail } from '../../core/api/api-models';
import { ChartComponent } from '../../shared/ui/chart/chart.component';
import { GroupDetailPage } from './group-detail.page';

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

const DETAIL: GroupDetail = {
  season_name: '2025/2026',
  group: {
    id: 5,
    name: 'حلقة النور — L1',
    center_id: 1,
    level: { id: 1, name_ar: 'المستوى الأول' },
    teacher: { id: 3, full_name: 'ياسين العلوي', phone: '06 55 00 00 10', teacher_type: 'hifz' },
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
  },
  breakdown: { memorization_mode: { thumn: 6, surah: 3 } },
  trend: [
    { week: 1, avg_score: 10 },
    { week: 2, avg_score: 14 },
  ],
  students: [
    {
      id: 11,
      full_name: 'أحمد بن يوسف',
      gender: 'male',
      status: 'active',
      student_type: 'child',
      memorization_mode: 'thumn',
      start_hizb: 3,
      birth_date: '2012-04-01',
      enrollment_date: '2025-09-15',
      level_id: 1,
      notes: null,
      avg_score: 12.5,
      attendance_pct: 90,
      thumn_total: 4,
    },
    {
      id: 12,
      full_name: 'خديجة العلوي',
      gender: 'female',
      status: 'paused',
      student_type: null,
      memorization_mode: 'surah',
      start_hizb: null,
      birth_date: null,
      enrollment_date: null,
      level_id: 1,
      notes: 'تحتاج متابعة',
      avg_score: 5,
      attendance_pct: null,
      thumn_total: 1,
    },
    {
      id: 13,
      full_name: 'يوسف الأمين',
      gender: 'male',
      status: 'active',
      student_type: 'child',
      memorization_mode: 'thumn',
      start_hizb: 5,
      birth_date: null,
      enrollment_date: null,
      level_id: 1,
      notes: null,
      avg_score: 15,
      attendance_pct: 100,
      thumn_total: 2,
    },
    {
      id: 14,
      full_name: 'مريم الفاسي',
      gender: null,
      status: 'active',
      student_type: 'child',
      memorization_mode: 'thumn',
      start_hizb: null,
      birth_date: null,
      enrollment_date: null,
      level_id: null,
      notes: null,
      avg_score: null,
      attendance_pct: null,
      thumn_total: 0,
    },
  ],
};

describe('GroupDetailPage', () => {
  let fixture!: ReturnType<typeof TestBed.createComponent<GroupDetailPage>>;
  let page!: GroupDetailPage;
  let http!: HttpTestingController;
  let el!: HTMLElement;
  let navigate!: ReturnType<typeof vi.spyOn>;

  const flushDetail = (): void => {
    const req = http.expectOne((r) => r.url.endsWith('/groups/5/detail') && r.method === 'GET');
    req.flush({ success: true, message: null, data: DETAIL });
  };

  const chart = (label: string): ChartComponent =>
    fixture.debugElement
      .queryAll(By.directive(ChartComponent))
      .map((d) => d.componentInstance)
      .find((c) => c.label() === label)!;

  beforeEach(async () => {
    localStorage.clear();
    await TestBed.configureTestingModule({
      imports: [GroupDetailPage],
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
    fixture = TestBed.createComponent(GroupDetailPage);
    fixture.componentRef.setInput('id', '5');
    page = fixture.componentInstance;
    el = fixture.nativeElement;
    fixture.detectChanges();
    flushDetail();
    await fixture.whenStable();
    fixture.detectChanges();
  });

  afterEach(() => http.verify());

  it('requests the detail for the route id and renders header, teacher card, and students', () => {
    expect(el.querySelector('h1')!.textContent).toContain('حلقة النور — L1');
    expect(el.querySelector('h1')!.textContent).toContain('grp.active');

    const teacher = el.querySelector('.teacher-card')!;
    expect(teacher.textContent).toContain('ياسين العلوي');
    expect(teacher.textContent).toContain('teacher_type.hifz');

    const wa = el.querySelector<HTMLAnchorElement>('.wa-btn')!;
    expect(wa.getAttribute('href')).toBe('https://wa.me/0655000010');
    expect(wa.textContent).toContain('06 55 00 00 10');

    expect(el.querySelectorAll('.day-chip').length).toBe(2);
    expect(el.querySelector<HTMLElement>('.cap-bar i')!.style.inlineSize).toBe('45%');

    expect(el.querySelectorAll('.table-wrap tbody tr.row-link').length).toBe(4);
    expect(el.textContent).toContain('أحمد بن يوسف');
  });

  it('maps the weekly trend into labelled points without a legend', () => {
    const trend = chart('trend').data();
    expect(trend.labels).toEqual(['grp.week 1', 'grp.week 2']);
    expect(trend.datasets[0].data).toEqual([10, 14]);
    expect(
      (chart('trend').options() as { plugins: { legend: { display: boolean } } }).plugins.legend
        .display,
    ).toBe(false);
  });

  it('buckets student scores into the distribution chart', () => {
    const dist = chart('dist').data();
    expect(dist.labels).toEqual(['0–5', '5–10', '10–15', '15+']);
    // 12.5 → bucket 3, 5 → bucket 2, 15 → bucket 4, null → skipped
    expect(dist.datasets[0].data).toEqual([0, 1, 1, 1]);
  });

  it('maps the memorization-mode breakdown into a doughnut', () => {
    const mode = chart('mode').data();
    expect(mode.labels).toEqual(['mode.thumn', 'mode.surah']);
    expect(mode.datasets[0].data).toEqual([6, 3]);
  });

  it('navigates to a student when a row is activated', () => {
    el.querySelector<HTMLElement>('.table-wrap tbody tr.row-link')!.click();
    expect(navigate).toHaveBeenCalledWith(['/students', 11]);
  });

  it('returns to the overview from the back button', () => {
    el.querySelector<HTMLButtonElement>('.back-btn')!.click();
    expect(navigate).toHaveBeenCalledWith(['/groups']);
  });

  it('expands a student row with its extra fields', () => {
    el.querySelector<HTMLButtonElement>('.table-wrap tbody .expander')!.click();
    fixture.detectChanges();

    const detailRow = el.querySelector('tr.detail-row')!;
    expect(detailRow.textContent).toContain('gender.male');
    expect(detailRow.textContent).toContain('mode.thumn');
    expect(detailRow.textContent).toContain('3');
    expect(detailRow.textContent).toContain('2012-04-01');
    expect(detailRow.textContent).toContain('2025-09-15');
  });
});

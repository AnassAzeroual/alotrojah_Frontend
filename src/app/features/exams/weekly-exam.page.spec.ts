import { provideHttpClient } from '@angular/common/http';
import { HttpTestingController, provideHttpClientTesting } from '@angular/common/http/testing';
import { TestBed } from '@angular/core/testing';
import { provideRouter } from '@angular/router';
import {
  provideTranslateLoader,
  provideTranslateService,
  TranslateNoOpLoader,
} from '@ngx-translate/core';
import { By } from '@angular/platform-browser';
import { DropdownComponent } from '../../shared/ui/dropdown/dropdown.component';
import { WeeklyExamPage } from './weekly-exam.page';

const GROUPS = [{ id: 5, name: 'G5' }];
const SURAHS = [
  { id: 1, name_ar: 'الفاتحة', ayahs_count: 7 },
  { id: 112, name_ar: 'الإخلاص', ayahs_count: 4 },
];
const TEMPLATE = {
  season_id: 1,
  modules: [
    { code: 'hifz', name_ar: 'الحفظ', max_points: 14 },
    { code: 'mowathaba', name_ar: 'المواظبة', max_points: 4 },
    { code: 'tajwid', name_ar: 'التجويد', max_points: 2 },
  ],
  pupils: [
    { id: 11, full_name: 'Thumn Pupil', memorization_mode: 'thumn' },
    { id: 12, full_name: 'Surah Pupil', memorization_mode: 'surah' },
  ],
};

const envelope = (data: unknown) => ({ success: true, message: null, data });

describe('WeeklyExamPage', () => {
  let fixture!: ReturnType<typeof TestBed.createComponent<WeeklyExamPage>>;
  let page!: WeeklyExamPage;
  let http!: HttpTestingController;
  let el!: HTMLElement;

  const openList = (testId: string): void => {
    const dd = fixture.debugElement
      .queryAll(By.directive(DropdownComponent))
      .map((d) => d.componentInstance)
      .find((c) => c.testId() === testId)!;
    dd.open.set(true);
    fixture.detectChanges();
  };

  const pickText = (text: string): void => {
    const opt = [...el.querySelectorAll<HTMLButtonElement>('.dd.open .dd-list button')].find((b) =>
      b.textContent!.includes(text),
    )!;
    opt.click();
    fixture.detectChanges();
  };

  const fill = (testId: string, v: string): void => {
    const input = el.querySelector<HTMLInputElement>(`[data-testid="${testId}"]`)!;
    input.value = v;
    input.dispatchEvent(new Event('input'));
    fixture.detectChanges();
  };

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [WeeklyExamPage],
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
    fixture = TestBed.createComponent(WeeklyExamPage);
    page = fixture.componentInstance;
    el = fixture.nativeElement;
    fixture.detectChanges();
    http
      .expectOne((r) => r.url.endsWith('/groups') && r.method === 'GET')
      .flush(envelope({ data: GROUPS, meta: { current_page: 1, total: 1, per_page: 20 } }));
    http
      .expectOne((r) => r.url.endsWith('/reference/surahs') && r.method === 'GET')
      .flush(envelope(SURAHS));
    await fixture.whenStable();
    fixture.detectChanges();
  });

  afterEach(() => http.verify());

  const pickGroup = async (): Promise<void> => {
    openList('weekly-group');
    pickText('G5');
    const req = http.expectOne(
      (r) => r.url.endsWith('/exams/weekly-template') && r.method === 'GET',
    );
    expect(req.request.params.get('group_id')).toBe('5');
    req.flush(envelope(TEMPLATE));
    await fixture.whenStable();
    fixture.detectChanges();
  };

  it('seeds one row per pupil with mode-correct portion inputs', async () => {
    expect(page.blockers()).toEqual(['weeklyExam.need_group']);
    expect(el.querySelector('[data-testid="weekly-blockers"]')).not.toBeNull();

    await pickGroup();

    expect(page.rows().length).toBe(2);
    // thumn row: hizb+thumn inputs, no surah picker.
    expect(el.querySelector('[data-testid="weekly-hizb-11"]')).not.toBeNull();
    expect(el.querySelector('[data-testid="weekly-surah-11"]')).toBeNull();
    // surah row: surah picker + ayah inputs, no hizb input.
    expect(el.querySelector('[data-testid="weekly-surah-12"]')).not.toBeNull();
    expect(el.querySelector('[data-testid="weekly-hizb-12"]')).toBeNull();
    // module score inputs ride the template columns.
    expect(el.querySelector('[data-testid="weekly-score-11-hifz"]')).not.toBeNull();
    expect(page.blockers()).toEqual(['weeklyExam.need_portion']);
  });

  it('posts the batch shape and shows the success banner', async () => {
    await pickGroup();

    fill('weekly-hizb-11', '25');
    fill('weekly-thumn-11', '4');
    fill('weekly-score-11-hifz', '14');
    fill('weekly-score-11-mowathaba', '4');
    fill('weekly-score-11-tajwid', '2');
    openList('weekly-surah-12');
    pickText('الإخلاص');
    fill('weekly-ayah-from-12', '1');
    fill('weekly-ayah-to-12', '4');
    fill('weekly-score-12-hifz', '12');
    fill('weekly-score-12-mowathaba', '3');
    fill('weekly-score-12-tajwid', '2');

    expect(page.canSave()).toBe(true);
    el.querySelector<HTMLButtonElement>('[data-testid="weekly-save"]')!.click();
    fixture.detectChanges();

    const req = http.expectOne((r) => r.url.endsWith('/exams/weekly-batch') && r.method === 'POST');
    expect(req.request.body.group_id).toBe(5);
    expect(req.request.body.rows.length).toBe(2);
    expect(req.request.body.rows[0]).toEqual({
      student_id: 11,
      portion: { hizb: 25, thumn: 4 },
      scores: { hifz: 14, mowathaba: 4, tajwid: 2 },
    });
    expect(req.request.body.rows[1].portion).toEqual({ surah: 112, ayah_from: 1, ayah_to: 4 });
    req.flush(envelope({ created: 2, exam_ids: [90, 91] }));
    fixture.detectChanges();

    expect(page.savedCount()).toBe(2);
    expect(el.querySelector('[data-testid="weekly-success"]')).not.toBeNull();
  });

  it('posts only portion-complete rows so a subset can be examined', async () => {
    await pickGroup();

    // Only the thumn row gets a portion — the surah row stays untouched.
    fill('weekly-hizb-11', '25');
    fill('weekly-thumn-11', '4');

    expect(page.canSave()).toBe(true);
    el.querySelector<HTMLButtonElement>('[data-testid="weekly-save"]')!.click();
    fixture.detectChanges();

    const req = http.expectOne((r) => r.url.endsWith('/exams/weekly-batch') && r.method === 'POST');
    expect(req.request.body.rows.length).toBe(1);
    expect(req.request.body.rows[0].student_id).toBe(11);
    req.flush(envelope({ created: 1, exam_ids: [90] }));
    fixture.detectChanges();

    expect(page.savedCount()).toBe(1);
  });
});

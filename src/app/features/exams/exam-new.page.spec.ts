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
import { ExamNewPage } from './exam-new.page';

describe('ExamNewPage blockers', () => {
  let fixture!: ReturnType<typeof TestBed.createComponent<ExamNewPage>>;
  let page!: ExamNewPage;
  let http!: HttpTestingController;
  let el!: HTMLElement;

  const GROUPS = [
    { id: 5, name: 'G5' },
    { id: 6, name: 'G6' },
  ];
  const PUPILS = [
    { id: 11, full_name: 'Pupil A' },
    { id: 12, full_name: 'Pupil B' },
  ];

  const flushGroups = (body: unknown[] = GROUPS): void => {
    http
      .expectOne((r) => r.url.endsWith('/groups') && r.method === 'GET')
      .flush({
        success: true,
        message: null,
        data: { data: body, meta: { current_page: 1, total: body.length, per_page: 20 } },
      });
  };

  const flushPupils = (body: unknown[] = PUPILS): void => {
    http
      .expectOne((r) => r.url.endsWith('/students') && r.method === 'GET')
      .flush({
        success: true,
        message: null,
        data: { data: body, meta: { current_page: 1, total: body.length, per_page: 100 } },
      });
  };

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

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ExamNewPage],
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
    fixture = TestBed.createComponent(ExamNewPage);
    page = fixture.componentInstance;
    el = fixture.nativeElement;
    fixture.detectChanges();
    http
      .expectOne((r) => r.url.endsWith('/seasons') && r.method === 'GET')
      .flush({ success: true, message: null, data: { data: [] } });
    flushGroups();
    flushPupils();
    await fixture.whenStable();
    fixture.detectChanges();
  });

  afterEach(() => http.verify());

  const hint = (): string => el.querySelector('[data-testid="exam-blockers"]')?.textContent ?? '';

  it('names the missing student while nothing is picked', () => {
    expect(page.blockers()).toEqual(['exam.need_student', 'exam.need_term']);
    expect(hint()).toContain('exam.need_student');
    expect(el.querySelector<HTMLButtonElement>('[data-testid="exam-submit"]')!.disabled).toBe(true);
  });

  it('drops hints as student and term get picked', () => {
    page.pickedStudent.set(11);
    page.form.controls.term_id.setValue(2);
    fixture.detectChanges();

    expect(page.blockers()).toEqual([]);
    expect(el.querySelector('[data-testid="exam-blockers"]')).toBeNull();
  });

  it('needs no term for final-season exams', () => {
    page.pickedStudent.set(11);
    page.form.controls.exam_type.setValue('final_season');
    fixture.detectChanges();

    expect(page.blockers()).toEqual([]);
  });

  it('narrows pupils by group and picks from the dropdown', async () => {
    openList('exam-group');
    pickText('G5');

    const scoped = http.expectOne((r) => r.url.endsWith('/students') && r.method === 'GET');
    expect(scoped.request.params.get('group_id')).toBe('5');
    scoped.flush({
      success: true,
      message: null,
      data: { data: [PUPILS[0]], meta: { current_page: 1, total: 1, per_page: 100 } },
    });
    await fixture.whenStable();
    fixture.detectChanges();

    // Switching groups clears a stale pupil pick.
    expect(page.pickedStudent()).toBeNull();

    openList('exam-student');
    pickText('Pupil A');
    expect(page.pickedStudent()).toBe(11);
    expect(page.blockers()).toEqual(['exam.need_term']);
  });
});

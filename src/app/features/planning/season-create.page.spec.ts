import { provideHttpClient } from '@angular/common/http';
import { HttpTestingController, provideHttpClientTesting } from '@angular/common/http/testing';
import { signal } from '@angular/core';
import { TestBed } from '@angular/core/testing';
import { provideRouter, Router } from '@angular/router';
import {
  provideTranslateLoader,
  provideTranslateService,
  TranslateNoOpLoader,
} from '@ngx-translate/core';
import { vi } from 'vitest';
import { CurrentUser } from '../../core/api/api-models';
import { AuthService } from '../../core/auth/auth.service';
import { SeasonCreatePage } from './season-create.page';

const ADMIN: CurrentUser = {
  id: 1,
  full_name: 'Admin',
  role: 'admin',
  center_id: null,
  teacher_type: 'both',
};

const CENTERS = {
  data: [{ id: 1, name: 'المركز الأول', city: null }],
  meta: { current_page: 1, total: 1, per_page: 20 },
};

const SEASON = {
  id: 2,
  name: 'موسم 1448',
  hijri_year: '1448',
  start_date: '2026-10-07',
  end_date: null,
  total_weeks: 42,
  total_sessions: 126,
  is_current: false,
  center_id: 1,
  terms_count: 6,
  first_term_id: 7,
};

describe('SeasonCreatePage edit mode (/planning/:id/edit)', () => {
  let fixture!: ReturnType<typeof TestBed.createComponent<SeasonCreatePage>>;
  let page!: SeasonCreatePage;
  let http!: HttpTestingController;
  let el!: HTMLElement;
  let navigate!: ReturnType<typeof vi.spyOn>;

  const settle = async (): Promise<void> => {
    await new Promise<void>((r) => setTimeout(r, 0));
    fixture.detectChanges();
  };

  const flushCenters = (): void => {
    http
      .expectOne((r) => r.url.endsWith('/centers') && r.method === 'GET')
      .flush({ success: true, message: null, data: CENTERS });
  };

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [SeasonCreatePage],
      providers: [
        provideHttpClient(),
        provideHttpClientTesting(),
        provideRouter([]),
        provideTranslateService({
          loader: provideTranslateLoader(() => new TranslateNoOpLoader()),
        }),
        {
          provide: AuthService,
          useFactory: () => ({
            currentUser: signal<CurrentUser>(ADMIN),
            role: signal<CurrentUser['role']>('admin'),
          }),
        },
      ],
    }).compileComponents();
    http = TestBed.inject(HttpTestingController);
    navigate = vi.spyOn(TestBed.inject(Router), 'navigate');
  });

  afterEach(() => http.verify());

  const mountEdit = async (): Promise<void> => {
    fixture = TestBed.createComponent(SeasonCreatePage);
    fixture.componentRef.setInput('id', '2');
    page = fixture.componentInstance;
    el = fixture.nativeElement;
    fixture.detectChanges();
    flushCenters();
    http
      .expectOne((r) => r.url.endsWith('/seasons/2') && r.method === 'GET')
      .flush({ success: true, message: null, data: SEASON });
    await settle();
  };

  it('seeds the header fields and hides the generation blocks', async () => {
    await mountEdit();

    expect(page.isNew()).toBe(false);
    expect(page.form.controls.name.value).toBe('موسم 1448');
    expect(page.form.controls.start_date.value).toBe('2026-10-07');
    expect(page.form.pristine).toBe(true);
    // Terms/sessions/review belong to generation: absent in edit mode.
    expect(el.querySelector('[formArrayName="terms"]')).toBeNull();
    expect(el.querySelector('[data-testid="seasons-template"]')).toBeNull();
    expect(el.querySelector('[data-testid="season-end"]')).not.toBeNull();
  });

  it('PUTs the header fields and navigates back to the list', async () => {
    await mountEdit();

    page.form.controls.name.setValue('موسم معدل');
    fixture.detectChanges();
    el.querySelector<HTMLButtonElement>('[data-testid="season-save"]')!.click();
    fixture.detectChanges();

    const req = http.expectOne((r) => r.url.endsWith('/seasons/2') && r.method === 'PUT');
    expect(req.request.body).toEqual({
      name: 'موسم معدل',
      start_date: '2026-10-07',
      end_date: null,
      hijri_year: '1448',
    });
    req.flush({ success: true, message: null, data: { ...SEASON, name: 'موسم معدل' } });
    fixture.detectChanges();
    expect(navigate).toHaveBeenCalledWith(['/planning']);
  });

  it('keeps the full composer in create mode', async () => {
    fixture = TestBed.createComponent(SeasonCreatePage);
    page = fixture.componentInstance;
    el = fixture.nativeElement;
    fixture.detectChanges();
    flushCenters();
    await settle();

    expect(page.isNew()).toBe(true);
    expect(el.querySelector('[formArrayName="terms"]')).not.toBeNull();
    expect(el.querySelector('[data-testid="seasons-template"]')).not.toBeNull();
    expect(el.querySelector('[data-testid="season-end"]')).toBeNull();
  });
});

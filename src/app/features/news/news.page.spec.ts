import { provideHttpClient } from '@angular/common/http';
import { HttpTestingController, provideHttpClientTesting } from '@angular/common/http/testing';
import { TestBed } from '@angular/core/testing';
import {
  provideTranslateLoader,
  provideTranslateService,
  TranslateNoOpLoader,
} from '@ngx-translate/core';
import { NewsPage } from './news.page';
import { AuthService } from '../../core/auth/auth.service';

const GROUP = { id: 2, name: 'حلقة النور', center_id: 1, weekdays: '1,3,5' };

const LIST = () => ({
  success: true,
  message: null,
  data: { data: [], meta: { current_page: 1, total: 0, per_page: 20 } },
});

const authStub = {
  currentUser: () => ({ id: 1, role: 'admin', full_name: 'Admin' }),
};

describe('NewsPage', () => {
  let fixture!: ReturnType<typeof TestBed.createComponent<NewsPage>>;
  let page!: NewsPage;
  let http!: HttpTestingController;
  let el!: HTMLElement;

  const flushGroups = (): void => {
    http
      .match((r) => r.url.endsWith('/groups') && r.method === 'GET')
      .forEach((req) =>
        req.flush({
          success: true,
          message: null,
          data: { data: [GROUP], meta: { current_page: 1, total: 1, per_page: 20 } },
        }),
      );
  };

  beforeEach(async () => {
    localStorage.clear();
    sessionStorage.clear();
    await TestBed.configureTestingModule({
      imports: [NewsPage],
      providers: [
        provideHttpClient(),
        provideHttpClientTesting(),
        provideTranslateService({
          loader: provideTranslateLoader(() => new TranslateNoOpLoader()),
        }),
        { provide: AuthService, useValue: authStub },
      ],
    }).compileComponents();
    http = TestBed.inject(HttpTestingController);
    fixture = TestBed.createComponent(NewsPage);
    page = fixture.componentInstance;
    el = fixture.nativeElement;
    fixture.detectChanges();
    http.expectOne((r) => r.url.endsWith('/announcements') && r.method === 'GET').flush(LIST());
    flushGroups();
    await fixture.whenStable();
    fixture.detectChanges();
  });

  afterEach(() => http.verify());

  it('hides the section picker and posts group-less for audience all', () => {
    expect(page.showGroup()).toBe(false);
    expect(el.querySelector('[data-testid="news-group"]')).toBeNull();

    page.form.controls.title.setValue('تنبيه');
    page.form.controls.body.setValue('سلام');
    expect(page.form.valid).toBe(true);
    page.submit();

    const req = http.expectOne((r) => r.url.endsWith('/announcements') && r.method === 'POST');
    expect(req.request.body).toEqual({ audience: 'all', title: 'تنبيه', body: 'سلام' });
    req.flush({ success: true, message: null, data: { id: 3 } });
    fixture.detectChanges();

    // reload of the list after a successful post
    http
      .match((r) => r.url.endsWith('/announcements') && r.method === 'GET')
      .forEach((req) => req.flush(LIST()));
    fixture.detectChanges();
    expect(page.form.controls.group_id.value).toBeNull();
    expect(page.showGroup()).toBe(false);
  });

  it('shows and requires the section picker only for my_students', () => {
    page.form.controls.audience.setValue('my_students');
    fixture.detectChanges();

    expect(page.showGroup()).toBe(true);
    const dd = el.querySelector('[data-testid="news-group"]');
    expect(dd).not.toBeNull();
    expect(page.form.controls.group_id.hasError('required')).toBe(true);
    expect(page.form.valid).toBe(false);

    page.form.controls.group_id.setValue(2);
    page.form.controls.title.setValue('حلقة النور');
    page.form.controls.body.setValue('موعد خاص');
    expect(page.form.valid).toBe(true);
    page.submit();

    const req = http.expectOne((r) => r.url.endsWith('/announcements') && r.method === 'POST');
    expect(req.request.body).toEqual({
      audience: 'my_students',
      group_id: 2,
      title: 'حلقة النور',
      body: 'موعد خاص',
    });
    req.flush({ success: true, message: null, data: { id: 4 } });
    fixture.detectChanges();

    http
      .match((r) => r.url.endsWith('/announcements') && r.method === 'GET')
      .forEach((req) => req.flush(LIST()));
    fixture.detectChanges();

    // reset returns to audience all → picker hides again
    expect(page.showGroup()).toBe(false);
  });
});

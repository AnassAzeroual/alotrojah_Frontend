import { provideHttpClient } from '@angular/common/http';
import { HttpTestingController, provideHttpClientTesting } from '@angular/common/http/testing';
import { TestBed } from '@angular/core/testing';
import {
  provideTranslateLoader,
  provideTranslateService,
  TranslateNoOpLoader,
} from '@ngx-translate/core';
import { RegistrationRequest } from '../../core/api/api-models';
import { RegistrationsPage } from './registrations.page';

const TEACHER_REQ: RegistrationRequest = {
  id: 7,
  full_name: 'Fatima Zahra',
  email: 'fatima@example.com',
  role: 'teacher',
  teacher_type: 'murajaa',
  phone: '0611223344',
  birth_date: null,
  gender: null,
  requested_at: '2026-10-01T10:00:00.000000Z',
};

const STUDENT_REQ: RegistrationRequest = {
  id: 8,
  full_name: 'Youssef Amine',
  email: 'youssef@example.com',
  role: 'student',
  teacher_type: 'both',
  phone: '0655443322',
  birth_date: '2012-05-10',
  gender: 'male',
  requested_at: '2026-10-02T08:30:00.000000Z',
};

const PAGE = (rows: RegistrationRequest[], total = rows.length) => ({
  success: true,
  message: null,
  data: { data: rows, meta: { current_page: 1, total, per_page: 20 } },
});

const ACCEPTED_USER = {
  id: 42,
  full_name: 'Fatima Zahra',
  email: 'fatima@example.com',
  role: 'teacher',
  phone: '0611223344',
  center_id: 1,
  teacher_type: 'murajaa',
  is_active: true,
};

describe('RegistrationsPage', () => {
  let fixture!: ReturnType<typeof TestBed.createComponent<RegistrationsPage>>;
  let page!: RegistrationsPage;
  let http!: HttpTestingController;
  let el!: HTMLElement;

  const flushCenters = (): void => {
    const req = http.expectOne((r) => r.url.endsWith('/centers'));
    req.flush({
      success: true,
      message: null,
      data: { data: [{ id: 1, name: 'Al Noor', city: 'Casablanca' }], meta: { current_page: 1, total: 1, per_page: 20 } },
    });
  };

  const flushRequests = (rows: RegistrationRequest[], total = rows.length): void => {
    const req = http.expectOne((r) => r.url.endsWith('/registration-requests'));
    req.flush(PAGE(rows, total));
  };

  beforeEach(async () => {
    localStorage.clear();
    await TestBed.configureTestingModule({
      imports: [RegistrationsPage],
      providers: [
        provideHttpClient(),
        provideHttpClientTesting(),
        provideTranslateService({
          loader: provideTranslateLoader(() => new TranslateNoOpLoader()),
        }),
      ],
    }).compileComponents();
    http = TestBed.inject(HttpTestingController);
    fixture = TestBed.createComponent(RegistrationsPage);
    page = fixture.componentInstance;
    el = fixture.nativeElement;
    fixture.detectChanges();
    flushCenters();
    flushRequests([TEACHER_REQ, STUDENT_REQ]);
    await fixture.whenStable();
    fixture.detectChanges();
  });

  afterEach(() => http.verify());

  it('renders one card per pending request with its details', () => {
    const cards = el.querySelectorAll('article.req-card');
    expect(cards.length).toBe(2);
    expect(el.textContent).toContain('Fatima Zahra');
    expect(el.textContent).toContain('fatima@example.com');
    expect(el.textContent).toContain('teacher_type.murajaa');
    expect(el.textContent).toContain('2012-05-10');
    expect(el.textContent).toContain('2026-10-01');
  });

  it('accepts a request with the chosen center and reloads the list', async () => {
    expect(el.querySelector('.req-accept')).toBeNull();

    page.startAccept(TEACHER_REQ.id);
    fixture.detectChanges();
    expect(el.querySelector('.req-accept')).not.toBeNull();
    expect(page.centerOptions()[0]?.label).toBe('Al Noor');

    page.centerId.set(1);
    page.confirmAccept(TEACHER_REQ.id);
    const req = http.expectOne((r) => r.url.endsWith(`/registration-requests/${TEACHER_REQ.id}/accept`));
    expect(req.request.method).toBe('POST');
    expect(req.request.body).toEqual({ center_id: 1 });
    req.flush({ success: true, message: null, data: ACCEPTED_USER });
    fixture.detectChanges(); // resource effect issues the reload GET

    flushRequests([STUDENT_REQ]);
    await fixture.whenStable();
    fixture.detectChanges();

    expect(page.acceptingId()).toBeNull();
    expect(el.textContent).not.toContain('Fatima Zahra');
    expect(el.textContent).toContain('Youssef Amine');
  });

  it('keeps the panel and flags failure when accept errors', () => {
    page.startAccept(TEACHER_REQ.id);
    page.centerId.set(1);
    page.confirmAccept(TEACHER_REQ.id);
    const req = http.expectOne((r) => r.url.endsWith(`/registration-requests/${TEACHER_REQ.id}/accept`));
    req.flush(null, { status: 500, statusText: 'Server Error' });
    fixture.detectChanges();

    expect(page.acceptingId()).toBe(TEACHER_REQ.id);
    expect(page.actionFailed()).toBe(true);
    expect(el.textContent).toContain('common.error');
  });

  it('requires two clicks to cancel and then hard-deletes the request', async () => {
    expect(page.armingCancelId()).toBeNull();

    page.armCancel(TEACHER_REQ.id);
    fixture.detectChanges();
    expect(page.armingCancelId()).toBe(TEACHER_REQ.id);
    http.expectNone((r) => r.method === 'DELETE');

    page.confirmCancel(TEACHER_REQ.id);
    const req = http.expectOne((r) => r.url.endsWith(`/registration-requests/${TEACHER_REQ.id}`));
    expect(req.request.method).toBe('DELETE');
    req.flush({ success: true, message: null, data: null });
    fixture.detectChanges(); // resource effect issues the reload GET

    flushRequests([STUDENT_REQ]);
    await fixture.whenStable();
    fixture.detectChanges();

    expect(page.armingCancelId()).toBeNull();
    expect(el.textContent).not.toContain('Fatima Zahra');
  });

  it('steps back a page when the last row of a non-first page disappears', async () => {
    page.page.set(2);
    fixture.detectChanges();
    flushRequests([STUDENT_REQ]);
    await fixture.whenStable(); // resource now holds the single page-2 row
    fixture.detectChanges();

    page.armCancel(STUDENT_REQ.id);
    page.confirmCancel(STUDENT_REQ.id);
    const req = http.expectOne((r) => r.url.endsWith(`/registration-requests/${STUDENT_REQ.id}`));
    expect(req.request.method).toBe('DELETE');
    req.flush({ success: true, message: null, data: null });
    expect(page.page()).toBe(1);
  });

  it('shows the empty state once every pending request is resolved', async () => {
    page.armCancel(TEACHER_REQ.id);
    page.confirmCancel(TEACHER_REQ.id);
    http
      .expectOne((r) => r.url.endsWith(`/registration-requests/${TEACHER_REQ.id}`))
      .flush({ success: true, message: null, data: null });
    fixture.detectChanges(); // resource effect issues the reload GET
    flushRequests([STUDENT_REQ]);
    await fixture.whenStable();

    page.armCancel(STUDENT_REQ.id);
    page.confirmCancel(STUDENT_REQ.id);
    http
      .expectOne((r) => r.url.endsWith(`/registration-requests/${STUDENT_REQ.id}`))
      .flush({ success: true, message: null, data: null });
    fixture.detectChanges(); // resource effect issues the reload GET
    flushRequests([]);
    await fixture.whenStable();
    fixture.detectChanges();

    expect(el.querySelector('article.req-card')).toBeNull();
    expect(el.textContent).toContain('common.empty');
  });
});

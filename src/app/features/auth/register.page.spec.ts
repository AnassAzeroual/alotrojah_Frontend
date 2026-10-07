import { provideHttpClient } from '@angular/common/http';
import { HttpTestingController, provideHttpClientTesting } from '@angular/common/http/testing';
import { Component } from '@angular/core';
import { TestBed } from '@angular/core/testing';
import { provideRouter } from '@angular/router';
import {
  provideTranslateLoader,
  provideTranslateService,
  TranslateNoOpLoader,
} from '@ngx-translate/core';
import { RegisterPage } from './register.page';

@Component({ template: '', standalone: true })
class DummyComponent {}

function flushOk(http: HttpTestingController): void {
  const req = http.expectOne((r) => r.url.endsWith('/auth/register'));
  req.flush({ success: true, message: null, data: null });
}

function fillTeacherForm(page: RegisterPage): void {
  page.form.controls.full_name.setValue('Ahmed Test');
  page.form.controls.email.setValue('ahmed@example.com');
  page.form.controls.phone.setValue('0600000000');
  page.form.controls.role.setValue('teacher');
  page.form.controls.teacher_type.setValue('hifz');
  page.form.controls.password.setValue('password123');
  page.form.controls.passwordConfirm.setValue('password123');
}

describe('RegisterPage', () => {
  let fixture!: ReturnType<typeof TestBed.createComponent<RegisterPage>>;
  let page!: RegisterPage;
  let http!: HttpTestingController;

  beforeEach(async () => {
    localStorage.clear();
    await TestBed.configureTestingModule({
      imports: [RegisterPage],
      providers: [
        provideHttpClient(),
        provideHttpClientTesting(),
        provideRouter([
          { path: 'login', component: DummyComponent },
          { path: 'register', component: DummyComponent },
        ]),
        provideTranslateService({
          loader: provideTranslateLoader(() => new TranslateNoOpLoader()),
        }),
      ],
    }).compileComponents();
    http = TestBed.inject(HttpTestingController);
    fixture = TestBed.createComponent(RegisterPage);
    page = fixture.componentInstance;
    fixture.detectChanges();
  });

  afterEach(() => http.verify());

  it('creates with no conditional fields visible', () => {
    expect(page).toBeTruthy();
    expect(page.isTeacher()).toBe(false);
    expect(page.isStudent()).toBe(false);
    expect(fixture.nativeElement.querySelector('app-date-picker')).toBeNull();
  });

  it('reveals teacher_type only for teachers and student fields only for students', () => {
    const formDropdowns = (): number =>
      fixture.nativeElement.querySelector('form.auth-form').querySelectorAll('app-dropdown').length;

    page.form.controls.role.setValue('teacher');
    fixture.detectChanges();
    expect(page.isTeacher()).toBe(true);
    expect(formDropdowns()).toBe(2);

    page.form.controls.role.setValue('student');
    fixture.detectChanges();
    expect(page.isTeacher()).toBe(false);
    expect(page.isStudent()).toBe(true);
    expect(fixture.nativeElement.querySelector('app-date-picker')).not.toBeNull();
    expect(formDropdowns()).toBe(2); // role + gender
    expect(page.form.controls.teacher_type.value).toBeNull();

    page.form.controls.role.setValue('board');
    fixture.detectChanges();
    expect(page.isStudent()).toBe(false);
    expect(fixture.nativeElement.querySelector('app-date-picker')).toBeNull();
    expect(formDropdowns()).toBe(1); // role only
    expect(page.form.controls.birth_date.value).toBe('');
    expect(page.form.controls.gender.value).toBeNull();
  });

  it('sends a teacher payload without student fields', () => {
    fillTeacherForm(page);
    page.submit();
    const req = http.expectOne((r) => r.url.endsWith('/auth/register'));
    expect(req.request.method).toBe('POST');
    expect(req.request.body).toEqual({
      full_name: 'Ahmed Test',
      email: 'ahmed@example.com',
      password: 'password123',
      role: 'teacher',
      phone: '0600000000',
      teacher_type: 'hifz',
    });
    req.flush({ success: true, message: null, data: null });
    fixture.detectChanges();
    expect(page.submitted()).toBe(true);
    expect(fixture.nativeElement.textContent).toContain('auth.request_sent_title');
  });

  it('sends a student payload with birth_date and gender', () => {
    fillTeacherForm(page);
    page.form.controls.role.setValue('student');
    page.form.controls.birth_date.setValue('2012-05-10');
    page.form.controls.gender.setValue('male');
    page.submit();
    const req = http.expectOne((r) => r.url.endsWith('/auth/register'));
    expect(req.request.body).toEqual({
      full_name: 'Ahmed Test',
      email: 'ahmed@example.com',
      password: 'password123',
      role: 'student',
      phone: '0600000000',
      birth_date: '2012-05-10',
      gender: 'male',
    });
    req.flush({ success: true, message: null, data: null });
    expect(page.submitted()).toBe(true);
  });

  it('stores nothing on success — waiting room only', () => {
    fillTeacherForm(page);
    page.submit();
    flushOk(http);
    expect(localStorage.getItem('alotrojah_token')).toBeNull();
  });

  it('maps the email_taken backend code', () => {
    fillTeacherForm(page);
    page.submit();
    const req = http.expectOne((r) => r.url.endsWith('/auth/register'));
    req.flush(
      { message: 'The email has already been taken.', errors: { email: ['email_taken'] } },
      { status: 422, statusText: 'Unprocessable Entity' },
    );
    fixture.detectChanges();
    expect(page.errorKey()).toBe('auth.email_taken');
    expect(fixture.nativeElement.textContent).toContain('auth.email_taken');
  });

  it('maps the in_waiting_room backend code', () => {
    fillTeacherForm(page);
    page.submit();
    const req = http.expectOne((r) => r.url.endsWith('/auth/register'));
    req.flush(
      { message: 'Already pending.', errors: { email: ['in_waiting_room'] } },
      { status: 422, statusText: 'Unprocessable Entity' },
    );
    fixture.detectChanges();
    expect(page.errorKey()).toBe('auth.in_waiting_room');
  });

  it('falls back to a generic error for other failures', () => {
    fillTeacherForm(page);
    page.submit();
    const req = http.expectOne((r) => r.url.endsWith('/auth/register'));
    req.flush(null, { status: 500, statusText: 'Server Error' });
    fixture.detectChanges();
    expect(page.errorKey()).toBe('auth.invalid');
  });

  it('blocks submit while the form is invalid', () => {
    page.submit();
    http.expectNone((r) => r.url.endsWith('/auth/register'));
    expect(page.submitted()).toBe(false);
  });

  it('rejects mismatched passwords before any request', () => {
    fillTeacherForm(page);
    page.form.controls.passwordConfirm.setValue('different1');
    expect(page.form.invalid).toBe(true);
    page.submit();
    http.expectNone((r) => r.url.endsWith('/auth/register'));
  });
});

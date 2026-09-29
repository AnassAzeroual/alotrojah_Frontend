import { HttpClient, provideHttpClient, withInterceptors } from '@angular/common/http';
import { HttpTestingController, provideHttpClientTesting } from '@angular/common/http/testing';
import { TestBed } from '@angular/core/testing';
import { provideRouter } from '@angular/router';
import { AuthService } from './auth.service';
import { authInterceptor } from './auth.interceptor';
import { CurrentUser } from '../api/api-models';

const USER: CurrentUser = {
  id: 3,
  full_name: 'T',
  role: 'teacher',
  center_id: 1,
  teacher_type: 'hifz',
};

describe('authInterceptor', () => {
  let http: HttpClient;
  let tester: HttpTestingController;
  let auth: AuthService;

  beforeEach(() => {
    localStorage.clear();
    TestBed.configureTestingModule({
      providers: [
        provideHttpClient(withInterceptors([authInterceptor])),
        provideHttpClientTesting(),
        provideRouter([]),
      ],
    });
    http = TestBed.inject(HttpClient);
    tester = TestBed.inject(HttpTestingController);
    auth = TestBed.inject(AuthService);
  });

  afterEach(() => tester.verify());

  it('attaches the bearer token', () => {
    auth.token.set('T');
    auth.currentUser.set(USER);
    http.get('/x').subscribe();
    const req = tester.expectOne('/x');
    expect(req.request.headers.get('Authorization')).toBe('Bearer T');
    req.flush({});
  });

  it('skips only the login route', () => {
    auth.token.set('T');
    http.post('/auth/login', {}).subscribe({ error: () => undefined });
    const req = tester.expectOne((r) => r.url.endsWith('/auth/login'));
    expect(req.request.headers.has('Authorization')).toBe(false);
    req.flush({}, { status: 401, statusText: 'Unauthorized' });
  });

  it('attaches the token to me and refresh calls', () => {
    auth.token.set('T');
    auth.currentUser.set(USER);
    http.get('/auth/me').subscribe();
    expect(
      tester.expectOne((r) => r.url.endsWith('/auth/me')).request.headers.get('Authorization'),
    ).toBe('Bearer T');
    auth.refreshOnce().subscribe();
    expect(
      tester.expectOne((r) => r.url.endsWith('/auth/refresh')).request.headers.get('Authorization'),
    ).toBe('Bearer T');
  });

  it('refreshes once on 401 then retries', () => {
    auth.token.set('OLD');
    auth.currentUser.set(USER);
    http.get('/protected').subscribe((v) => expect(v).toEqual({ ok: true }));
    tester.expectOne('/protected').flush({}, { status: 401, statusText: 'Unauthorized' });
    const refresh = tester.expectOne((r) => r.url.endsWith('/auth/refresh'));
    refresh.flush({
      success: true,
      message: null,
      data: { access_token: 'NEW', token_type: 'bearer', expires_in: 3600, user: USER },
    });
    const retry = tester.expectOne('/protected');
    expect(retry.request.headers.get('Authorization')).toBe('Bearer NEW');
    retry.flush({ ok: true });
    expect(auth.token()).toBe('NEW');
  });
});

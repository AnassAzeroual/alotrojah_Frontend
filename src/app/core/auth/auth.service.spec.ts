import { provideHttpClient } from '@angular/common/http';
import { HttpTestingController, provideHttpClientTesting } from '@angular/common/http/testing';
import { Component } from '@angular/core';
import { TestBed } from '@angular/core/testing';
import { provideRouter } from '@angular/router';
import { AuthService } from './auth.service';
import { CurrentUser } from '../api/api-models';

@Component({ template: '', standalone: true })
class DummyComponent {}

const USER: CurrentUser = {
  id: 1,
  full_name: 'Admin',
  role: 'admin',
  center_id: null,
  teacher_type: 'both',
};

describe('AuthService', () => {
  let auth: AuthService;
  let http: HttpTestingController;

  beforeEach(() => {
    localStorage.clear();
    TestBed.configureTestingModule({
      providers: [
        provideHttpClient(),
        provideHttpClientTesting(),
        provideRouter([{ path: 'login', component: DummyComponent }]),
      ],
    });
    auth = TestBed.inject(AuthService);
    http = TestBed.inject(HttpTestingController);
  });

  afterEach(() => http.verify());

  it('login stores token and user', () => {
    auth.login('a@b.c', 'password123').subscribe();
    const req = http.expectOne((r) => r.url.endsWith('/auth/login'));
    req.flush({
      success: true,
      message: null,
      data: { access_token: 'T', token_type: 'bearer', expires_in: 3600, user: USER },
    });
    expect(auth.token()).toBe('T');
    expect(auth.currentUser()).toEqual(USER);
    expect(auth.isLoggedIn()).toBe(true);
    expect(localStorage.getItem('alotrojah_token')).toBe('T');
  });

  it('logout clears everything', () => {
    auth.token.set('T');
    auth.currentUser.set(USER);
    auth.logout();
    const req = http.expectOne((r) => r.url.endsWith('/auth/logout'));
    req.flush({ success: true, message: null, data: null });
    expect(auth.token()).toBeNull();
    expect(auth.isLoggedIn()).toBe(false);
    expect(localStorage.getItem('alotrojah_token')).toBeNull();
  });

  it('refresh is single-flight', () => {
    const results: string[] = [];
    auth.refreshOnce().subscribe((t) => results.push(t));
    auth.refreshOnce().subscribe((t) => results.push(t));
    const reqs = http.match((r) => r.url.endsWith('/auth/refresh'));
    expect(reqs.length).toBe(1);
    reqs[0].flush({
      success: true,
      message: null,
      data: { access_token: 'N', token_type: 'bearer', expires_in: 3600, user: USER },
    });
    expect(results).toEqual(['N', 'N']);
  });

  it('init settles immediately with no token and fires no request', async () => {
    let settled = false;
    void auth.ready.then(() => (settled = true));
    auth.init();
    await Promise.resolve();
    expect(settled).toBe(true);
    expect(auth.sessionProbed()).toBe(true);
    expect(auth.currentUser()).toBeNull();
    http.verify();
  });

  it('init restores the session on a live token', async () => {
    auth.token.set('T');
    auth.init();
    http
      .expectOne((r) => r.url.endsWith('/auth/me'))
      .flush({ success: true, message: null, data: USER });
    await auth.ready;
    expect(auth.sessionProbed()).toBe(true);
    expect(auth.currentUser()).toEqual(USER);
    expect(auth.isLoggedIn()).toBe(true);
  });

  it('init clears a dead token and still settles ready', async () => {
    auth.token.set('T');
    localStorage.setItem('alotrojah_token', 'T');
    auth.init();
    http
      .expectOne((r) => r.url.endsWith('/auth/me'))
      .flush('Unauthenticated.', { status: 401, statusText: 'Unauthorized' });
    await auth.ready;
    expect(auth.sessionProbed()).toBe(true);
    expect(auth.token()).toBeNull();
    expect(auth.currentUser()).toBeNull();
    expect(localStorage.getItem('alotrojah_token')).toBeNull();
  });

  it('init does not clobber a login that wins the race', async () => {
    auth.token.set('OLD');
    auth.init(); // probe in flight with OLD
    auth.login('a@b.c', 'password123').subscribe(); // user logs in mid-probe
    const reqs = http.match((r) => r.url.endsWith('/auth/login'));
    reqs[0].flush({
      success: true,
      message: null,
      data: { access_token: 'NEW', token_type: 'bearer', expires_in: 3600, user: USER },
    });
    http
      .expectOne((r) => r.url.endsWith('/auth/me'))
      .flush({ success: true, message: null, data: USER });
    await auth.ready;
    expect(auth.token()).toBe('NEW');
    expect(auth.isLoggedIn()).toBe(true);
  });
});

import { provideHttpClient } from '@angular/common/http';
import { HttpTestingController, provideHttpClientTesting } from '@angular/common/http/testing';
import { Component } from '@angular/core';
import { TestBed } from '@angular/core/testing';
import { provideRouter } from '@angular/router';
import { AuthService } from './auth.service';
import { CurrentUser } from '../api/api-models';

@Component({ template: '', standalone: true })
class DummyComponent {}

const USER: CurrentUser = { id: 1, full_name: 'Admin', role: 'admin', center_id: null, teacher_type: 'both' };

describe('AuthService', () => {
  let auth: AuthService;
  let http: HttpTestingController;

  beforeEach(() => {
    localStorage.clear();
    TestBed.configureTestingModule({
      providers: [provideHttpClient(), provideHttpClientTesting(), provideRouter([{ path: 'login', component: DummyComponent }])],
    });
    auth = TestBed.inject(AuthService);
    http = TestBed.inject(HttpTestingController);
  });

  afterEach(() => http.verify());

  it('login stores token and user', () => {
    auth.login('a@b.c', 'password123').subscribe();
    const req = http.expectOne((r) => r.url.endsWith('/auth/login'));
    req.flush({ success: true, message: null, data: { access_token: 'T', token_type: 'bearer', expires_in: 3600, user: USER } });
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
    reqs[0].flush({ success: true, message: null, data: { access_token: 'N', token_type: 'bearer', expires_in: 3600, user: USER } });
    expect(results).toEqual(['N', 'N']);
  });
});

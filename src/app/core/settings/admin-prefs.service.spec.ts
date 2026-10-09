import { provideHttpClient } from '@angular/common/http';
import { provideHttpClientTesting } from '@angular/common/http/testing';
import { Component } from '@angular/core';
import { TestBed } from '@angular/core/testing';
import { provideRouter } from '@angular/router';
import { AuthService } from '../auth/auth.service';
import { CurrentUser } from '../api/api-models';
import { AdminPrefsService } from './admin-prefs.service';

@Component({ template: '', standalone: true })
class DummyComponent {}

const ADMIN: CurrentUser = {
  id: 1,
  full_name: 'Admin',
  role: 'admin',
  center_id: null,
  teacher_type: 'both',
};

const TEACHER: CurrentUser = {
  id: 7,
  full_name: 'Teacher',
  role: 'teacher',
  center_id: 3,
  teacher_type: 'hifz',
};

describe('AdminPrefsService', () => {
  let auth: AuthService;
  let prefs: AdminPrefsService;

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
    prefs = TestBed.inject(AdminPrefsService);
  });

  it('starts with pickers visible and center id shown', () => {
    expect(prefs.hideScopePickers()).toBe(false);
    expect(prefs.showCenterId()).toBe(true);
    expect(prefs.showCalDebug()).toBe(true);
  });

  it('persists per user and never leaks across accounts', () => {
    auth.currentUser.set(ADMIN);
    prefs.setHideScopePickers(true);
    prefs.setShowCenterId(false);
    prefs.setShowCalDebug(false);
    expect(localStorage.getItem('alotrojah_prefs.1')).toContain('"hideScopePickers":true');

    auth.currentUser.set(TEACHER);
    TestBed.flushEffects();
    expect(prefs.hideScopePickers()).toBe(false);
    expect(prefs.showCenterId()).toBe(true);
    expect(prefs.showCalDebug()).toBe(true);

    prefs.setShowCenterId(false);
    auth.currentUser.set(ADMIN);
    TestBed.flushEffects();
    expect(prefs.hideScopePickers()).toBe(true);
    expect(prefs.showCenterId()).toBe(false);
    expect(prefs.showCalDebug()).toBe(false);
  });

  it('survives corrupt storage', () => {
    localStorage.setItem('alotrojah_prefs.anon', 'not-json{{{');
    auth.currentUser.set(null);
    TestBed.flushEffects();
    expect(prefs.hideScopePickers()).toBe(false);
    expect(prefs.showCenterId()).toBe(true);
    expect(prefs.showCalDebug()).toBe(true);
  });
});

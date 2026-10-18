import { Component } from '@angular/core';
import { TestBed } from '@angular/core/testing';
import { provideHttpClient } from '@angular/common/http';
import { HttpTestingController, provideHttpClientTesting } from '@angular/common/http/testing';
import {
  ActivatedRouteSnapshot,
  PartialMatchRouteSnapshot,
  provideRouter,
  Route,
  RouterStateSnapshot,
} from '@angular/router';
import { firstValueFrom, Observable } from 'rxjs';
import { provideNgCryptoStore } from 'ng-cryptostore';
import { AuthService } from './auth.service';
import { roleGuard, roleMatchGuard } from './role.guard';
import { AuthLoginResponse } from '../api/models';

@Component({ template: '', standalone: true })
class DummyComponent {}

function runGuard(
  user: AuthLoginResponse['data']['user'] | null,
  data: Record<string, unknown>,
): boolean | unknown {
  const auth = TestBed.inject(AuthService);
  auth.token.set(user ? 'T' : null);
  auth.currentUser.set(user);
  // These tests exercise the post-probe path; the wait branch has its own specs.
  auth.sessionProbed.set(true);
  return TestBed.runInInjectionContext(() =>
    roleGuard({ data } as unknown as ActivatedRouteSnapshot, {} as unknown as RouterStateSnapshot),
  );
}

function runMatchGuard(
  user: AuthLoginResponse['data']['user'] | null,
  data?: Record<string, unknown>,
): boolean | unknown {
  const auth = TestBed.inject(AuthService);
  auth.token.set(user ? 'T' : null);
  auth.currentUser.set(user);
  auth.sessionProbed.set(true);
  return TestBed.runInInjectionContext(() =>
    roleMatchGuard({ data } as unknown as Route, [], {} as unknown as PartialMatchRouteSnapshot),
  );
}

describe('roleGuard', () => {
  beforeEach(() => {
    localStorage.clear();
    sessionStorage.clear();
    TestBed.configureTestingModule({
      providers: [
        provideHttpClient(),
        provideHttpClientTesting(),
        provideRouter([{ path: 'login', component: DummyComponent }]),
        // Mirror app.config.ts vault backend (sessionStorage).
        provideNgCryptoStore({ storageType: 'sessionStorage' }),
      ],
    });
  });

  const teacher: AuthLoginResponse['data']['user'] = {
    id: 3,
    full_name: 'T',
    role: 'teacher',
    center_id: 1,
    center_name: 'C',
    teacher_type: 'hifz',
  };
  const murajaa: AuthLoginResponse['data']['user'] = {
    ...teacher,
    id: 19,
    teacher_type: 'murajaa',
  };

  it('redirects guests', () => {
    expect(runGuard(null, {})).toBe(false);
  });

  it('allows listed roles', () => {
    expect(runGuard(teacher, { roles: ['admin', 'teacher'] })).toBe(true);
  });

  it('blocks unlisted roles', () => {
    expect(runGuard(teacher, { roles: ['admin'] })).toBe(false);
  });

  it('enforces teacher type', () => {
    expect(runGuard(murajaa, {})).toBe(true);
    expect(runGuard(murajaa, { teacherTypes: ['hifz'] })).toBe(false);
    expect(runGuard(teacher, { teacherTypes: ['hifz', 'both'] })).toBe(true);
  });

  it('waits for the boot probe, then allows a valid user', async () => {
    sessionStorage.setItem('alotrojah_token', 'T'); // must precede service construction
    const auth = TestBed.inject(AuthService);
    const http = TestBed.inject(HttpTestingController);
    auth.init(); // probe starts, not yet settled

    const result = TestBed.runInInjectionContext(() =>
      roleGuard(
        { data: { roles: ['teacher'] } } as unknown as ActivatedRouteSnapshot,
        {} as unknown as RouterStateSnapshot,
      ),
    );
    expect(typeof result).not.toBe('boolean'); // undecided while probing

    http
      .expectOne((r) => r.url.endsWith('/auth/me'))
      .flush({ success: true, message: null, data: teacher });

    await expect(firstValueFrom(result as Observable<boolean>)).resolves.toBe(true);
  });

  it('waits for the boot probe, then redirects a dead token', async () => {
    const auth = TestBed.inject(AuthService);
    const http = TestBed.inject(HttpTestingController);
    auth.token.set('DEAD');
    auth.init();

    const result = TestBed.runInInjectionContext(() =>
      roleGuard(
        { data: {} } as unknown as ActivatedRouteSnapshot,
        {} as unknown as RouterStateSnapshot,
      ),
    );
    expect(typeof result).not.toBe('boolean');

    http
      .expectOne((r) => r.url.endsWith('/auth/me'))
      .flush('Unauthenticated.', { status: 401, statusText: 'Unauthorized' });

    await expect(firstValueFrom(result as Observable<boolean>)).resolves.toBe(false);
    expect(auth.token()).toBeNull();
  });
});

describe('roleMatchGuard', () => {
  beforeEach(() => {
    localStorage.clear();
    sessionStorage.clear();
    TestBed.configureTestingModule({
      providers: [
        provideHttpClient(),
        provideHttpClientTesting(),
        provideRouter([{ path: 'login', component: DummyComponent }]),
        provideNgCryptoStore({ storageType: 'sessionStorage' }),
      ],
    });
  });

  const teacher: AuthLoginResponse['data']['user'] = {
    id: 3,
    full_name: 'T',
    role: 'teacher',
    center_id: 1,
    center_name: 'C',
    teacher_type: 'hifz',
  };

  it('blocks guests before the shell chunk loads', () => {
    expect(runMatchGuard(null)).toBe(false);
  });

  it('lets logged-in users match (role checks stay on children)', () => {
    expect(runMatchGuard(teacher)).toBe(true);
  });

  it('still enforces role data when present', () => {
    expect(runMatchGuard(teacher, { roles: ['admin'] })).toBe(false);
    expect(runMatchGuard(teacher, { roles: ['admin', 'teacher'] })).toBe(true);
  });
});

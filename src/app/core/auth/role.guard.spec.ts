import { Component } from '@angular/core';
import { TestBed } from '@angular/core/testing';
import { provideHttpClient } from '@angular/common/http';
import { HttpTestingController, provideHttpClientTesting } from '@angular/common/http/testing';
import { ActivatedRouteSnapshot, provideRouter, RouterStateSnapshot } from '@angular/router';
import { firstValueFrom, Observable } from 'rxjs';
import { AuthService } from './auth.service';
import { roleGuard } from './role.guard';
import { CurrentUser } from '../api/api-models';

@Component({ template: '', standalone: true })
class DummyComponent {}

function runGuard(user: CurrentUser | null, data: Record<string, unknown>): boolean | unknown {
  const auth = TestBed.inject(AuthService);
  auth.token.set(user ? 'T' : null);
  auth.currentUser.set(user);
  // These tests exercise the post-probe path; the wait branch has its own specs.
  auth.sessionProbed.set(true);
  return TestBed.runInInjectionContext(() =>
    roleGuard({ data } as unknown as ActivatedRouteSnapshot, {} as unknown as RouterStateSnapshot),
  );
}

describe('roleGuard', () => {
  beforeEach(() => {
    localStorage.clear();
    TestBed.configureTestingModule({
      providers: [
        provideHttpClient(),
        provideHttpClientTesting(),
        provideRouter([{ path: 'login', component: DummyComponent }]),
      ],
    });
  });

  const teacher: CurrentUser = {
    id: 3,
    full_name: 'T',
    role: 'teacher',
    center_id: 1,
    teacher_type: 'hifz',
  };
  const murajaa: CurrentUser = { ...teacher, id: 19, teacher_type: 'murajaa' };

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
    localStorage.setItem('alotrojah_token', 'T'); // must precede service construction
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

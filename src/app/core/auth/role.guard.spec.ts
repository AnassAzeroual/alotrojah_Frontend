import { Component } from '@angular/core';
import { TestBed } from '@angular/core/testing';
import { ActivatedRouteSnapshot, provideRouter, RouterStateSnapshot } from '@angular/router';
import { AuthService } from './auth.service';
import { roleGuard } from './role.guard';
import { CurrentUser } from '../api/api-models';

@Component({ template: '', standalone: true })
class DummyComponent {}

function runGuard(user: CurrentUser | null, data: Record<string, unknown>): boolean | unknown {
  const auth = TestBed.inject(AuthService);
  auth.token.set(user ? 'T' : null);
  auth.currentUser.set(user);
  return TestBed.runInInjectionContext(() =>
    roleGuard({ data } as unknown as ActivatedRouteSnapshot, {} as unknown as RouterStateSnapshot),
  );
}

describe('roleGuard', () => {
  beforeEach(() => {
    localStorage.clear();
    TestBed.configureTestingModule({ providers: [provideRouter([{ path: 'login', component: DummyComponent }])] });
  });

  const teacher: CurrentUser = { id: 3, full_name: 'T', role: 'teacher', center_id: 1, teacher_type: 'hifz' };
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
});

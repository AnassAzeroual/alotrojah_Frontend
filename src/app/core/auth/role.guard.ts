import { CanActivateFn, CanMatchFn, Router } from '@angular/router';
import { inject } from '@angular/core';
import { first, from, map } from 'rxjs';
import { AuthService } from './auth.service';
import { Role, TeacherType } from '../api/models';

/** Route data: { roles?: Role[], teacherTypes?: TeacherType[] } */
function decide(
  auth: AuthService,
  router: Router,
  data: Record<string, unknown> | undefined,
): boolean {
  if (!auth.isLoggedIn()) {
    void router.navigate(['/login']);
    return false;
  }
  const roles = data?.['roles'] as Role[] | undefined;
  const types = data?.['teacherTypes'] as TeacherType[] | undefined;
  const user = auth.currentUser();
  if (!user) {
    void router.navigate(['/login']);
    return false;
  }
  if (roles && !roles.includes(user.role)) {
    void router.navigate(['/']);
    return false;
  }
  if (types && (user.teacher_type === null || !types.includes(user.teacher_type))) {
    void router.navigate(['/']);
    return false;
  }
  return true;
}

function waitOrDecide(
  auth: AuthService,
  router: Router,
  data: Record<string, unknown> | undefined,
) {
  // Boot probe (/auth/me) still in flight — deciding now would misread a
  // returning user as a guest. Wait for it, then decide.
  if (!auth.sessionProbed()) {
    return from(auth.ready).pipe(
      first(),
      map(() => decide(auth, router, data)),
    );
  }
  return decide(auth, router, data);
}

export const roleGuard: CanActivateFn = (route) => {
  return waitOrDecide(inject(AuthService), inject(Router), route.data);
};

/**
 * Same policy as {@link roleGuard}, but as a matcher: rejects unauthenticated
 * deep-links BEFORE the shell lazy chunk downloads. Role/teacher-type checks
 * stay on the child CanActivate guards (this route carries no role data).
 */
export const roleMatchGuard: CanMatchFn = (route) => {
  return waitOrDecide(inject(AuthService), inject(Router), route.data);
};

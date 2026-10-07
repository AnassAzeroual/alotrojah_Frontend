import { CanActivateFn, Router } from '@angular/router';
import { inject } from '@angular/core';
import { first, from, map } from 'rxjs';
import { AuthService } from './auth.service';
import { Role, TeacherType } from '../api/api-models';

/** Route data: { roles?: Role[], teacherTypes?: TeacherType[] } */
export const roleGuard: CanActivateFn = (route) => {
  const auth = inject(AuthService);
  const router = inject(Router);

  const decide = (): boolean => {
    if (!auth.isLoggedIn()) {
      void router.navigate(['/login']);
      return false;
    }
    const roles = route.data['roles'] as Role[] | undefined;
    const types = route.data['teacherTypes'] as TeacherType[] | undefined;
    const user = auth.currentUser();
    if (!user) {
      void router.navigate(['/login']);
      return false;
    }
    if (roles && !roles.includes(user.role)) {
      void router.navigate(['/']);
      return false;
    }
    if (types && !types.includes(user.teacher_type)) {
      void router.navigate(['/']);
      return false;
    }
    return true;
  };

  // Boot probe (/auth/me) still in flight — deciding now would misread a
  // returning user as a guest. Wait for it, then decide.
  if (!auth.sessionProbed()) {
    return from(auth.ready).pipe(first(), map(decide));
  }
  return decide();
};

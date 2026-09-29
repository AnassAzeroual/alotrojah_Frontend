import { CanActivateFn, Router } from '@angular/router';
import { inject } from '@angular/core';
import { AuthService } from './auth.service';
import { Role, TeacherType } from '../api/api-models';

/** Route data: { roles?: Role[], teacherTypes?: TeacherType[] } */
export const roleGuard: CanActivateFn = (route) => {
  const auth = inject(AuthService);
  const router = inject(Router);

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

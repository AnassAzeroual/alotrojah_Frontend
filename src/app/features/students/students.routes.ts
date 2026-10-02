import { Routes } from '@angular/router';
import { roleGuard } from '../../core/auth/role.guard';

const STAFF_FAMILY = ['admin', 'supervisor', 'teacher', 'student'] as const;

export const STUDENTS_ROUTES: Routes = [
  {
    path: '',
    loadComponent: () => import('./students-list.page').then((m) => m.StudentsListPage),
    canActivate: [roleGuard],
    data: { roles: [...STAFF_FAMILY] },
  },
  {
    path: ':id',
    loadComponent: () => import('./student-detail.page').then((m) => m.StudentDetailPage),
    canActivate: [roleGuard],
    data: { roles: [...STAFF_FAMILY] },
  },
];

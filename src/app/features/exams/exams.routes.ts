import { Routes } from '@angular/router';
import { roleGuard } from '../../core/auth/role.guard';

const STAFF = ['admin', 'supervisor', 'teacher'] as const;

export const EXAMS_ROUTES: Routes = [
  {
    path: '',
    loadComponent: () => import('./exams-list.page').then((m) => m.ExamsListPage),
    canActivate: [roleGuard],
    data: { roles: [...STAFF] },
  },
  {
    path: 'new',
    loadComponent: () => import('./exam-new.page').then((m) => m.ExamNewPage),
    canActivate: [roleGuard],
    data: { roles: [...STAFF] },
  },
  {
    path: ':id',
    loadComponent: () => import('./exam-detail.page').then((m) => m.ExamDetailPage),
    canActivate: [roleGuard],
    data: { roles: [...STAFF] },
  },
];

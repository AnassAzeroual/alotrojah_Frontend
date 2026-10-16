import { Routes } from '@angular/router';
import { roleGuard } from '../../core/auth/role.guard';
import { dirtyGuard } from '../../core/guards/dirty.guard';

const STAFF = ['admin', 'supervisor', 'teacher'] as const;
/** Staff manage; pupils may view their own exams (§C3). */
const VIEW = ['admin', 'supervisor', 'teacher', 'student'] as const;

export const EXAMS_ROUTES: Routes = [
  {
    path: '',
    loadComponent: () => import('./exams-list.page').then((m) => m.ExamsListPage),
    canActivate: [roleGuard],
    data: { roles: [...VIEW] },
  },
  {
    path: 'new',
    loadComponent: () => import('./exam-new.page').then((m) => m.ExamNewPage),
    canActivate: [roleGuard],
    canDeactivate: [dirtyGuard],
    data: { roles: [...STAFF] },
  },
  {
    path: 'weekly',
    loadComponent: () => import('./weekly-exam.page').then((m) => m.WeeklyExamPage),
    canActivate: [roleGuard],
    canDeactivate: [dirtyGuard],
    data: { roles: [...STAFF] },
  },
  {
    path: ':id',
    loadComponent: () => import('./exam-detail.page').then((m) => m.ExamDetailPage),
    canActivate: [roleGuard],
    canDeactivate: [dirtyGuard],
    data: { roles: [...VIEW] },
  },
];

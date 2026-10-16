import { Routes } from '@angular/router';
import { roleGuard } from '../../core/auth/role.guard';
import { dirtyGuard } from '../../core/guards/dirty.guard';

const STAFF_FAMILY = ['admin', 'supervisor', 'teacher', 'student'] as const;
const STAFF_ONLY = ['admin', 'supervisor', 'teacher'] as const;

export const STUDENTS_ROUTES: Routes = [
  {
    path: '',
    loadComponent: () => import('./students-list.page').then((m) => m.StudentsListPage),
    canActivate: [roleGuard],
    data: { roles: [...STAFF_FAMILY] },
  },
  {
    path: 'new',
    loadComponent: () => import('./student-detail.page').then((m) => m.StudentDetailPage),
    canActivate: [roleGuard],
    canDeactivate: [dirtyGuard],
    // The static segment binds no params, so the create id rides static data
    // (withComponentInputBinding maps it onto the page's id input — without
    // this the required input throws and the form never renders).
    data: { roles: [...STAFF_ONLY], id: 'new' },
  },
  {
    path: ':id',
    loadComponent: () => import('./student-detail.page').then((m) => m.StudentDetailPage),
    canActivate: [roleGuard],
    canDeactivate: [dirtyGuard],
    data: { roles: [...STAFF_FAMILY] },
  },
];

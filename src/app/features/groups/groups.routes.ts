import { Routes } from '@angular/router';
import { roleGuard } from '../../core/auth/role.guard';

export const GROUPS_ROUTES: Routes = [
  {
    path: '',
    loadComponent: () => import('./groups-list.page').then((m) => m.GroupsListPage),
    canActivate: [roleGuard],
    data: { roles: ['admin', 'supervisor', 'teacher'] },
  },
  {
    path: 'new',
    loadComponent: () => import('./group-form.page').then((m) => m.GroupFormPage),
    canActivate: [roleGuard],
    data: { roles: ['admin', 'supervisor'] },
  },
  {
    path: ':id',
    loadComponent: () => import('./group-detail.page').then((m) => m.GroupDetailPage),
    canActivate: [roleGuard],
    data: { roles: ['admin', 'supervisor', 'teacher'] },
  },
];

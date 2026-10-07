import { Routes } from '@angular/router';
import { roleGuard } from '../../core/auth/role.guard';
import { dirtyGuard } from '../../core/guards/dirty.guard';

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
    canDeactivate: [dirtyGuard],
    data: { roles: ['admin', 'supervisor'] },
  },
  {
    // NOTE: ':id/edit' (two segments) never collides with ':id' (one), but it
    // stays above it so the intent reads top-down. Owner-teachers keep the
    // inline edit on detail — roleGuard cannot check ownership.
    path: ':id/edit',
    loadComponent: () => import('./group-form.page').then((m) => m.GroupFormPage),
    canActivate: [roleGuard],
    canDeactivate: [dirtyGuard],
    data: { roles: ['admin', 'supervisor'] },
  },
  {
    path: ':id',
    loadComponent: () => import('./group-detail.page').then((m) => m.GroupDetailPage),
    canActivate: [roleGuard],
    data: { roles: ['admin', 'supervisor', 'teacher'] },
  },
];

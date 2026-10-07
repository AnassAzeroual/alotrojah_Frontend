import { Routes } from '@angular/router';
import { roleGuard } from '../../core/auth/role.guard';
import { dirtyGuard } from '../../core/guards/dirty.guard';

export const USERS_ROUTES: Routes = [
  {
    path: '',
    loadComponent: () => import('./users-list.page').then((m) => m.UsersListPage),
    canActivate: [roleGuard],
    data: { roles: ['admin', 'supervisor'] },
  },

  {
    path: ':id/replace',
    loadComponent: () => import('./user-replace.page').then((m) => m.UserReplacePage),
    canActivate: [roleGuard],
    data: { roles: ['admin'] },
  },

  {
    path: ':id',
    loadComponent: () => import('./user-detail.page').then((m) => m.UserDetailPage),
    canActivate: [roleGuard],
    canDeactivate: [dirtyGuard],
    data: { roles: ['admin', 'supervisor'] },
  },
];

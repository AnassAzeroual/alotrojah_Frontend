import { Routes } from '@angular/router';
import { roleGuard } from '../../core/auth/role.guard';

export const NOTIFICATIONS_ROUTES: Routes = [
  {
    path: '',
    loadComponent: () => import('./notifications.page').then((m) => m.NotificationsPage),
    canActivate: [roleGuard],
    data: { roles: ['admin', 'supervisor', 'teacher'] },
  },
];

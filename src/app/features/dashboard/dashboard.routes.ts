import { Routes } from '@angular/router';
import { roleGuard } from '../../core/auth/role.guard';

export const DASHBOARD_ROUTES: Routes = [
  {
    path: '',
    loadComponent: () => import('./dashboard.page').then((m) => m.DashboardPage),
    canActivate: [roleGuard],
    data: { roles: ['admin', 'supervisor', 'teacher', 'guardian', 'student', 'board'] },
  },
];

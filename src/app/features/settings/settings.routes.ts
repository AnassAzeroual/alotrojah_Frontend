import { Routes } from '@angular/router';
import { roleGuard } from '../../core/auth/role.guard';

export const SETTINGS_ROUTES: Routes = [
  {
    path: '',
    loadComponent: () => import('./settings.page').then((m) => m.SettingsPage),
    canActivate: [roleGuard],
    data: { roles: ['admin'] },
  },
];

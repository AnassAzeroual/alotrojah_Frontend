import { Routes } from '@angular/router';
import { roleGuard } from '../../core/auth/role.guard';

export const REGISTRATIONS_ROUTES: Routes = [
  {
    path: '',
    loadComponent: () => import('./registrations.page').then((m) => m.RegistrationsPage),
    canActivate: [roleGuard],
    data: { roles: ['admin'] },
  },
];

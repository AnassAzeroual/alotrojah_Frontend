import { Routes } from '@angular/router';
import { roleGuard } from '../../core/auth/role.guard';

export const GUARDIANS_ROUTES: Routes = [
  {
    path: '',
    loadComponent: () => import('./guardians-list.page').then((m) => m.GuardiansListPage),
    canActivate: [roleGuard],
    data: { roles: ['admin', 'supervisor', 'teacher', 'guardian'] },
  },
];

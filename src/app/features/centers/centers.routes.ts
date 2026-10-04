import { Routes } from '@angular/router';
import { roleGuard } from '../../core/auth/role.guard';

export const CENTERS_ROUTES: Routes = [
  {
    path: '',
    loadComponent: () => import('./centers-list.page').then((m) => m.CentersListPage),
    canActivate: [roleGuard],
    data: { roles: ['admin'] },
  },
];

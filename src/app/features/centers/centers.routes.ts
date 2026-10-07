import { Routes } from '@angular/router';
import { roleGuard } from '../../core/auth/role.guard';
import { dirtyGuard } from '../../core/guards/dirty.guard';

export const CENTERS_ROUTES: Routes = [
  {
    path: '',
    loadComponent: () => import('./centers-list.page').then((m) => m.CentersListPage),
    canActivate: [roleGuard],
    canDeactivate: [dirtyGuard],
    data: { roles: ['admin'] },
  },
];

import { Routes } from '@angular/router';
import { roleGuard } from '../../core/auth/role.guard';

export const LEVELS_ROUTES: Routes = [
  {
    path: '',
    loadComponent: () => import('./levels.page').then((m) => m.LevelsPage),
    canActivate: [roleGuard],
    data: { roles: ['admin'] },
  },
];

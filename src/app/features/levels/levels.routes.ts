import { Routes } from '@angular/router';
import { roleGuard } from '../../core/auth/role.guard';
import { dirtyGuard } from '../../core/guards/dirty.guard';

export const LEVELS_ROUTES: Routes = [
  {
    path: '',
    loadComponent: () => import('./levels.page').then((m) => m.LevelsPage),
    canActivate: [roleGuard],
    canDeactivate: [dirtyGuard],
    data: { roles: ['admin'] },
  },
];

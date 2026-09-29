import { Routes } from '@angular/router';
import { roleGuard } from '../../core/auth/role.guard';

export const SCORING_ROUTES: Routes = [
  {
    path: '',
    loadComponent: () => import('./scoring.page').then((m) => m.ScoringPage),
    canActivate: [roleGuard],
    data: { roles: ['admin', 'supervisor'] },
  },
];

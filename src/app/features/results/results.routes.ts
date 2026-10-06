import { Routes } from '@angular/router';
import { roleGuard } from '../../core/auth/role.guard';
import { dirtyGuard } from '../../core/guards/dirty.guard';

const STAFF = ['admin', 'supervisor', 'teacher'] as const;

export const RESULTS_ROUTES: Routes = [
  {
    path: 'term',
    loadComponent: () => import('./term-results.page').then((m) => m.TermResultsPage),
    canActivate: [roleGuard],
    canDeactivate: [dirtyGuard],
    data: { roles: [...STAFF] },
  },
  {
    path: 'season',
    loadComponent: () => import('./season-results.page').then((m) => m.SeasonResultsPage),
    canActivate: [roleGuard],
    canDeactivate: [dirtyGuard],
    data: { roles: [...STAFF] },
  },
  { path: '', pathMatch: 'full', redirectTo: 'term' },
];

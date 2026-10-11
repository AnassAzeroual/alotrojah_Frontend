import { Routes } from '@angular/router';
import { roleGuard } from '../../core/auth/role.guard';
import { dirtyGuard } from '../../core/guards/dirty.guard';

const STAFF = ['admin', 'supervisor', 'teacher'] as const;
/** Staff manage; pupils may view their own term result (§C3). */
const VIEW = ['admin', 'supervisor', 'teacher', 'student'] as const;

export const RESULTS_ROUTES: Routes = [
  {
    path: 'term',
    loadComponent: () => import('./term-results.page').then((m) => m.TermResultsPage),
    canActivate: [roleGuard],
    canDeactivate: [dirtyGuard],
    data: { roles: [...VIEW] },
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

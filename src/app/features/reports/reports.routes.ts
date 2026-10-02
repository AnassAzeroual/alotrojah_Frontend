import { Routes } from '@angular/router';
import { roleGuard } from '../../core/auth/role.guard';

const STAFF = ['admin', 'supervisor', 'teacher'] as const;

export const REPORTS_ROUTES: Routes = [
  {
    path: 'term',
    loadComponent: () => import('./term-report.page').then((m) => m.TermReportPage),
    canActivate: [roleGuard],
    data: { roles: [...STAFF] },
  },
  {
    path: 'season',
    loadComponent: () => import('./season-report.page').then((m) => m.SeasonReportPage),
    canActivate: [roleGuard],
    data: { roles: [...STAFF, 'student'] },
  },
  { path: '', pathMatch: 'full', redirectTo: 'term' },
];

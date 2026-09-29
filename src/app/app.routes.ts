import { Routes } from '@angular/router';
import { roleGuard } from './core/auth/role.guard';

export const routes: Routes = [
  {
    path: 'login',
    loadComponent: () => import('./features/auth/login.page').then((m) => m.LoginPage),
  },
  {
    path: '',
    loadComponent: () => import('./core/layout/shell.component').then((m) => m.ShellComponent),
    canActivate: [roleGuard],
    children: [
      {
        path: '',
        loadComponent: () => import('./features/dashboard/home.page').then((m) => m.HomePage),
      },
      {
        path: 'entry',
        loadChildren: () => import('./features/entry/entry.routes').then((m) => m.ENTRY_ROUTES),
      },
      {
        path: 'students',
        loadChildren: () => import('./features/students/students.routes').then((m) => m.STUDENTS_ROUTES),
      },
      {
        path: 'groups',
        loadChildren: () => import('./features/groups/groups.routes').then((m) => m.GROUPS_ROUTES),
      },
      {
        path: 'guardians',
        loadChildren: () => import('./features/guardians/guardians.routes').then((m) => m.GUARDIANS_ROUTES),
      },
      {
        path: 'planning',
        loadChildren: () => import('./features/planning/planning.routes').then((m) => m.PLANNING_ROUTES),
      },
      {
        path: 'scoring',
        loadChildren: () => import('./features/scoring/scoring.routes').then((m) => m.SCORING_ROUTES),
      },
      {
        path: 'exams',
        loadChildren: () => import('./features/exams/exams.routes').then((m) => m.EXAMS_ROUTES),
      },
      {
        path: 'reviews',
        loadChildren: () => import('./features/reviews/reviews.routes').then((m) => m.REVIEWS_ROUTES),
      },
      {
        path: 'results',
        loadChildren: () => import('./features/results/results.routes').then((m) => m.RESULTS_ROUTES),
      },
      {
        path: 'reports',
        loadChildren: () => import('./features/reports/reports.routes').then((m) => m.REPORTS_ROUTES),
      },
      // F10 append feature routes here
    ],
  },
  { path: '**', redirectTo: '' },
];

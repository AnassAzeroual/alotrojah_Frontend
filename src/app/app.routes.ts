import { Routes } from '@angular/router';
import { roleGuard } from './core/auth/role.guard';

export const routes: Routes = [
  {
    path: 'login',
    loadComponent: () => import('./features/auth/login.page').then((m) => m.LoginPage),
  },
  {
    path: 'register',
    loadComponent: () => import('./features/auth/register.page').then((m) => m.RegisterPage),
  },
  {
    path: '',
    loadComponent: () => import('./core/layout/shell.component').then((m) => m.ShellComponent),
    canActivate: [roleGuard],
    children: [
      {
        path: '',
        loadChildren: () =>
          import('./features/dashboard/dashboard.routes').then((m) => m.DASHBOARD_ROUTES),
      },
      {
        path: 'entry',
        loadChildren: () => import('./features/entry/entry.routes').then((m) => m.ENTRY_ROUTES),
      },
      {
        path: 'students',
        loadChildren: () =>
          import('./features/students/students.routes').then((m) => m.STUDENTS_ROUTES),
      },
      {
        path: 'groups',
        loadChildren: () => import('./features/groups/groups.routes').then((m) => m.GROUPS_ROUTES),
      },
      {
        path: 'planning',
        loadChildren: () =>
          import('./features/planning/planning.routes').then((m) => m.PLANNING_ROUTES),
      },
      {
        path: 'scoring',
        loadChildren: () =>
          import('./features/scoring/scoring.routes').then((m) => m.SCORING_ROUTES),
      },
      {
        path: 'exams',
        loadChildren: () => import('./features/exams/exams.routes').then((m) => m.EXAMS_ROUTES),
      },
      {
        path: 'reviews',
        loadChildren: () =>
          import('./features/reviews/reviews.routes').then((m) => m.REVIEWS_ROUTES),
      },
      {
        path: 'results',
        loadChildren: () =>
          import('./features/results/results.routes').then((m) => m.RESULTS_ROUTES),
      },
      {
        path: 'reports',
        loadChildren: () =>
          import('./features/reports/reports.routes').then((m) => m.REPORTS_ROUTES),
      },
      {
        path: 'news',
        loadChildren: () => import('./features/news/news.routes').then((m) => m.NEWS_ROUTES),
      },
      {
        path: 'delegate',
        loadChildren: () =>
          import('./features/delegate/delegate.routes').then((m) => m.DELEGATE_ROUTES),
      },
      {
        path: 'notifications',
        loadChildren: () =>
          import('./features/notifications/notifications.routes').then(
            (m) => m.NOTIFICATIONS_ROUTES,
          ),
      },
      {
        path: 'registrations',
        loadChildren: () =>
          import('./features/registrations/registrations.routes').then(
            (m) => m.REGISTRATIONS_ROUTES,
          ),
      },
      {
        path: 'dashboard',
        loadChildren: () =>
          import('./features/dashboard/dashboard.routes').then((m) => m.DASHBOARD_ROUTES),
      },
      {
        path: 'users',
        loadChildren: () => import('./features/users/users.routes').then((m) => m.USERS_ROUTES),
      },
      {
        path: 'centers',
        loadChildren: () =>
          import('./features/centers/centers.routes').then((m) => m.CENTERS_ROUTES),
      },
      {
        path: 'levels',
        loadChildren: () => import('./features/levels/levels.routes').then((m) => m.LEVELS_ROUTES),
      },
      // F11+ append feature routes here
    ],
  },
  { path: '**', redirectTo: '' },
];

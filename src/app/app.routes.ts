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
      // F7+ append feature routes here
    ],
  },
  { path: '**', redirectTo: '' },
];

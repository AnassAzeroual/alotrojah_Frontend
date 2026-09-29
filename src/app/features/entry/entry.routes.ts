import { Routes } from '@angular/router';
import { roleGuard } from '../../core/auth/role.guard';

export const ENTRY_ROUTES: Routes = [
  {
    path: '',
    loadComponent: () => import('./entry.page').then((m) => m.EntryPage),
    canActivate: [roleGuard],
    data: { roles: ['admin', 'supervisor', 'teacher'] },
  },
];

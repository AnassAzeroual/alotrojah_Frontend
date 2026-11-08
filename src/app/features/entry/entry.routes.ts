import { Routes } from '@angular/router';
import { roleGuard } from '../../core/auth/role.guard';

export const ENTRY_ROUTES: Routes = [
  {
    path: '',
    loadComponent: () => import('../workspace/workspace.page').then((m) => m.WorkspacePage),
    canActivate: [roleGuard],
    data: { roles: ['admin', 'supervisor', 'teacher'] },
  },
];

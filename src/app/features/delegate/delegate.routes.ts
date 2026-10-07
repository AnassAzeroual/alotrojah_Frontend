import { Routes } from '@angular/router';
import { roleGuard } from '../../core/auth/role.guard';
import { dirtyGuard } from '../../core/guards/dirty.guard';

export const DELEGATE_ROUTES: Routes = [
  {
    path: '',
    loadComponent: () => import('./delegate.page').then((m) => m.DelegatePage),
    canActivate: [roleGuard],
    canDeactivate: [dirtyGuard],
    data: { roles: ['admin', 'supervisor', 'teacher'] },
  },
  {
    path: 'redeem',
    loadComponent: () => import('./redeem.page').then((m) => m.RedeemPage),
  },
];

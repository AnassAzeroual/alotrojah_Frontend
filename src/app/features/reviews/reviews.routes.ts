import { Routes } from '@angular/router';
import { roleGuard } from '../../core/auth/role.guard';
import { dirtyGuard } from '../../core/guards/dirty.guard';

export const REVIEWS_ROUTES: Routes = [
  {
    path: '',
    loadComponent: () => import('./reviews.page').then((m) => m.ReviewsPage),
    canActivate: [roleGuard],
    canDeactivate: [dirtyGuard],
    data: { roles: ['admin', 'supervisor', 'teacher'] },
  },
];

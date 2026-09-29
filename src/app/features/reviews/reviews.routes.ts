import { Routes } from '@angular/router';
import { roleGuard } from '../../core/auth/role.guard';

export const REVIEWS_ROUTES: Routes = [
  {
    path: '',
    loadComponent: () => import('./reviews.page').then((m) => m.ReviewsPage),
    canActivate: [roleGuard],
    data: { roles: ['admin', 'supervisor', 'teacher'] },
  },
];

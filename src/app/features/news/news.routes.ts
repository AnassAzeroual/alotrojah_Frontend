import { Routes } from '@angular/router';
import { roleGuard } from '../../core/auth/role.guard';

export const NEWS_ROUTES: Routes = [
  {
    path: '',
    loadComponent: () => import('./news.page').then((m) => m.NewsPage),
    canActivate: [roleGuard],
    data: { roles: ['admin', 'supervisor', 'teacher', 'guardian', 'student', 'board'] },
  },
];

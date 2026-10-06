import { Routes } from '@angular/router';
import { roleGuard } from '../../core/auth/role.guard';
import { dirtyGuard } from '../../core/guards/dirty.guard';

export const NEWS_ROUTES: Routes = [
  {
    path: '',
    loadComponent: () => import('./news.page').then((m) => m.NewsPage),
    canActivate: [roleGuard],
    canDeactivate: [dirtyGuard],
    data: { roles: ['admin', 'supervisor', 'teacher', 'student', 'board'] },
  },
];

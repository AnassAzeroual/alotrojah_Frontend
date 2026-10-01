import { HttpErrorResponse, HttpInterceptorFn } from '@angular/common/http';
import { inject } from '@angular/core';
import { Router } from '@angular/router';
import { catchError, switchMap, throwError } from 'rxjs';
import { AuthService } from './auth.service';

/** Attaches JWT everywhere except login (dual header: host strips Authorization, X-Auth-Token survives); on 401 tries one silent refresh, then logs out. */
export const authInterceptor: HttpInterceptorFn = (req, next) => {
  const auth = inject(AuthService);
  const router = inject(Router);
  const token = auth.token();
  const isLogin = req.url.includes('/auth/login');
  const isRefresh = req.url.includes('/auth/refresh');

  const withToken = (r: typeof req, t: string): typeof req =>
    r.clone({ setHeaders: { Authorization: `Bearer ${t}`, 'X-Auth-Token': `Bearer ${t}` } });

  const out = token && !isLogin ? withToken(req, token) : req;

  return next(out).pipe(
    catchError((err: unknown) => {
      if (!(err instanceof HttpErrorResponse) || err.status !== 401 || isLogin || isRefresh) {
        if (err instanceof HttpErrorResponse && err.status === 401 && !isLogin) {
          auth.clearLocal();
          void router.navigate(['/login']);
        }
        return throwError(() => err);
      }
      return auth.refreshOnce().pipe(
        switchMap((nt) => next(withToken(req, nt))),
        catchError((refreshErr: unknown) => {
          auth.clearLocal();
          void router.navigate(['/login']);
          return throwError(() => refreshErr);
        }),
      );
    }),
  );
};

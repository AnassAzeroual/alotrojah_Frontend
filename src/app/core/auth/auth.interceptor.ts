import { HttpErrorResponse, HttpInterceptorFn } from '@angular/common/http';
import { inject } from '@angular/core';
import { Router } from '@angular/router';
import { catchError, switchMap, throwError } from 'rxjs';
import { AuthService } from './auth.service';

/** Attaches JWT everywhere except login; on 401 tries one silent refresh, then logs out. */
export const authInterceptor: HttpInterceptorFn = (req, next) => {
  const auth = inject(AuthService);
  const router = inject(Router);
  const token = auth.token();
  const isLogin = req.url.includes('/auth/login');
  const isRefresh = req.url.includes('/auth/refresh');

  const out =
    token && !isLogin ? req.clone({ setHeaders: { Authorization: `Bearer ${token}` } }) : req;

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
        switchMap((nt) => next(req.clone({ setHeaders: { Authorization: `Bearer ${nt}` } }))),
        catchError((refreshErr: unknown) => {
          auth.clearLocal();
          void router.navigate(['/login']);
          return throwError(() => refreshErr);
        }),
      );
    }),
  );
};

import { HttpErrorResponse, HttpInterceptorFn } from '@angular/common/http';
import { inject } from '@angular/core';
import { Router } from '@angular/router';
import { catchError, switchMap, throwError } from 'rxjs';
import { AuthService } from './auth.service';

/** Attaches JWT; on 401 tries one silent refresh, then logs out. Auth routes excluded. */
export const authInterceptor: HttpInterceptorFn = (req, next) => {
  const auth = inject(AuthService);
  const router = inject(Router);
  const token = auth.token();
  const isAuthRoute = req.url.includes('/auth/');

  const out =
    token && !isAuthRoute ? req.clone({ setHeaders: { Authorization: `Bearer ${token}` } }) : req;

  return next(out).pipe(
    catchError((err: unknown) => {
      if (!(err instanceof HttpErrorResponse) || err.status !== 401 || isAuthRoute) {
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

import { HttpErrorResponse, HttpInterceptorFn } from '@angular/common/http';
import { inject } from '@angular/core';
import { catchError, throwError } from 'rxjs';
import { AppDialogService } from '../../shared/ui/app-dialog/app-dialog.service';
import { apiErrorCode, apiErrorKey } from './api-errors';

/**
 * Global API-error surface: every backend failure becomes ONE translated CDK
 * dialog. Registered after authInterceptor, so errors reach this catchError
 * first; 401s are skipped here entirely — the auth interceptor owns them
 * (silent refresh, then logout) — EXCEPT the login route itself, whose 401 is
 * the backend's generic "invalid credentials / deactivated" answer and has no
 * session to refresh. NEED_REPLACER is skipped too: the users page answers
 * that 422 with its own replacer dialog, and stacking the global one on top
 * would leave its backdrop swallowing the replacer UI's clicks. Errors are
 * always rethrown so call sites keep their busy-flag resets; pages no longer
 * render inline banners for server failures. Only one dialog at a time: while
 * open, further errors pass through silently (the visible dialog still
 * describes the failure class).
 */
let dialogOpen = false;

export const errorInterceptor: HttpInterceptorFn = (req, next) => {
  const dialogs = inject(AppDialogService);
  return next(req).pipe(
    catchError((err: unknown) => {
      const isLogin401 =
        err instanceof HttpErrorResponse &&
        err.status === 401 &&
        (err.url?.endsWith('/auth/login') ?? false);
      const handledByPage = apiErrorCode(err) === 'NEED_REPLACER';
      if (
        err instanceof HttpErrorResponse &&
        !dialogOpen &&
        !handledByPage &&
        (err.status !== 401 || isLogin401)
      ) {
        dialogOpen = true;
        dialogs.alert('common.error_title', apiErrorKey(err)).subscribe({
          next: () => (dialogOpen = false),
          complete: () => (dialogOpen = false),
        });
      }
      return throwError(() => err);
    }),
  );
};

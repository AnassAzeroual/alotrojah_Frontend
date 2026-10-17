import { Injectable, inject } from '@angular/core';
import { Dialog } from '@angular/cdk/dialog';
import { Observable, map } from 'rxjs';
import { AppDialogComponent, AppDialogData } from './app-dialog.component';

/**
 * App-wide entry point for the shared CDK dialog. `confirm` resolves true on
 * confirm, false on cancel / ESC / backdrop click (afterClosed emits
 * undefined → coerced to false). Escalating to the dialog layer keeps every
 * page's guard/error messaging untestable-free of window.confirm and
 * untranslated strings.
 */
@Injectable({ providedIn: 'root' })
export class AppDialogService {
  private readonly dialog = inject(Dialog);

  confirm(data: AppDialogData): Observable<boolean> {
    return this.dialog
      .open<boolean>(AppDialogComponent, {
        data,
        backdropClass: 'app-dialog-backdrop',
        panelClass: 'app-dialog-panel',
        maxWidth: '92vw',
      })
      .closed.pipe(map((v) => v === true));
  }

  /** One-action error surface (e.g. a failed server write). */
  alert(titleKey: string, messageKey: string): Observable<boolean> {
    return this.confirm({ titleKey, messageKey, confirmKey: 'common.ok' });
  }
}

import { Injectable, inject } from '@angular/core';
import { Dialog } from '@angular/cdk/dialog';
import { Overlay } from '@angular/cdk/overlay';
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
  private readonly overlay = inject(Overlay);

  confirm(data: AppDialogData): Observable<boolean> {
    return this.dialog
      .open<boolean>(AppDialogComponent, {
        data,
        // Let CDK own the geometry so RTL pages cannot shift the panel.
        positionStrategy: this.overlay.position().global().centerHorizontally().centerVertically(),
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

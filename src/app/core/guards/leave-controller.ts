import { inject } from '@angular/core';
import { Observable } from 'rxjs';
import { AppDialogService } from '../../shared/ui/app-dialog/app-dialog.service';

/**
 * Dirty-form leave confirmation. Pages expose `isDirty` (reactive form or
 * draft signals) plus the shared `leave` controller. When the dirty guard
 * fires, `confirmLeave` opens the shared CDK dialog (translated, themed,
 * RTL-safe); the observable resolves true on "leave" and false on
 * cancel/ESC/backdrop. No inline banners, no window.confirm.
 */
export interface DirtyPage {
  isDirty(): boolean;
  readonly leave: LeaveController;
}

export interface LeaveController {
  confirmLeave: () => Observable<boolean>;
}

export function leaveController(): LeaveController {
  const appDialog = inject(AppDialogService);
  return {
    confirmLeave: () =>
      appDialog.confirm({
        titleKey: 'common.unsaved_title',
        messageKey: 'common.unsaved_warn',
        confirmKey: 'common.unsaved_leave',
        cancelKey: 'common.cancel',
        danger: true,
      }),
  };
}

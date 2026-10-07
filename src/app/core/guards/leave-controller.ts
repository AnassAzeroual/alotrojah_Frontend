import { signal } from '@angular/core';
import { Observable } from 'rxjs';

/**
 * Dirty-form leave confirmation. Pages expose `isDirty` (reactive form or
 * draft signals) plus the shared `leave` controller, whose `leaving` flag the
 * template renders as an inline arm→confirm banner (no window.confirm —
 * untestable and untranslatable).
 */
export interface DirtyPage {
  isDirty(): boolean;
  readonly leave: LeaveController;
}

export interface LeaveController {
  readonly leaving: ReturnType<typeof signal<boolean>>;
  confirmLeave: () => Observable<boolean>;
  allowLeave: () => void;
  stay: () => void;
}

export function leaveController(): LeaveController {
  const leaving = signal(false);
  let resolve: ((v: boolean) => void) | null = null;
  const done = (v: boolean): void => {
    leaving.set(false);
    resolve?.(v);
    resolve = null;
  };
  return {
    leaving,
    confirmLeave: () =>
      new Observable<boolean>((sub) => {
        leaving.set(true);
        resolve = (v: boolean) => {
          sub.next(v);
          sub.complete();
        };
      }),
    allowLeave: () => done(true),
    stay: () => done(false),
  };
}

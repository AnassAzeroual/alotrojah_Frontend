import { CanDeactivateFn } from '@angular/router';
import { DirtyPage } from './leave-controller';

/**
 * Blocks route leave while a page reports unsaved changes; the page itself
 * renders the confirm banner through `leave.leaving`. Pristine pages (and
 * all e2e navigations on them) pass through untouched.
 */
export const dirtyGuard: CanDeactivateFn<DirtyPage> = (component) => {
  if (!component.isDirty()) return true;
  return component.leave.confirmLeave();
};

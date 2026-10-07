import { HttpErrorResponse } from '@angular/common/http';

/**
 * Translates API failures (Item 7). Backend `fail()` attaches a stable
 * `errors.code` (string, or string[] from validation bags — first wins);
 * field-token bags (`email_taken`, `in_waiting_room`) map directly.
 * Unknown shapes fall back by status, then `common.error`.
 */
export const API_ERROR_CODES = [
  'CROSS_CENTER',
  'ADMIN_ONLY',
  'OWN_STUDENTS',
  'NEED_REPLACER',
  'REPLACER_SELF',
  'REPLACER_INACTIVE',
  'REPLACER_CENTER',
  'REPLACER_TYPE',
  'REPLACER_BUSY',
  'WEIGHTS_TOTAL',
  'WEIGHTS_FOREIGN',
  'SCORE_OVER_MAX',
  'SEASON_HAS_FACTS',
  'MODULE_HAS_SCORES',
  'LEVEL_IN_USE',
  'TERM_REQUIRED',
  'SPAN_INVALID',
  'RANGE_INVALID',
  'GROUP_ROLE',
  'PLACEMENT_REQUIRED',
  'SCORING_TOTAL',
  'INVALID_CREDENTIALS',
  'ADMIN_DELETE',
  'ADMIN_SELF_DISABLE',
  'ADMIN_LAST_ACTIVE',
] as const;

export function apiErrorKey(err: unknown): string {
  if (err instanceof HttpErrorResponse) {
    const body = (err.error ?? {}) as { errors?: Record<string, unknown> | null };
    const errors = body.errors;
    if (errors && typeof errors === 'object') {
      const raw = (errors as Record<string, unknown>)['code'];
      const code = Array.isArray(raw) ? raw[0] : raw;
      if (typeof code === 'string' && (API_ERROR_CODES as readonly string[]).includes(code)) {
        return `apiErrors.${code}`;
      }
      const flat = Object.values(errors).flat(3);
      if (flat.includes('email_taken')) return 'auth.email_taken';
      if (flat.includes('in_waiting_room')) return 'auth.in_waiting_room';
      if ('email' in errors) return 'auth.email_taken';
    }
    if (err.status === 422) return 'apiErrors.validation';
    if (err.status === 403) return 'apiErrors.forbidden';
    if (err.status === 404) return 'apiErrors.notFound';
    if (err.status >= 500) return 'apiErrors.server';
    return 'common.error';
  }
  return 'common.error';
}

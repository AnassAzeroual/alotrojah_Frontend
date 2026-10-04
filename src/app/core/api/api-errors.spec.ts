import { HttpErrorResponse } from '@angular/common/http';
import { apiErrorKey } from './api-errors';

function httpError(status: number, body: unknown): HttpErrorResponse {
  return new HttpErrorResponse({ status, url: '/api/v1/x', error: body });
}

describe('apiErrorKey', () => {
  it('maps backend codes to apiErrors keys', () => {
    expect(apiErrorKey(httpError(422, { errors: { code: 'WEIGHTS_TOTAL' } }))).toBe(
      'apiErrors.WEIGHTS_TOTAL',
    );
    // validation bags carry the code as an array — first wins
    expect(apiErrorKey(httpError(422, { errors: { code: ['NEED_REPLACER'] } }))).toBe(
      'apiErrors.NEED_REPLACER',
    );
  });

  it('maps field-token bags to auth keys', () => {
    expect(apiErrorKey(httpError(422, { errors: { email: ['email_taken'] } }))).toBe(
      'auth.email_taken',
    );
    expect(apiErrorKey(httpError(422, { errors: { email: ['in_waiting_room'] } }))).toBe(
      'auth.in_waiting_room',
    );
    // duplicate email via standard validation (English message, no code)
    expect(
      apiErrorKey(httpError(422, { errors: { email: ['The email has already been taken.'] } })),
    ).toBe('auth.email_taken');
  });

  it('falls back by status, then common.error', () => {
    expect(apiErrorKey(httpError(422, { errors: { name: ['required'] } }))).toBe(
      'apiErrors.validation',
    );
    expect(apiErrorKey(httpError(403, { errors: { code: 'NOPE' } }))).toBe('apiErrors.forbidden');
    expect(apiErrorKey(httpError(404, null))).toBe('apiErrors.notFound');
    expect(apiErrorKey(httpError(500, null))).toBe('apiErrors.server');
    expect(apiErrorKey(new Error('boom'))).toBe('common.error');
  });
});

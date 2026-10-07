import { provideHttpClient } from '@angular/common/http';
import { HttpTestingController, provideHttpClientTesting } from '@angular/common/http/testing';
import { TestBed } from '@angular/core/testing';
import { vi } from 'vitest';
import { environment } from '../../../environments/environment';
import { ApiClient, E2E_CACHE_BYPASS_KEY } from './api-client';

describe('ApiClient', () => {
  let client: ApiClient;
  let http: HttpTestingController;

  beforeEach(() => {
    localStorage.clear();
    TestBed.configureTestingModule({
      providers: [provideHttpClient(), provideHttpClientTesting()],
    });
    client = TestBed.inject(ApiClient);
    http = TestBed.inject(HttpTestingController);
  });

  afterEach(() => {
    vi.restoreAllMocks();
    http.verify();
  });

  it('unwraps the envelope', () => {
    client.get<{ a: number }>('/x').subscribe((v) => expect(v).toEqual({ a: 1 }));
    const req = http.expectOne((r) => r.url.endsWith('/x'));
    expect(req.request.method).toBe('GET');
    req.flush({ success: true, message: null, data: { a: 1 } });
  });

  it('serializes query params as strings', () => {
    client.get('/y', { a: 1, b: 'x', c: true }).subscribe();
    const req = http.expectOne(
      (r) => r.params.get('a') === '1' && r.params.get('b') === 'x' && r.params.get('c') === 'true',
    );
    req.flush({ success: true, message: null, data: [] });
  });

  it('posts bodies through the envelope', () => {
    client.post('/z', { k: 1 }).subscribe((v) => expect(v).toEqual({ ok: true }));
    const req = http.expectOne((r) => r.url.endsWith('/z'));
    expect(req.request.method).toBe('POST');
    expect(req.request.body).toEqual({ k: 1 });
    req.flush({ success: true, message: null, data: { ok: true } });
  });

  it('serves a repeated GET from the cache within the TTL', () => {
    client.get('/x').subscribe((v) => expect(v).toEqual({ a: 1 }));
    http
      .expectOne((r) => r.url.endsWith('/x'))
      .flush({ success: true, message: null, data: { a: 1 } });

    client.get('/x').subscribe((v) => expect(v).toEqual({ a: 1 }));
    http.expectNone((r) => r.url.endsWith('/x'));
  });

  it('refetches a GET after the TTL expires', () => {
    const now = vi.spyOn(Date, 'now');
    const t0 = 1_000_000;
    now.mockReturnValue(t0);

    client.get('/x').subscribe();
    http.expectOne((r) => r.url.endsWith('/x')).flush({ success: true, message: null, data: 1 });

    now.mockReturnValue(t0 + environment.httpCacheTtlMs + 1);
    client.get('/x').subscribe();
    http.expectOne((r) => r.url.endsWith('/x')).flush({ success: true, message: null, data: 2 });
  });

  it('treats different query params as different cache keys', () => {
    client.get('/x', { page: 1 }).subscribe();
    http.expectOne((r) => r.url.endsWith('/x')).flush({ success: true, message: null, data: 1 });

    client.get('/x', { page: 2 }).subscribe();
    const req = http.expectOne((r) => r.url.endsWith('/x'));
    expect(req.request.params.get('page')).toBe('2');
    req.flush({ success: true, message: null, data: 2 });
  });

  it('invalidates the cache on a mutation (post)', () => {
    client.get('/x').subscribe();
    http.expectOne((r) => r.url.endsWith('/x')).flush({ success: true, message: null, data: 1 });

    client.post('/z', { k: 1 }).subscribe();
    http.expectOne((r) => r.url.endsWith('/z')).flush({ success: true, message: null, data: null });

    client.get('/x').subscribe();
    http.expectOne((r) => r.url.endsWith('/x')).flush({ success: true, message: null, data: 2 });
  });

  it('invalidates the cache on delete', () => {
    client.get('/x').subscribe();
    http.expectOne((r) => r.url.endsWith('/x')).flush({ success: true, message: null, data: 1 });

    client.delete('/z').subscribe();
    http.expectOne((r) => r.url.endsWith('/z')).flush({ success: true, message: null, data: null });

    client.get('/x').subscribe();
    http.expectOne((r) => r.url.endsWith('/x')).flush({ success: true, message: null, data: 2 });
  });

  it('does not cache a failed GET', () => {
    client.get('/x').subscribe({ error: () => undefined });
    http
      .expectOne((r) => r.url.endsWith('/x'))
      .flush({ success: false, message: 'boom' }, { status: 500, statusText: 'err' });

    client.get('/x').subscribe();
    http.expectOne((r) => r.url.endsWith('/x')).flush({ success: true, message: null, data: 2 });
  });

  it('bypasses the cache when the e2e flag is set', () => {
    localStorage.setItem(E2E_CACHE_BYPASS_KEY, '1');

    client.get('/x').subscribe();
    http.expectOne((r) => r.url.endsWith('/x')).flush({ success: true, message: null, data: 1 });

    client.get('/x').subscribe();
    http.expectOne((r) => r.url.endsWith('/x')).flush({ success: true, message: null, data: 2 });
  });

  it('exposes clearCache for session teardown', () => {
    client.get('/x').subscribe();
    http.expectOne((r) => r.url.endsWith('/x')).flush({ success: true, message: null, data: 1 });

    client.clearCache();

    client.get('/x').subscribe();
    http.expectOne((r) => r.url.endsWith('/x')).flush({ success: true, message: null, data: 2 });
  });
});

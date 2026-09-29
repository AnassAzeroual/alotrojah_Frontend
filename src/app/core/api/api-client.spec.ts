import { provideHttpClient } from '@angular/common/http';
import { HttpTestingController, provideHttpClientTesting } from '@angular/common/http/testing';
import { TestBed } from '@angular/core/testing';
import { ApiClient } from './api-client';

describe('ApiClient', () => {
  let client: ApiClient;
  let http: HttpTestingController;

  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [provideHttpClient(), provideHttpClientTesting()],
    });
    client = TestBed.inject(ApiClient);
    http = TestBed.inject(HttpTestingController);
  });

  afterEach(() => http.verify());

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
});

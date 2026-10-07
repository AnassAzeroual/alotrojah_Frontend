import { HttpClient, HttpParams } from '@angular/common/http';
import { inject, Injectable } from '@angular/core';
import { finalize, map, Observable, shareReplay, tap } from 'rxjs';
import { environment } from '../../../environments/environment';
import { ApiResponse } from './api-models';

export type QueryParams = Record<string, string | number | boolean>;

/**
 * Set to '1' before the app boots to disable the GET cache. Seeded into every
 * e2e browser context by playwright.config.ts storageState (the config can't
 * import this file — Angular deps — so the key literal must stay in sync).
 */
export const E2E_CACHE_BYPASS_KEY = 'alotrojah_e2e_no_http_cache';

interface CacheEntry {
  expires: number;
  data$: Observable<unknown>;
}

function cacheKey(path: string, params?: QueryParams): string {
  if (!params) return path;
  const qs = Object.entries(params)
    .sort(([a], [b]) => (a < b ? -1 : a > b ? 1 : 0))
    .map(([k, v]) => `${k}=${String(v)}`)
    .join('&');
  return `${path}?${qs}`;
}

/**
 * Single choke point for all backend calls. Unwraps the {success,message,data}
 * envelope. GETs are cached per (path, params) for `httpCacheTtlMs`; any
 * mutation (post/put/patch/delete) invalidates the whole cache so list views
 * never serve pre-mutation data.
 */
@Injectable({ providedIn: 'root' })
export class ApiClient {
  private readonly http = inject(HttpClient);
  private readonly base = environment.apiUrl;
  /** A missing or ≤0 TTL in an environment file disables caching (fail open). */
  private readonly cacheTtlMs = environment.httpCacheTtlMs ?? 0;
  private readonly entries = new Map<string, CacheEntry>();

  private get cacheBypassed(): boolean {
    return this.cacheTtlMs <= 0 || globalThis.localStorage?.getItem(E2E_CACHE_BYPASS_KEY) === '1';
  }

  get<T>(path: string, params?: QueryParams): Observable<T> {
    if (this.cacheBypassed) return this.rawGet(path, params);
    const key = cacheKey(path, params);
    const now = Date.now();
    const hit = this.entries.get(key);
    if (hit) {
      if (hit.expires > now) return hit.data$ as Observable<T>;
      this.entries.delete(key);
    }
    const data$ = this.rawGet<T>(path, params).pipe(
      tap({ error: () => this.entries.delete(key) }),
      shareReplay(1),
    );
    this.entries.set(key, { expires: now + this.cacheTtlMs, data$ });
    return data$;
  }

  post<T>(path: string, body: unknown): Observable<T> {
    return this.http.post<ApiResponse<T>>(`${this.base}${path}`, body).pipe(
      map((r) => r.data),
      finalize(() => this.entries.clear()),
    );
  }

  put<T>(path: string, body: unknown): Observable<T> {
    return this.http.put<ApiResponse<T>>(`${this.base}${path}`, body).pipe(
      map((r) => r.data),
      finalize(() => this.entries.clear()),
    );
  }

  patch<T>(path: string, body: unknown): Observable<T> {
    return this.http.patch<ApiResponse<T>>(`${this.base}${path}`, body).pipe(
      map((r) => r.data),
      finalize(() => this.entries.clear()),
    );
  }

  delete<T>(path: string, params?: QueryParams): Observable<T> {
    return this.http
      .delete<ApiResponse<T>>(`${this.base}${path}`, { params: this.toHttpParams(params) })
      .pipe(
        map((r) => r.data),
        finalize(() => this.entries.clear()),
      );
  }

  /** Drops every cached GET. Called by any mutation and on session teardown (AuthService.clearLocal). */
  clearCache(): void {
    this.entries.clear();
  }

  private rawGet<T>(path: string, params?: QueryParams): Observable<T> {
    return this.http
      .get<ApiResponse<T>>(`${this.base}${path}`, { params: this.toHttpParams(params) })
      .pipe(map((r) => r.data));
  }

  private toHttpParams(params?: QueryParams): HttpParams | undefined {
    if (!params) return undefined;
    let httpParams = new HttpParams();
    for (const [k, v] of Object.entries(params)) httpParams = httpParams.set(k, String(v));
    return httpParams;
  }
}

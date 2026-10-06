import { HttpClient, HttpParams } from '@angular/common/http';
import { inject, Injectable } from '@angular/core';
import { map, Observable } from 'rxjs';
import { environment } from '../../../environments/environment';
import { ApiResponse } from './api-models';

export type QueryParams = Record<string, string | number | boolean>;

/** Single choke point for all backend calls. Unwraps the {success,message,data} envelope. */
@Injectable({ providedIn: 'root' })
export class ApiClient {
  private readonly http = inject(HttpClient);
  private readonly base = environment.apiUrl;

  get<T>(path: string, params?: QueryParams): Observable<T> {
    let httpParams: HttpParams | undefined;
    if (params) {
      httpParams = new HttpParams();
      for (const [k, v] of Object.entries(params)) httpParams = httpParams.set(k, String(v));
    }
    return this.http
      .get<ApiResponse<T>>(`${this.base}${path}`, { params: httpParams })
      .pipe(map((r) => r.data));
  }

  post<T>(path: string, body: unknown): Observable<T> {
    return this.http.post<ApiResponse<T>>(`${this.base}${path}`, body).pipe(map((r) => r.data));
  }

  put<T>(path: string, body: unknown): Observable<T> {
    return this.http.put<ApiResponse<T>>(`${this.base}${path}`, body).pipe(map((r) => r.data));
  }

  patch<T>(path: string, body: unknown): Observable<T> {
    return this.http.patch<ApiResponse<T>>(`${this.base}${path}`, body).pipe(map((r) => r.data));
  }

  delete<T>(path: string, params?: QueryParams): Observable<T> {
    let httpParams: HttpParams | undefined;
    if (params) {
      httpParams = new HttpParams();
      for (const [k, v] of Object.entries(params)) httpParams = httpParams.set(k, String(v));
    }
    return this.http
      .delete<ApiResponse<T>>(`${this.base}${path}`, { params: httpParams })
      .pipe(map((r) => r.data));
  }
}

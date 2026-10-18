import { inject, Injectable } from '@angular/core';
import { EMPTY, expand, Observable, reduce } from 'rxjs';
import { ApiClient } from './api-client';
import {
  CenterResource,
  CentersIndexResponse,
  StoreCenterRequest,
  UpdateCenterRequest,
} from './models';

@Injectable({ providedIn: 'root' })
export class CentersService {
  private readonly api = inject(ApiClient);

  list(page?: number): Observable<CentersIndexResponse['data']> {
    return this.api.get<CentersIndexResponse['data']>(
      '/centers',
      page && page > 1 ? { page } : undefined,
    );
  }

  /** Walks every page — the appearance center picker cannot be limited to page 1. */
  listAll(): Observable<CenterResource[]> {
    return this.list().pipe(
      expand((p) => {
        const last = Math.ceil(p.meta.total / Math.max(1, p.meta.per_page));
        return p.meta.current_page < last ? this.list(p.meta.current_page + 1) : EMPTY;
      }),
      reduce((all, p) => all.concat(p.data), [] as CenterResource[]),
    );
  }

  create(payload: StoreCenterRequest): Observable<CenterResource> {
    return this.api.post<CenterResource>('/centers', payload);
  }

  update(id: number, payload: UpdateCenterRequest): Observable<CenterResource> {
    return this.api.put<CenterResource>(`/centers/${id}`, payload);
  }
}

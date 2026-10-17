import { inject, Injectable } from '@angular/core';
import { EMPTY, expand, Observable, reduce } from 'rxjs';
import { ApiClient } from './api-client';
import { Center, Paginated } from './api-models';

@Injectable({ providedIn: 'root' })
export class CentersService {
  private readonly api = inject(ApiClient);

  list(page?: number): Observable<Paginated<Center>> {
    return this.api.get<Paginated<Center>>('/centers', page && page > 1 ? { page } : undefined);
  }

  /** Walks every page — the appearance center picker cannot be limited to page 1. */
  listAll(): Observable<Center[]> {
    return this.list().pipe(
      expand((p) => {
        const last = Math.ceil(p.meta.total / Math.max(1, p.meta.per_page));
        return p.meta.current_page < last ? this.list(p.meta.current_page + 1) : EMPTY;
      }),
      reduce((all, p) => all.concat(p.data), [] as Center[]),
    );
  }

  create(payload: {
    name: string;
    city?: string | null;
    address?: string | null;
    phone?: string | null;
    manager_name?: string | null;
  }): Observable<Center> {
    return this.api.post<Center>('/centers', payload);
  }

  update(
    id: number,
    payload: Partial<Pick<Center, 'name' | 'city' | 'address' | 'phone' | 'manager_name'>>,
  ): Observable<Center> {
    return this.api.put<Center>(`/centers/${id}`, payload);
  }
}

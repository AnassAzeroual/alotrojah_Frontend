import { inject, Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { ApiClient, QueryParams } from './api-client';
import { Center, Paginated } from './api-models';

@Injectable({ providedIn: 'root' })
export class CentersService {
  private readonly api = inject(ApiClient);

  list(): Observable<Paginated<Center>> {
    return this.api.get<Paginated<Center>>('/centers');
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

import { inject, Injectable } from '@angular/core';
import { Observable, firstValueFrom } from 'rxjs';
import { ApiClient, QueryParams } from './api-client';
import { Paginated, User } from './api-models';

/** Directory of accounts (admin/supervisor only per UserPolicy). */
@Injectable({ providedIn: 'root' })
export class UsersService {
  private readonly api = inject(ApiClient);

  /** Admin may pass center_id; other staff are auto-scoped to their center. */
  list(params?: QueryParams): Observable<Paginated<User>> {
    return this.api.get<Paginated<User>>('/users', params);
  }

  /**
   * Every page (the list endpoint paginates 20/page). For picker feeds where
   * late rows must not hide — e.g. replacer candidates, group teacher lists.
   */
  async listAll(params?: QueryParams): Promise<User[]> {
    const out: User[] = [];
    let page = 1;
    for (;;) {
      const res = await firstValueFrom(this.list({ ...params, page }));
      out.push(...res.data);
      if (res.meta.current_page * res.meta.per_page >= res.meta.total) break;
      page++;
    }
    return out;
  }

  get(id: number): Observable<User> {
    return this.api.get<User>(`/users/${id}`);
  }

  create(data: import('./api-models').CreateUserPayload): Observable<User> {
    return this.api.post<User>('/users', data);
  }

  update(id: number, data: import('./api-models').UpdateUserPayload): Observable<User> {
    return this.api.put<User>(`/users/${id}`, data);
  }

  delete(id: number): Observable<void> {
    return this.api.delete<void>(`/users/${id}`);
  }

  /** Transfer a teacher's groups/history to a replacer, then delete them. */
  replace(id: number, replacerId: number): Observable<{ replacer_id: number }> {
    return this.api.post<{ replacer_id: number }>(`/users/${id}/replace`, {
      replacer_id: replacerId,
    });
  }
}

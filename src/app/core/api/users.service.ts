import { inject, Injectable } from '@angular/core';
import { Observable, firstValueFrom } from 'rxjs';
import { ApiClient, QueryParams } from './api-client';
import {
  StoreUserRequest,
  UpdateUserRequest,
  UserReplaceResponse,
  UserResource,
  UsersIndexResponse,
} from './models';

/** Directory of accounts (admin/supervisor only per UserPolicy). */
@Injectable({ providedIn: 'root' })
export class UsersService {
  private readonly api = inject(ApiClient);

  /** Admin may pass center_id; other staff are auto-scoped to their center. */
  list(params?: QueryParams): Observable<UsersIndexResponse['data']> {
    return this.api.get<UsersIndexResponse['data']>('/users', params);
  }

  /**
   * Every page (the list endpoint paginates 20/page). For picker feeds where
   * late rows must not hide — e.g. replacer candidates, group teacher lists.
   */
  async listAll(params?: QueryParams): Promise<UserResource[]> {
    const out: UserResource[] = [];
    let page = 1;
    for (;;) {
      const res = await firstValueFrom(this.list({ ...params, page }));
      out.push(...res.data);
      if (res.meta.current_page * res.meta.per_page >= res.meta.total) break;
      page++;
    }
    return out;
  }

  get(id: number): Observable<UserResource> {
    return this.api.get<UserResource>(`/users/${id}`);
  }

  create(data: StoreUserRequest): Observable<UserResource> {
    return this.api.post<UserResource>('/users', data);
  }

  update(id: number, data: UpdateUserRequest): Observable<UserResource> {
    return this.api.put<UserResource>(`/users/${id}`, data);
  }

  delete(id: number): Observable<void> {
    return this.api.delete<void>(`/users/${id}`);
  }

  /** Transfer a teacher's groups/history to a replacer, then delete them. */
  replace(id: number, replacerId: number): Observable<UserReplaceResponse['data']> {
    return this.api.post<UserReplaceResponse['data']>(`/users/${id}/replace`, {
      replacer_id: replacerId,
    });
  }
}

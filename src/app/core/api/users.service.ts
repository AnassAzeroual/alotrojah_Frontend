import { inject, Injectable } from '@angular/core';
import { Observable } from 'rxjs';
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

  get(id: number): Observable<User> {
    return this.api.get<User>(`/users/${id}`);
  }

  create(data: import('./api-models').CreateUserPayload): Observable<User> {
    return this.api.post<User>('/users', data);
  }

  update(id: number, data: import('./api-models').UpdateUserPayload): Observable<User> {
    return this.api.put<User>(`/users/${id}`, data);
  }
}

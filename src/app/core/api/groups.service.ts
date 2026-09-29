import { inject, Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { ApiClient, QueryParams } from './api-client';
import { Group, Paginated } from './api-models';

@Injectable({ providedIn: 'root' })
export class GroupsService {
  private readonly api = inject(ApiClient);

  list(params?: QueryParams): Observable<Paginated<Group>> {
    return this.api.get<Paginated<Group>>('/groups', params);
  }
}

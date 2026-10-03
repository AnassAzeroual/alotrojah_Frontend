import { inject, Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { ApiClient, QueryParams } from './api-client';
import { Group, GroupDetail, GroupStats, Paginated } from './api-models';

@Injectable({ providedIn: 'root' })
export class GroupsService {
  private readonly api = inject(ApiClient);

  list(params?: QueryParams): Observable<Paginated<Group>> {
    return this.api.get<Paginated<Group>>('/groups', params);
  }

  /** Overview feed: every visible group + KPIs + breakdowns (current season). */
  stats(params?: QueryParams): Observable<GroupStats> {
    return this.api.get<GroupStats>('/groups/stats', params);
  }

  /** One group with its students, season metrics and weekly trend. */
  detail(id: number): Observable<GroupDetail> {
    return this.api.get<GroupDetail>(`/groups/${id}/detail`);
  }
}

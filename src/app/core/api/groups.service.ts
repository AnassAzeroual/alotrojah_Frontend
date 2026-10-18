import { inject, Injectable } from '@angular/core';
import { Observable, firstValueFrom } from 'rxjs';
import { ApiClient, QueryParams } from './api-client';
import {
  GroupDetailResponse,
  GroupResource,
  GroupsIndexResponse,
  GroupStatsResponse,
  StoreGroupRequest,
  UpdateGroupRequest,
} from './models';

@Injectable({ providedIn: 'root' })
export class GroupsService {
  private readonly api = inject(ApiClient);

  list(params?: QueryParams): Observable<GroupsIndexResponse['data']> {
    return this.api.get<GroupsIndexResponse['data']>('/groups', params);
  }

  /**
   * Every page (the list endpoint paginates 20/page). For feeds where late
   * rows must not hide (free-teacher checks, group pickers).
   */
  async listAll(params?: QueryParams): Promise<GroupResource[]> {
    const out: GroupResource[] = [];
    let page = 1;
    for (;;) {
      const res = await firstValueFrom(this.list({ ...params, page }));
      out.push(...res.data);
      if (res.meta.current_page * res.meta.per_page >= res.meta.total) break;
      page++;
    }
    return out;
  }

  /** Overview feed: every visible group + KPIs + breakdowns (current season). */
  stats(params?: QueryParams): Observable<GroupStatsResponse['data']> {
    return this.api.get<GroupStatsResponse['data']>('/groups/stats', params);
  }

  /** Create a group (admin picks any center; the server scopes supervisors). */
  create(payload: StoreGroupRequest): Observable<GroupResource> {
    return this.api.post<GroupResource>('/groups', payload);
  }

  /** One group with its students, season metrics and weekly trend. */
  detail(id: number): Observable<GroupDetailResponse['data']> {
    return this.api.get<GroupDetailResponse['data']>(`/groups/${id}/detail`);
  }

  /** Partial update (name/teacher/capacity/schedule/is_active). */
  update(id: number, payload: UpdateGroupRequest): Observable<GroupResource> {
    return this.api.put<GroupResource>(`/groups/${id}`, payload);
  }
}

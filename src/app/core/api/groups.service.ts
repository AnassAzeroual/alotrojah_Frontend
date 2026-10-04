import { inject, Injectable } from '@angular/core';
import { Observable, firstValueFrom } from 'rxjs';
import { ApiClient, QueryParams } from './api-client';
import {
  CreateGroupPayload,
  Group,
  GroupDetail,
  GroupStats,
  Paginated,
  UpdateGroupPayload,
} from './api-models';

@Injectable({ providedIn: 'root' })
export class GroupsService {
  private readonly api = inject(ApiClient);

  list(params?: QueryParams): Observable<Paginated<Group>> {
    return this.api.get<Paginated<Group>>('/groups', params);
  }

  /**
   * Every page (the list endpoint paginates 20/page). For feeds where late
   * rows must not hide (free-teacher checks, group pickers).
   */
  async listAll(params?: QueryParams): Promise<Group[]> {
    const out: Group[] = [];
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
  stats(params?: QueryParams): Observable<GroupStats> {
    return this.api.get<GroupStats>('/groups/stats', params);
  }

  /** Create a group (admin picks any center; the server scopes supervisors). */
  create(payload: CreateGroupPayload): Observable<Group> {
    return this.api.post<Group>('/groups', payload);
  }

  /** One group with its students, season metrics and weekly trend. */
  detail(id: number): Observable<GroupDetail> {
    return this.api.get<GroupDetail>(`/groups/${id}/detail`);
  }

  /** Partial update (name/level/teacher/capacity/schedule/is_active). */
  update(id: number, payload: UpdateGroupPayload): Observable<Group> {
    return this.api.put<Group>(`/groups/${id}`, payload);
  }
}

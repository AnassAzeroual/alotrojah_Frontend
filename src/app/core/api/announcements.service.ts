import { inject, Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { ApiClient, QueryParams } from './api-client';
import { Paginated } from './api-models';

export interface Announcement {
  id: number;
  audience: string;
  group_id: number | null;
  title: string;
  body: string;
  author?: { id: number; full_name: string };
  created_at: string | null;
}

@Injectable({ providedIn: 'root' })
export class AnnouncementsService {
  private readonly api = inject(ApiClient);

  list(params?: QueryParams): Observable<Paginated<Announcement>> {
    return this.api.get<Paginated<Announcement>>('/announcements', params);
  }

  create(payload: { audience: string; group_id?: number; title: string; body: string }): Observable<Announcement> {
    return this.api.post<Announcement>('/announcements', payload);
  }

  remove(id: number): Observable<null> {
    return this.api.delete<null>(`/announcements/${id}`);
  }
}

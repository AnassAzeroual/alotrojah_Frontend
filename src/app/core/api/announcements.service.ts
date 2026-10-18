import { inject, Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { ApiClient, QueryParams } from './api-client';
import {
  AnnouncementsDestroyResponse,
  AnnouncementsIndexResponse,
  AnnouncementsStoreResponse,
  AnnouncementsUpdateResponse,
  StoreAnnouncementRequest,
  UpdateAnnouncementRequest,
} from './models';

@Injectable({ providedIn: 'root' })
export class AnnouncementsService {
  private readonly api = inject(ApiClient);

  list(params?: QueryParams): Observable<AnnouncementsIndexResponse['data']> {
    return this.api.get<AnnouncementsIndexResponse['data']>('/announcements', params);
  }

  create(payload: StoreAnnouncementRequest): Observable<AnnouncementsStoreResponse['data']> {
    return this.api.post<AnnouncementsStoreResponse['data']>('/announcements', payload);
  }

  update(
    id: number,
    patch: UpdateAnnouncementRequest,
  ): Observable<AnnouncementsUpdateResponse['data']> {
    return this.api.patch<AnnouncementsUpdateResponse['data']>(`/announcements/${id}`, patch);
  }

  remove(id: number): Observable<AnnouncementsDestroyResponse['data']> {
    return this.api.delete<AnnouncementsDestroyResponse['data']>(`/announcements/${id}`);
  }
}

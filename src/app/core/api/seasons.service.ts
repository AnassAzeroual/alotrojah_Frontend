import { inject, Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { ApiClient } from './api-client';
import {
  SeasonActivateResponse,
  SeasonsDestroyResponse,
  SeasonsIndexResponse,
  SeasonsShowResponse,
  SeasonsStoreResponse,
  SeasonsUpdateResponse,
  StoreSeasonRequest,
  UpdateSeasonRequest,
} from './models';

@Injectable({ providedIn: 'root' })
export class SeasonsService {
  private readonly api = inject(ApiClient);

  list(): Observable<SeasonsIndexResponse['data']> {
    return this.api.get<SeasonsIndexResponse['data']>('/seasons');
  }

  create(payload: StoreSeasonRequest): Observable<SeasonsStoreResponse['data']> {
    return this.api.post<SeasonsStoreResponse['data']>('/seasons', payload);
  }

  activate(id: number): Observable<SeasonActivateResponse['data']> {
    return this.api.post<SeasonActivateResponse['data']>(`/seasons/${id}/activate`, {});
  }

  /** One season (edit form seeds from it). */
  get(id: number): Observable<SeasonsShowResponse['data']> {
    return this.api.get<SeasonsShowResponse['data']>(`/seasons/${id}`);
  }

  /** Rename / adjust dates (UpdateSeasonRequest: sometimes-rules). */
  update(id: number, payload: UpdateSeasonRequest): Observable<SeasonsUpdateResponse['data']> {
    return this.api.put<SeasonsUpdateResponse['data']>(`/seasons/${id}`, payload);
  }

  remove(id: number): Observable<SeasonsDestroyResponse['data']> {
    return this.api.delete<SeasonsDestroyResponse['data']>(`/seasons/${id}`);
  }
}

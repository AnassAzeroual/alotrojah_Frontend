import { inject, Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { ApiClient } from './api-client';
import {
  LevelResetResponse,
  LevelsDestroyResponse,
  LevelsIndexResponse,
  LevelsStoreResponse,
  LevelsUpdateResponse,
  StoreLevelRequest,
  UpdateLevelRequest,
} from './models';

@Injectable({ providedIn: 'root' })
export class LevelsService {
  private readonly api = inject(ApiClient);

  list(centerId?: number | null): Observable<LevelsIndexResponse['data']> {
    return this.api.get<LevelsIndexResponse['data']>(
      '/levels',
      centerId ? { center_id: centerId } : undefined,
    );
  }

  /** Dynamic codes: the server assigns `L{id}`; the payload carries no code. */
  create(payload: StoreLevelRequest): Observable<LevelsStoreResponse['data']> {
    return this.api.post<LevelsStoreResponse['data']>('/levels', payload);
  }

  update(id: number, patch: UpdateLevelRequest): Observable<LevelsUpdateResponse['data']> {
    return this.api.put<LevelsUpdateResponse['data']>(`/levels/${id}`, patch);
  }

  remove(id: number): Observable<LevelsDestroyResponse['data']> {
    return this.api.delete<LevelsDestroyResponse['data']>(`/levels/${id}`);
  }

  /** T2: delete one center's override set (all-or-nothing server-side). */
  reset(centerId: number): Observable<LevelResetResponse['data']> {
    return this.api.delete<LevelResetResponse['data']>('/levels/reset', { center_id: centerId });
  }
}

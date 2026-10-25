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

  /**
   * Levels of one season. Every level belongs to a season (there is no shared
   * seed set); the caller must always name the season.
   */
  list(seasonId: number): Observable<LevelsIndexResponse['data']> {
    return this.api.get<LevelsIndexResponse['data']>('/levels', { season_id: seasonId });
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

  /** Restore a season's set from the previous season of its center lane. */
  reset(seasonId: number): Observable<LevelResetResponse['data']> {
    return this.api.delete<LevelResetResponse['data']>('/levels/reset', { season_id: seasonId });
  }
}

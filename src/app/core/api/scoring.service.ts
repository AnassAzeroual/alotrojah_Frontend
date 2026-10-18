import { inject, Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { ApiClient } from './api-client';
import {
  BulkModulesRequest,
  ScoringModuleBulkResponse,
  ScoringModuleResource,
  ScoringModuleResetResponse,
  ScoringModulesDestroyResponse,
  ScoringModulesIndexResponse,
  StoreModuleRequest,
} from './models';

@Injectable({ providedIn: 'root' })
export class ScoringService {
  private readonly api = inject(ApiClient);

  modules(centerId?: number | null): Observable<ScoringModulesIndexResponse['data']> {
    return this.api.get<ScoringModulesIndexResponse['data']>(
      '/scoring-modules',
      centerId ? { center_id: centerId } : undefined,
    );
  }

  bulk(
    patches: BulkModulesRequest['modules'],
    centerId?: number | null,
  ): Observable<ScoringModuleBulkResponse['data']> {
    return this.api.put<ScoringModuleBulkResponse['data']>('/scoring-modules', {
      center_id: centerId ?? null,
      modules: patches,
    });
  }

  remove(id: number): Observable<ScoringModulesDestroyResponse['data']> {
    return this.api.delete<ScoringModulesDestroyResponse['data']>(`/scoring-modules/${id}`);
  }

  /** T2: delete one center's override set (all-or-nothing server-side). */
  reset(centerId: number): Observable<ScoringModuleResetResponse['data']> {
    return this.api.delete<ScoringModuleResetResponse['data']>('/scoring-modules/reset', {
      center_id: centerId,
    });
  }

  create(payload: StoreModuleRequest): Observable<ScoringModuleResource> {
    return this.api.post<ScoringModuleResource>('/scoring-modules', payload);
  }
}

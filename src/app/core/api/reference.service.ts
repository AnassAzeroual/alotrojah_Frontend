import { inject, Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { ApiClient } from './api-client';
import { ReferenceLevelsResponse, ReferenceSurahsResponse, SeasonsIndexResponse } from './models';

@Injectable({ providedIn: 'root' })
export class ReferenceService {
  private readonly api = inject(ApiClient);

  levels(centerId?: number | null): Observable<ReferenceLevelsResponse['data']> {
    return this.api.get<ReferenceLevelsResponse['data']>(
      '/reference/levels',
      centerId ? { center_id: centerId } : undefined,
    );
  }

  surahs(q?: string): Observable<ReferenceSurahsResponse['data']> {
    return this.api.get<ReferenceSurahsResponse['data']>(
      '/reference/surahs',
      q ? { q } : undefined,
    );
  }

  seasons(centerId?: number | null, currentOnly = false): Observable<SeasonsIndexResponse['data']> {
    const params: Record<string, string | number> = {};
    if (centerId) params['center_id'] = centerId;
    if (currentOnly) params['current'] = 1;
    return this.api.get<SeasonsIndexResponse['data']>(
      '/seasons',
      Object.keys(params).length ? params : undefined,
    );
  }
}

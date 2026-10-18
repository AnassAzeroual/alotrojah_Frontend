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

  seasons(): Observable<SeasonsIndexResponse['data']> {
    return this.api.get<SeasonsIndexResponse['data']>('/seasons');
  }
}

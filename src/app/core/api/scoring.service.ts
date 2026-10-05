import { inject, Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { ApiClient } from './api-client';
import { ScoringModule } from './api-models';

export interface ModulePatch {
  code: string;
  max_points?: number;
  is_active?: boolean;
  is_in_weekly_total?: boolean;
  sort_order?: number;
}

export interface ScoringCheck {
  valid: boolean;
  total: number;
}

@Injectable({ providedIn: 'root' })
export class ScoringService {
  private readonly api = inject(ApiClient);

  modules(centerId?: number | null): Observable<ScoringModule[]> {
    return this.api.get<ScoringModule[]>(
      '/scoring-modules',
      centerId ? { center_id: centerId } : undefined,
    );
  }

  bulk(
    patches: ModulePatch[],
    centerId?: number | null,
  ): Observable<{ modules: ScoringModule[]; check: ScoringCheck }> {
    return this.api.put<{ modules: ScoringModule[]; check: ScoringCheck }>('/scoring-modules', {
      center_id: centerId ?? null,
      modules: patches,
    });
  }

  remove(id: number): Observable<null> {
    return this.api.delete<null>(`/scoring-modules/${id}`);
  }

  create(payload: {
    code: string;
    name_ar: string;
    max_points: number;
    scope: 'weekly' | 'murajaa';
    is_active?: boolean;
    is_in_weekly_total?: boolean;
    center_id?: number | null;
  }): Observable<ScoringModule> {
    return this.api.post<ScoringModule>('/scoring-modules', payload);
  }
}

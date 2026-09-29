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

  modules(): Observable<ScoringModule[]> {
    return this.api.get<ScoringModule[]>('/scoring-modules');
  }

  bulk(patches: ModulePatch[]): Observable<{ modules: ScoringModule[]; check: ScoringCheck }> {
    return this.api.put<{ modules: ScoringModule[]; check: ScoringCheck }>('/scoring-modules', { modules: patches });
  }

  create(payload: {
    code: string;
    name_ar: string;
    max_points: number;
    scope: 'weekly' | 'murajaa';
    is_active?: boolean;
    is_in_weekly_total?: boolean;
  }): Observable<ScoringModule> {
    return this.api.post<ScoringModule>('/scoring-modules', payload);
  }

  check(): Observable<ScoringCheck> {
    return this.api.get<ScoringCheck>('/scoring-check');
  }
}

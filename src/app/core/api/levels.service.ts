import { inject, Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { ApiClient } from './api-client';

export interface Level {
  id: number;
  code: string;
  name_ar: string;
  center_id?: number | null;
  sessions_per_week: number;
  thumn_per_session_label: string;
  thumn_per_session_value: number;
  thumn_per_week_value: number;
  ahzab_per_term: number;
  ahzab_per_dawra: number;
  duration_label: string;
  total_ahzab: number;
}

export interface LevelPatch {
  name_ar?: string;
  sessions_per_week?: number;
  thumn_per_session_label?: string;
  thumn_per_session_value?: number;
  thumn_per_week_value?: number;
  ahzab_per_term?: number;
  ahzab_per_dawra?: number;
  duration_label?: string;
  total_ahzab?: number;
  center_id?: number | null;
}

@Injectable({ providedIn: 'root' })
export class LevelsService {
  private readonly api = inject(ApiClient);

  list(centerId?: number | null): Observable<Level[]> {
    return this.api.get<Level[]>('/levels', centerId ? { center_id: centerId } : undefined);
  }

  update(id: number, patch: LevelPatch): Observable<Level> {
    return this.api.put<Level>(`/levels/${id}`, patch);
  }

  remove(id: number): Observable<null> {
    return this.api.delete<null>(`/levels/${id}`);
  }

  /** T2: delete one center's override set (all-or-nothing server-side). */
  reset(centerId: number): Observable<{ deleted: number }> {
    return this.api.delete<{ deleted: number }>('/levels/reset', { center_id: centerId });
  }
}

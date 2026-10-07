import { inject, Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { ApiClient, QueryParams } from './api-client';
import { Paginated } from './api-models';

export interface Season {
  id: number;
  name: string;
  hijri_year: string | null;
  start_date: string | null;
  end_date: string | null;
  total_weeks: number;
  total_sessions: number;
  is_current: boolean;
  center_id: number | null;
  terms_count?: number;
  first_term_id?: number | null;
}

export interface SeasonTerm {
  name: string;
  weeks: number;
}

@Injectable({ providedIn: 'root' })
export class SeasonsService {
  private readonly api = inject(ApiClient);

  list(): Observable<Paginated<Season>> {
    return this.api.get<Paginated<Season>>('/seasons');
  }

  create(payload: {
    name: string;
    center_id: number | null;
    start_date: string;
    hijri_year?: string;
    sessions_per_week?: number;
    review_weeks_per_term?: number;
    terms?: SeasonTerm[];
  }): Observable<Season> {
    return this.api.post<Season>('/seasons', payload);
  }

  activate(id: number): Observable<Season> {
    return this.api.post<Season>(`/seasons/${id}/activate`, {});
  }

  /** One season (edit form seeds from it). */
  get(id: number): Observable<Season> {
    return this.api.get<Season>(`/seasons/${id}`);
  }

  /** Rename / adjust dates (UpdateSeasonRequest: sometimes-rules). */
  update(
    id: number,
    payload: {
      name?: string;
      start_date?: string;
      end_date?: string | null;
      hijri_year?: string | null;
    },
  ): Observable<Season> {
    return this.api.put<Season>(`/seasons/${id}`, payload);
  }

  remove(id: number): Observable<null> {
    return this.api.delete<null>(`/seasons/${id}`);
  }
}

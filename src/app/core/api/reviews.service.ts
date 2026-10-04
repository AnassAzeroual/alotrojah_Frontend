import { inject, Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { ApiClient, QueryParams } from './api-client';
import { Paginated } from './api-models';

export interface MurajaaReview {
  id: number;
  student_id: number;
  season_id: number;
  term_id: number;
  week_from: number;
  week_to: number;
  weeks_covered: number;
  hizb_from: number | null;
  hizb_to: number | null;
  score: number;
  reviewed_at: string | null;
}

export interface RevisionLog {
  id: number;
  student_id: number;
  session_id: number;
  hizb_from: number | null;
  hizb_to: number | null;
  murajaa_score: number | null;
}

@Injectable({ providedIn: 'root' })
export class ReviewsService {
  private readonly api = inject(ApiClient);

  cycles(params?: QueryParams): Observable<Paginated<MurajaaReview>> {
    return this.api.get<Paginated<MurajaaReview>>('/murajaa-reviews', params);
  }

  createCycle(payload: {
    student_id: number;
    term_id: number;
    week_from: number;
    week_to: number;
    hizb_from?: number;
    hizb_to?: number;
    score: number;
    reviewed_at?: string;
  }): Observable<MurajaaReview> {
    return this.api.post<MurajaaReview>('/murajaa-reviews', payload);
  }

  deleteCycle(id: number): Observable<null> {
    return this.api.delete<null>(`/murajaa-reviews/${id}`);
  }

  logs(params?: QueryParams): Observable<Paginated<RevisionLog>> {
    return this.api.get<Paginated<RevisionLog>>('/revision-logs', params);
  }

  deleteLog(id: number): Observable<null> {
    return this.api.delete<null>(`/revision-logs/${id}`);
  }
}

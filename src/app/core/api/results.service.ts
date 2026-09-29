import { inject, Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { ApiClient, QueryParams } from './api-client';

export interface TermResult {
  id: number;
  student_id: number;
  season_id: number;
  term_id: number;
  hifz_total: number | null;
  murajaa_total: number | null;
  exam_score: number | null;
  general_avg: number | null;
  teacher_notes: string | null;
  guardian_notes: string | null;
  supervisor_note: string | null;
  honor_flag: string;
}

export interface SeasonResult {
  id: number;
  student_id: number;
  season_id: number;
  total_memorized_label: string | null;
  total_memorized_thumn: number | null;
  hifz_total: number | null;
  murajaa_total: number | null;
  overall_avg: number | null;
  board_report: string | null;
  honor_flag: string;
}

@Injectable({ providedIn: 'root' })
export class ResultsService {
  private readonly api = inject(ApiClient);

  termResults(params?: QueryParams): Observable<{ data: TermResult[] }> {
    return this.api.get<{ data: TermResult[] }>('/term-results', params);
  }

  upsertTerm(payload: Partial<TermResult> & { student_id: number; term_id: number }): Observable<TermResult> {
    return this.api.put<TermResult>('/term-results', payload);
  }

  seasonResults(params?: QueryParams): Observable<{ data: SeasonResult[] }> {
    return this.api.get<{ data: SeasonResult[] }>('/season-results', params);
  }

  upsertSeason(payload: Partial<SeasonResult> & { student_id: number; season_id: number }): Observable<SeasonResult> {
    return this.api.put<SeasonResult>('/season-results', payload);
  }
}

import { inject, Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { ApiClient, QueryParams } from './api-client';
import {
  ResultIndexSeasonsResponse,
  ResultIndexTermsResponse,
  ResultUpsertSeasonResponse,
  ResultUpsertTermResponse,
  UpsertSeasonResultRequest,
  UpsertTermResultRequest,
  V1TermBreakdownResponse,
} from './models';

@Injectable({ providedIn: 'root' })
export class ResultsService {
  private readonly api = inject(ApiClient);

  termResults(params?: QueryParams): Observable<ResultIndexTermsResponse['data']> {
    return this.api.get<ResultIndexTermsResponse['data']>('/term-results', params);
  }

  termBreakdown(params: {
    student_id: number;
    term_id: number;
  }): Observable<V1TermBreakdownResponse['data']> {
    return this.api.get<V1TermBreakdownResponse['data']>('/term-results/breakdown', params);
  }

  upsertTerm(payload: UpsertTermResultRequest): Observable<ResultUpsertTermResponse['data']> {
    return this.api.put<ResultUpsertTermResponse['data']>('/term-results', payload);
  }

  seasonResults(params?: QueryParams): Observable<ResultIndexSeasonsResponse['data']> {
    return this.api.get<ResultIndexSeasonsResponse['data']>('/season-results', params);
  }

  upsertSeason(payload: UpsertSeasonResultRequest): Observable<ResultUpsertSeasonResponse['data']> {
    return this.api.put<ResultUpsertSeasonResponse['data']>('/season-results', payload);
  }
}

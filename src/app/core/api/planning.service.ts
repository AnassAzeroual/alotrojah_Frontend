import { inject, Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { ApiClient, QueryParams } from './api-client';
import {
  CalendarShowTermResponse,
  CalendarTermsResponse,
  CalendarUpdateSessionResponse,
  CalendarUpdateTermResponse,
  CalendarUpdateWeekResponse,
  TermPlansIndexResponse,
  TermPlanUpsertResponse,
  UpdateSessionRequest,
  UpsertTermPlanRequest,
} from './models';

@Injectable({ providedIn: 'root' })
export class PlanningService {
  private readonly api = inject(ApiClient);

  terms(seasonId: number): Observable<CalendarTermsResponse['data']> {
    return this.api.get<CalendarTermsResponse['data']>(`/seasons/${seasonId}/terms`);
  }

  termDetail(termId: number): Observable<CalendarShowTermResponse['data']> {
    return this.api.get<CalendarShowTermResponse['data']>(`/terms/${termId}`);
  }

  renameTerm(termId: number, nameAr: string): Observable<CalendarUpdateTermResponse['data']> {
    return this.api.patch<CalendarUpdateTermResponse['data']>(`/terms/${termId}`, {
      name_ar: nameAr,
    });
  }

  setWeekType(weekId: number, weekType: string): Observable<CalendarUpdateWeekResponse['data']> {
    return this.api.patch<CalendarUpdateWeekResponse['data']>(`/weeks/${weekId}`, {
      week_type: weekType,
    });
  }

  updateSession(
    sessionId: number,
    patch: UpdateSessionRequest,
  ): Observable<CalendarUpdateSessionResponse['data']> {
    return this.api.patch<CalendarUpdateSessionResponse['data']>(
      `/sessions-cal/${sessionId}`,
      patch,
    );
  }

  plans(params?: QueryParams): Observable<TermPlansIndexResponse['data']> {
    return this.api.get<TermPlansIndexResponse['data']>('/term-plans', params);
  }

  upsertPlan(payload: UpsertTermPlanRequest): Observable<TermPlanUpsertResponse['data']> {
    return this.api.put<TermPlanUpsertResponse['data']>('/term-plans', payload);
  }
}

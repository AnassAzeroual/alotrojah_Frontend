import { inject, Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { ApiClient, QueryParams } from './api-client';
import { SessionCal, WeekCal } from './calendar.service';

export interface TermDetail extends Term {
  weeks: (WeekCal & { sessions?: SessionCal[] })[];
}

export interface Term {
  id: number;
  season_id: number;
  term_number: number;
  name_ar: string;
  start_week: number;
  end_week: number;
  start_session_no: number;
  end_session_no: number;
  weeks_count?: number;
}

export interface TermPlan {
  id: number;
  student_id: number;
  season_id: number;
  term_id: number;
  goal_text: string | null;
  plan_mode: 'thumn' | 'surah';
  start_hizb: number | null;
  end_hizb: number | null;
  plan_surah_from: number | null;
  plan_ayah_from: number | null;
  plan_surah_to: number | null;
  plan_ayah_to: number | null;
  expected_hifz_week_thumn: number | null;
  expected_hifz_term_ahzab: number | null;
  expected_hifz_season_ahzab: number | null;
  khatm_expected_at: string | null;
}

@Injectable({ providedIn: 'root' })
export class PlanningService {
  private readonly api = inject(ApiClient);

  terms(seasonId: number): Observable<Term[]> {
    return this.api.get<Term[]>(`/seasons/${seasonId}/terms`);
  }

  termDetail(termId: number): Observable<TermDetail> {
    return this.api.get<TermDetail>(`/terms/${termId}`);
  }

  renameTerm(termId: number, nameAr: string): Observable<Term> {
    return this.api.patch<Term>(`/terms/${termId}`, { name_ar: nameAr });
  }

  setWeekType(weekId: number, weekType: string): Observable<WeekCal> {
    return this.api.patch<WeekCal>(`/weeks/${weekId}`, { week_type: weekType });
  }

  updateSession(sessionId: number, patch: Partial<SessionCal>): Observable<SessionCal> {
    return this.api.patch<SessionCal>(`/sessions-cal/${sessionId}`, patch);
  }

  plans(params?: QueryParams): Observable<{ data: TermPlan[] }> {
    return this.api.get<{ data: TermPlan[] }>('/term-plans', params);
  }

  upsertPlan(payload: Partial<TermPlan> & { student_id: number; term_id: number; plan_mode: 'thumn' | 'surah' }): Observable<TermPlan> {
    return this.api.put<TermPlan>('/term-plans', payload);
  }
}

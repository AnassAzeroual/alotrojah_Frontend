import { inject, Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { ApiClient, QueryParams } from './api-client';
import { Paginated } from './api-models';

export interface WeekCal {
  id: number;
  season_id: number;
  term_id: number;
  week_number_global: number;
  week_number_in_term: number;
  week_type: 'study' | 'review';
}

export interface SessionCal {
  id: number;
  season_id: number;
  term_id: number;
  week_id: number;
  group_id: number | null;
  session_number_global: number;
  session_number_in_week: number;
  session_type: 'memorization' | 'revision' | 'exam';
  planned_date: string | null;
  start_time: string | null;
  end_time: string | null;
  status: string;
}

/** Display-ready calendar row: session plus the names its card needs. */
export interface CalendarEntry extends SessionCal {
  group_name: string | null;
  term_name: string | null;
  week_number_global: number | null;
  week_type: 'study' | 'review' | null;
}

@Injectable({ providedIn: 'root' })
export class CalendarService {
  private readonly api = inject(ApiClient);

  weeks(params?: QueryParams): Observable<Paginated<WeekCal>> {
    return this.api.get<Paginated<WeekCal>>('/weeks', params);
  }

  sessions(params?: QueryParams): Observable<Paginated<SessionCal>> {
    return this.api.get<Paginated<SessionCal>>('/sessions-cal', params);
  }

  /** One windowed feed for the calendar (sessions + card names). */
  feed(params?: QueryParams): Observable<Paginated<CalendarEntry>> {
    return this.api.get<Paginated<CalendarEntry>>('/calendar', params);
  }
}

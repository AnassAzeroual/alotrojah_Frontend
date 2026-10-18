import { inject, Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { ApiClient, QueryParams } from './api-client';
import { CalendarFeedResponse, CalendarSessionsResponse, CalendarWeeksResponse } from './models';

@Injectable({ providedIn: 'root' })
export class CalendarService {
  private readonly api = inject(ApiClient);

  weeks(params?: QueryParams): Observable<CalendarWeeksResponse['data']> {
    return this.api.get<CalendarWeeksResponse['data']>('/weeks', params);
  }

  sessions(params?: QueryParams): Observable<CalendarSessionsResponse['data']> {
    return this.api.get<CalendarSessionsResponse['data']>('/sessions-cal', params);
  }

  /** One windowed feed for the calendar (sessions + card names). */
  feed(params?: QueryParams): Observable<CalendarFeedResponse['data']> {
    return this.api.get<CalendarFeedResponse['data']>('/calendar', params);
  }
}

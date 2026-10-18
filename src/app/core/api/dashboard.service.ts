import { inject, Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { ApiClient } from './api-client';
import {
  DashboardCenterResponse,
  DashboardFinalResponse,
  DashboardMeResponse,
  DashboardSeasonResponse,
  DashboardWeeklyResponse,
} from './models';

@Injectable({ providedIn: 'root' })
export class DashboardService {
  private readonly api = inject(ApiClient);

  season(studentId: number, seasonId: number): Observable<DashboardSeasonResponse['data']> {
    return this.api.get<DashboardSeasonResponse['data']>('/dashboard/season', {
      student_id: studentId,
      season_id: seasonId,
    });
  }

  final(studentId: number, seasonId: number): Observable<DashboardFinalResponse['data']> {
    return this.api.get<DashboardFinalResponse['data']>('/dashboard/final', {
      student_id: studentId,
      season_id: seasonId,
    });
  }

  weekly(studentId: number, seasonId: number): Observable<DashboardWeeklyResponse['data']> {
    return this.api.get<DashboardWeeklyResponse['data']>('/dashboard/weekly', {
      student_id: studentId,
      season_id: seasonId,
    });
  }

  center(centerId: number, seasonId: number): Observable<DashboardCenterResponse['data']> {
    return this.api.get<DashboardCenterResponse['data']>('/dashboard/center', {
      center_id: centerId,
      season_id: seasonId,
    });
  }

  /** §2.16: the logged-in student's own dashboard (null when unlinked). */
  me(): Observable<DashboardMeResponse['data']> {
    return this.api.get<DashboardMeResponse['data']>('/dashboard/me');
  }
}

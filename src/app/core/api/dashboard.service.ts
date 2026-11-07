import { inject, Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { ApiClient } from './api-client';
import {
  DashboardFinalResponse,
  DashboardMeResponse,
  DashboardSeasonResponse,
  DashboardWeeklyResponse,
} from './models';

export interface DashboardOverview {
  scope: {
    role: 'admin' | 'supervisor' | 'teacher';
    center_id: number | null;
    center_name: string | null;
    can_filter_center: boolean;
    season: { id: number; name: string; start_date: string | null; end_date: string | null } | null;
    centers: Array<{ id: number; name: string }>;
  };
  kpis: {
    students: number;
    active_students: number;
    groups: number;
    teachers: number;
    avg_score: number | null;
    avg_sarraj: number | null;
    attendance_pct: number | null;
    total_ahzab: number;
    honors: { tashji3: number; intibah: number; none: number };
  };
  trends: {
    weekly: Array<{
      week: number;
      avg_score: number | null;
      attendance_pct: number | null;
      thumn: number;
    }>;
  };
  distributions: {
    attendance: Array<{ status: string; n: number }>;
    scores: Array<{ band: string; n: number }>;
    genders: Array<{ gender: string; n: number }>;
    levels: Array<{ label: string; n: number }>;
  };
  groups: Array<{
    id: number;
    name: string;
    students: number;
    avg_score: number | null;
    attendance_pct: number | null;
  }>;
  centers: Array<{
    id: number;
    name: string;
    students: number;
    avg_score: number | null;
    attendance_pct: number | null;
  }>;
  top_students: Array<{
    id: number;
    full_name: string;
    group_name: string | null;
    avg_score: number | null;
    attendance_pct: number | null;
  }>;
}

@Injectable({ providedIn: 'root' })
export class DashboardService {
  private readonly api = inject(ApiClient);

  overview(params?: { center_id?: number; season_id?: number }): Observable<DashboardOverview> {
    return this.api.get<DashboardOverview>('/dashboard/overview', params);
  }

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

  /** §2.16: the logged-in student's own dashboard (null when unlinked). */
  me(): Observable<DashboardMeResponse['data']> {
    return this.api.get<DashboardMeResponse['data']>('/dashboard/me');
  }
}

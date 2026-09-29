import { inject, Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { ApiClient } from './api-client';

export interface SeasonDashboard {
  student_id: number;
  full_name: string;
  season_thumn: number;
  season_avg_score: number | null;
  season_avg_sarraj: number | null;
  season_attendance_pct: number | null;
  season_overall_avg: number | null;
  honor_flag: string | null;
}

export interface FinalData {
  inputs: { avg_murajaa: number | null; avg_weekly: number | null; avg_sarraj: number | null };
  quizzes: { term_id: number | null; exam_type: string; avg_score: number }[];
  divisor: number;
  final: number | null;
}

@Injectable({ providedIn: 'root' })
export class DashboardService {
  private readonly api = inject(ApiClient);

  season(studentId: number, seasonId: number): Observable<SeasonDashboard> {
    return this.api.get<SeasonDashboard>('/dashboard/season', { student_id: studentId, season_id: seasonId });
  }

  final(studentId: number, seasonId: number): Observable<FinalData> {
    return this.api.get<FinalData>('/dashboard/final', { student_id: studentId, season_id: seasonId });
  }
}

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

export interface WeeklyPoint {
  week_id: number;
  total_thumn: number;
  avg_score: number | null;
}

export interface CenterCards {
  students: number;
  avg_score: number | null;
  avg_sarraj: number | null;
  avg_attendance: number | null;
}

export interface CenterDashboard {
  cards: CenterCards;
  honors: { honor_flag: string; n: number }[];
  attendance: { status: string; n: number }[];
}

export interface FinalData {
  inputs: { avg_murajaa: number | null; avg_weekly: number | null; avg_sarraj: number | null };
  quizzes: { term_id: number | null; exam_type: string; avg_score: number }[];
  divisor: number;
  final: number | null;
}

export interface MeDashboard {
  student: {
    id: number;
    full_name: string;
    group: { id: number; name: string } | null;
    memorization_mode: string;
    status: string;
  };
  season: SeasonDashboard | null;
  weekly: WeeklyPoint[];
  final: number | null;
}

@Injectable({ providedIn: 'root' })
export class DashboardService {
  private readonly api = inject(ApiClient);

  season(studentId: number, seasonId: number): Observable<SeasonDashboard> {
    return this.api.get<SeasonDashboard>('/dashboard/season', {
      student_id: studentId,
      season_id: seasonId,
    });
  }

  final(studentId: number, seasonId: number): Observable<FinalData> {
    return this.api.get<FinalData>('/dashboard/final', {
      student_id: studentId,
      season_id: seasonId,
    });
  }

  weekly(studentId: number, seasonId: number): Observable<WeeklyPoint[]> {
    return this.api.get<WeeklyPoint[]>('/dashboard/weekly', {
      student_id: studentId,
      season_id: seasonId,
    });
  }

  center(centerId: number, seasonId: number): Observable<CenterDashboard> {
    return this.api.get<CenterDashboard>('/dashboard/center', {
      center_id: centerId,
      season_id: seasonId,
    });
  }

  /** §2.16: the logged-in student's own dashboard (null when unlinked). */
  me(): Observable<MeDashboard | null> {
    return this.api.get<MeDashboard | null>('/dashboard/me');
  }
}

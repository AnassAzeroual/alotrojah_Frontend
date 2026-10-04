import { inject, Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { ApiClient, QueryParams } from './api-client';
import { Paginated, ScoringModule, SessionScore } from './api-models';

export interface AttendanceRow {
  id: number;
  student_id: number;
  session_id: number;
  week_id: number;
  status: 'present' | 'absent' | 'late' | 'excused';
  notes: string | null;
}

export interface ScoreRecord {
  student_id: number;
  module_code: string;
  score: number;
}

export interface AttendanceRecord {
  student_id: number;
  status: string;
  notes?: string;
}

export interface WeeklyGoal {
  id: number;
  student_id: number;
  week_id: number;
  target_text: string | null;
  is_completed: boolean | null;
}

export interface SessionStudentScores {
  student_id: number;
  scores: SessionScore[];
  weekly_total: number;
}

@Injectable({ providedIn: 'root' })
export class EntryService {
  private readonly api = inject(ApiClient);

  modules(): Observable<ScoringModule[]> {
    return this.api.get<ScoringModule[]>('/scoring-modules');
  }

  attendanceBulk(
    sessionId: number,
    records: AttendanceRecord[],
  ): Observable<{ attendance_ids: number[] }> {
    return this.api.post<{ attendance_ids: number[] }>('/attendance/bulk', {
      session_id: sessionId,
      records,
    });
  }

  attendanceList(params?: QueryParams): Observable<Paginated<AttendanceRow>> {
    return this.api.get<Paginated<AttendanceRow>>('/attendance', params);
  }

  deleteAttendance(id: number): Observable<null> {
    return this.api.delete<null>(`/attendance/${id}`);
  }

  scoresBulk(
    sessionId: number,
    records: ScoreRecord[],
  ): Observable<{ weekly_totals: Record<string, number> }> {
    return this.api.post<{ weekly_totals: Record<string, number> }>('/scores/bulk', {
      session_id: sessionId,
      records,
    });
  }

  sessionScores(sessionId: number): Observable<SessionStudentScores[]> {
    return this.api.get<SessionStudentScores[]>(`/sessions/${sessionId}/scores`);
  }

  goals(params?: QueryParams): Observable<Paginated<WeeklyGoal>> {
    return this.api.get<Paginated<WeeklyGoal>>('/weekly-goals', params);
  }

  upsertGoal(
    studentId: number,
    weekId: number,
    targetText: string | null,
    completed: boolean | null,
  ): Observable<WeeklyGoal> {
    return this.api.put<WeeklyGoal>('/weekly-goals', {
      student_id: studentId,
      week_id: weekId,
      target_text: targetText,
      is_completed: completed,
    });
  }
}

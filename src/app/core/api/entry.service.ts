import { inject, Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { ApiClient, QueryParams } from './api-client';
import {
  AttendanceBulkResponse,
  AttendanceDestroyResponse,
  AttendanceIndexResponse,
  ScoreBySessionResponse,
  ScoreBulkResponse,
  ScoringModulesIndexResponse,
  StoreAttendanceBulkRequest,
  StoreScoresBulkRequest,
  WeeklyGoalResource,
  WeeklyGoalsIndexResponse,
} from './models';

@Injectable({ providedIn: 'root' })
export class EntryService {
  private readonly api = inject(ApiClient);

  modules(): Observable<ScoringModulesIndexResponse['data']> {
    return this.api.get<ScoringModulesIndexResponse['data']>('/scoring-modules');
  }

  attendanceBulk(
    sessionId: number,
    records: StoreAttendanceBulkRequest['records'],
  ): Observable<AttendanceBulkResponse['data']> {
    return this.api.post<AttendanceBulkResponse['data']>('/attendance/bulk', {
      session_id: sessionId,
      records,
    });
  }

  attendanceList(params?: QueryParams): Observable<AttendanceIndexResponse['data']> {
    return this.api.get<AttendanceIndexResponse['data']>('/attendance', params);
  }

  deleteAttendance(id: number): Observable<AttendanceDestroyResponse['data']> {
    return this.api.delete<AttendanceDestroyResponse['data']>(`/attendance/${id}`);
  }

  scoresBulk(
    sessionId: number,
    records: StoreScoresBulkRequest['records'],
    memorizations?: StoreScoresBulkRequest['memorizations'],
  ): Observable<ScoreBulkResponse['data']> {
    return this.api.post<ScoreBulkResponse['data']>('/scores/bulk', {
      session_id: sessionId,
      records,
      ...(memorizations && memorizations.length > 0 ? { memorizations } : {}),
    });
  }

  sessionScores(sessionId: number): Observable<ScoreBySessionResponse['data']> {
    return this.api.get<ScoreBySessionResponse['data']>(`/sessions/${sessionId}/scores`);
  }

  goals(params?: QueryParams): Observable<WeeklyGoalsIndexResponse['data']> {
    return this.api.get<WeeklyGoalsIndexResponse['data']>('/weekly-goals', params);
  }

  upsertGoal(
    studentId: number,
    weekId: number,
    targetText: string | null,
    completed: boolean | null,
  ): Observable<WeeklyGoalResource> {
    return this.api.put<WeeklyGoalResource>('/weekly-goals', {
      student_id: studentId,
      week_id: weekId,
      target_text: targetText,
      is_completed: completed,
    });
  }
}

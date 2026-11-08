import { inject, Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { ApiClient } from './api-client';

export interface WorkspaceModule {
  id: number;
  code: string;
  name_ar: string;
  scope: 'weekly' | 'murajaa';
  max_points: string | number;
  is_in_weekly_total: number;
  sort_order: number;
}

export interface WorkspaceNote {
  note: string;
  tone: 'good' | 'focus' | 'neutral' | null;
  visibility: 'staff' | 'student';
}

export interface WorkspaceStudent {
  id: number;
  full_name: string;
  status: string;
  attendance: string | null;
  scores: Record<string, number>;
  notes: Record<string, WorkspaceNote>;
}

export interface SessionWorkspace {
  session: {
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
    status: 'planned' | 'done' | 'cancelled';
  };
  group: { id: number; name: string; center_id: number; teacher_id: number };
  modules: WorkspaceModule[];
  permissions: {
    attendance: boolean;
    hifz: boolean;
    murajaa: boolean;
    can_create_session: boolean;
  };
  students: WorkspaceStudent[];
}

export interface WorkspaceSavePayload {
  attendance?: Array<{ student_id: number; status: string }>;
  scores?: Array<{ student_id: number; module_id: number; score: number | null }>;
  notes?: Array<{
    student_id: number;
    module_code: string;
    note: string;
    tone?: 'good' | 'focus' | 'neutral' | null;
    visibility?: 'staff' | 'student';
  }>;
}

export interface CreateSessionPayload {
  week_id: number;
  planned_date: string;
  start_time: string;
  end_time: string;
  session_type: 'memorization' | 'revision' | 'exam';
}

@Injectable({ providedIn: 'root' })
export class WorkspaceService {
  private readonly api = inject(ApiClient);

  get(sessionId: number): Observable<SessionWorkspace> {
    return this.api.get<SessionWorkspace>(`/sessions/${sessionId}/workspace`);
  }

  save(sessionId: number, payload: WorkspaceSavePayload): Observable<SessionWorkspace> {
    return this.api.put<SessionWorkspace>(`/sessions/${sessionId}/workspace`, payload);
  }

  createSession(groupId: number, payload: CreateSessionPayload): Observable<{ id: number }> {
    return this.api.post<{ id: number }>(`/groups/${groupId}/sessions`, payload);
  }
}

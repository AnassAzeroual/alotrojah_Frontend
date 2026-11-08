import { inject, Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { ApiClient } from './api-client';

export interface TimelineScore {
  module_code: string;
  module_name: string;
  scope: 'weekly' | 'murajaa';
  score: number;
  legacy?: boolean;
}

export interface TimelineNote {
  module_code: string;
  note: string;
  tone: 'good' | 'focus' | 'neutral' | null;
  visibility: string;
  author_name: string | null;
}

export interface TimelineSession {
  id: number;
  term_id: number;
  week_id: number;
  session_number_global: number;
  session_number_in_week: number;
  session_type: 'memorization' | 'revision' | 'exam';
  planned_date: string | null;
  status: 'planned' | 'done' | 'cancelled';
  scores: TimelineScore[];
  notes: TimelineNote[];
  attendance: { status: string; notes: string | null } | null;
}

export interface TimelineModule {
  id: number;
  code: string;
  name_ar: string;
  scope: 'weekly' | 'murajaa';
  max_points: string | number;
  is_in_weekly_total: number;
  sort_order: number;
}

export interface StudentTimeline {
  student: {
    id: number;
    full_name: string;
    center_id: number;
    group_id: number | null;
    group_name: string | null;
    gender: string | null;
  };
  season: { id: number; name: string; start_date: string | null; end_date: string | null } | null;
  terms: Array<{ id: number; name: string; term_number: number }>;
  weeks: Array<{
    id: number;
    term_id: number;
    week_number_global: number;
    week_number_in_term: number;
    week_type: 'study' | 'review';
    start_date: string | null;
    end_date: string | null;
  }>;
  sessions: TimelineSession[];
  modules: TimelineModule[];
  summaries: {
    terms: Array<{
      id: number;
      name: string;
      murajaa_count: number;
      murajaa_average: number | null;
    }>;
    season: { murajaa_count: number; murajaa_average: number | null };
  };
}

@Injectable({ providedIn: 'root' })
export class TimelineService {
  private readonly api = inject(ApiClient);

  get(studentId: number, seasonId?: number): Observable<StudentTimeline> {
    return this.api.get<StudentTimeline>(
      `/students/${studentId}/timeline`,
      seasonId === undefined ? undefined : { season_id: seasonId },
    );
  }
}

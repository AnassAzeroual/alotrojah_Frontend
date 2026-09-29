import { inject, Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { ApiClient } from './api-client';

export interface TermQuizRow {
  exam_type: string;
  avg_score: number;
  questions_count: number;
}

export interface TermWeekRow {
  week_id: number;
  total_thumn: number;
  avg_score: number | null;
}

export interface TermReport {
  student: { id: number; full_name: string };
  term: { id: number; name_ar: string };
  result: {
    hifz_total: number | null;
    murajaa_total: number | null;
    exam_score: number | null;
    general_avg: number | null;
    honor_flag: string;
    teacher_notes: string | null;
  } | null;
  plan: { goal_text: string | null; start_hizb: number | null; end_hizb: number | null } | null;
  quizzes: TermQuizRow[];
  weekly: TermWeekRow[];
}

export interface SeasonTermRow {
  term_id: number;
  general_avg: number | null;
}

export interface SeasonReport {
  student: { id: number; full_name: string };
  result: {
    total_memorized_label: string | null;
    overall_avg: number | null;
    honor_flag: string;
    board_report: string | null;
  } | null;
  term_results: SeasonTermRow[];
  inputs: { avg_murajaa: number | null; avg_weekly: number | null; avg_sarraj: number | null };
  final: number | null;
}

@Injectable({ providedIn: 'root' })
export class ReportsService {
  private readonly api = inject(ApiClient);

  // Composite payloads shaped for the printable pages (backend assembles).
  term(studentId: number, termId: number): Observable<TermReport> {
    return this.api.get<TermReport>('/reports/term', { student_id: studentId, term_id: termId });
  }

  season(studentId: number, seasonId: number): Observable<SeasonReport> {
    return this.api.get<SeasonReport>('/reports/season', {
      student_id: studentId,
      season_id: seasonId,
    });
  }
}

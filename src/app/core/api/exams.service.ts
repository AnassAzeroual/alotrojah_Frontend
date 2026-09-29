import { inject, Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { ApiClient, QueryParams } from './api-client';
import { Paginated } from './api-models';

export interface Exam {
  id: number;
  student_id: number;
  season_id: number;
  term_id: number | null;
  exam_type: 'hizb_completion' | 'term_batch' | 'final_season';
  exam_date: string | null;
  examiner_id: number | null;
  overall_avg: number | null;
  examiner_report: string | null;
  questions?: ExamQuestion[];
}

export interface ExamQuestion {
  id: number;
  exam_id: number;
  question_no: number;
  prompt_text: string | null;
  hizb_ref: number | null;
  surah_ref: number | null;
  ayah_from: number | null;
  ayah_to: number | null;
  sort_order: number;
  model_type: string | null;
  score: number | null;
  notes: string | null;
}

export interface QuestionInput {
  question_no: number;
  prompt_text?: string;
  hizb_ref?: number;
  surah_ref?: number;
  ayah_from?: number;
  ayah_to?: number;
  score?: number;
  notes?: string;
}

@Injectable({ providedIn: 'root' })
export class ExamsService {
  private readonly api = inject(ApiClient);

  list(params?: QueryParams): Observable<Paginated<Exam>> {
    return this.api.get<Paginated<Exam>>('/exams', params);
  }

  create(payload: {
    student_id: number;
    exam_type: string;
    term_id?: number;
    season_id?: number;
    exam_date?: string;
  }): Observable<Exam> {
    return this.api.post<Exam>('/exams', payload);
  }

  get(id: number): Observable<Exam> {
    return this.api.get<Exam>(`/exams/${id}`);
  }

  update(id: number, patch: Partial<Exam>): Observable<Exam> {
    return this.api.patch<Exam>(`/exams/${id}`, patch);
  }

  remove(id: number): Observable<null> {
    return this.api.delete<null>(`/exams/${id}`);
  }

  addQuestions(examId: number, questions: QuestionInput[]): Observable<ExamQuestion[]> {
    return this.api.post<ExamQuestion[]>(`/exams/${examId}/questions`, { questions });
  }

  updateQuestion(id: number, patch: Partial<ExamQuestion>): Observable<ExamQuestion> {
    return this.api.patch<ExamQuestion>(`/exam-questions/${id}`, patch);
  }

  deleteQuestion(id: number): Observable<null> {
    return this.api.delete<null>(`/exam-questions/${id}`);
  }
}

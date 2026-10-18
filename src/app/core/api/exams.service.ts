import { inject, Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { ApiClient, QueryParams } from './api-client';
import {
  ExamQuestionBulkResponse,
  ExamQuestionReweightResponse,
  ExamQuestionsDestroyResponse,
  ExamQuestionsUpdateResponse,
  ExamsDestroyResponse,
  ExamsIndexResponse,
  ExamsShowResponse,
  ExamsStoreResponse,
  ExamsUpdateResponse,
  ExamWeeklyBatchResponse,
  ExamWeeklyTemplateResponse,
  ReweightExamQuestionsRequest,
  StoreExamRequest,
  StoreQuestionsBulkRequest,
  UpdateExamRequest,
  UpdateQuestionRequest,
  WeeklyBatchRequest,
} from './models';

@Injectable({ providedIn: 'root' })
export class ExamsService {
  private readonly api = inject(ApiClient);

  list(params?: QueryParams): Observable<ExamsIndexResponse['data']> {
    return this.api.get<ExamsIndexResponse['data']>('/exams', params);
  }

  create(payload: StoreExamRequest): Observable<ExamsStoreResponse['data']> {
    return this.api.post<ExamsStoreResponse['data']>('/exams', payload);
  }

  get(id: number): Observable<ExamsShowResponse['data']> {
    return this.api.get<ExamsShowResponse['data']>(`/exams/${id}`);
  }

  update(id: number, patch: UpdateExamRequest): Observable<ExamsUpdateResponse['data']> {
    return this.api.patch<ExamsUpdateResponse['data']>(`/exams/${id}`, patch);
  }

  remove(id: number): Observable<ExamsDestroyResponse['data']> {
    return this.api.delete<ExamsDestroyResponse['data']>(`/exams/${id}`);
  }

  addQuestions(
    examId: number,
    questions: StoreQuestionsBulkRequest['questions'],
  ): Observable<ExamQuestionBulkResponse['data']> {
    return this.api.post<ExamQuestionBulkResponse['data']>(`/exams/${examId}/questions`, {
      questions,
    });
  }

  reweight(
    examId: number,
    weights: ReweightExamQuestionsRequest['weights'],
  ): Observable<ExamQuestionReweightResponse['data']> {
    return this.api.put<ExamQuestionReweightResponse['data']>(`/exams/${examId}/question-weights`, {
      weights,
    });
  }

  updateQuestion(
    id: number,
    patch: UpdateQuestionRequest,
  ): Observable<ExamQuestionsUpdateResponse['data']> {
    return this.api.patch<ExamQuestionsUpdateResponse['data']>(`/exam-questions/${id}`, patch);
  }

  deleteQuestion(id: number): Observable<ExamQuestionsDestroyResponse['data']> {
    return this.api.delete<ExamQuestionsDestroyResponse['data']>(`/exam-questions/${id}`);
  }

  /** Weekly sheet bootstrap: season + active weekly modules + group pupils. */
  weeklyTemplate(groupId: number): Observable<ExamWeeklyTemplateResponse['data']> {
    return this.api.get<ExamWeeklyTemplateResponse['data']>('/exams/weekly-template', {
      group_id: groupId,
    });
  }

  /** Weekly batch save: one official weekly exam per pupil row. */
  weeklyBatch(payload: WeeklyBatchRequest): Observable<ExamWeeklyBatchResponse['data']> {
    return this.api.post<ExamWeeklyBatchResponse['data']>('/exams/weekly-batch', payload);
  }
}

import { inject, Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { ApiClient, QueryParams } from './api-client';
import {
  MurajaaDestroyLogResponse,
  MurajaaDestroyReviewResponse,
  MurajaaIndexLogsResponse,
  MurajaaIndexReviewsResponse,
  MurajaaStoreReviewResponse,
  StoreMurajaaReviewRequest,
} from './models';

@Injectable({ providedIn: 'root' })
export class ReviewsService {
  private readonly api = inject(ApiClient);

  cycles(params?: QueryParams): Observable<MurajaaIndexReviewsResponse['data']> {
    return this.api.get<MurajaaIndexReviewsResponse['data']>('/murajaa-reviews', params);
  }

  createCycle(payload: StoreMurajaaReviewRequest): Observable<MurajaaStoreReviewResponse['data']> {
    return this.api.post<MurajaaStoreReviewResponse['data']>('/murajaa-reviews', payload);
  }

  deleteCycle(id: number): Observable<MurajaaDestroyReviewResponse['data']> {
    return this.api.delete<MurajaaDestroyReviewResponse['data']>(`/murajaa-reviews/${id}`);
  }

  logs(params?: QueryParams): Observable<MurajaaIndexLogsResponse['data']> {
    return this.api.get<MurajaaIndexLogsResponse['data']>('/revision-logs', params);
  }

  deleteLog(id: number): Observable<MurajaaDestroyLogResponse['data']> {
    return this.api.delete<MurajaaDestroyLogResponse['data']>(`/revision-logs/${id}`);
  }
}

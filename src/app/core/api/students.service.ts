import { inject, Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { ApiClient, QueryParams } from './api-client';
import {
  StoreStudentRequest,
  StudentResource,
  StudentsIndexResponse,
  StudentUnlinkedAccountsResponse,
  UpdateStudentRequest,
} from './models';

@Injectable({ providedIn: 'root' })
export class StudentsService {
  private readonly api = inject(ApiClient);

  list(params?: QueryParams): Observable<StudentsIndexResponse['data']> {
    return this.api.get<StudentsIndexResponse['data']>('/students', params);
  }

  get(id: number): Observable<StudentResource> {
    return this.api.get<StudentResource>(`/students/${id}`);
  }

  create(payload: StoreStudentRequest): Observable<StudentResource> {
    return this.api.post<StudentResource>('/students', payload);
  }

  /** Partial update (group assignment, profile fields, status…). */
  update(id: number, payload: UpdateStudentRequest): Observable<StudentResource> {
    return this.api.put<StudentResource>(`/students/${id}`, payload);
  }

  /** Linkable login accounts: active student-role users with no pupil row. */
  unlinkedAccounts(centerId?: number | null): Observable<StudentUnlinkedAccountsResponse['data']> {
    return this.api.get<StudentUnlinkedAccountsResponse['data']>(
      '/students/unlinked-accounts',
      centerId ? { center_id: centerId } : undefined,
    );
  }
}

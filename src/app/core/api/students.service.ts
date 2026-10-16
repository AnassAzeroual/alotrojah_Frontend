import { inject, Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { ApiClient, QueryParams } from './api-client';
import { Paginated, Student, UpdateStudentPayload } from './api-models';

@Injectable({ providedIn: 'root' })
export class StudentsService {
  private readonly api = inject(ApiClient);

  list(params?: QueryParams): Observable<Paginated<Student>> {
    return this.api.get<Paginated<Student>>('/students', params);
  }

  get(id: number): Observable<Student> {
    return this.api.get<Student>(`/students/${id}`);
  }

  create(payload: import('./api-models').CreateStudentPayload): Observable<Student> {
    return this.api.post<Student>('/students', payload);
  }

  /** Partial update (group assignment, profile fields, status…). */
  update(id: number, payload: UpdateStudentPayload): Observable<Student> {
    return this.api.put<Student>(`/students/${id}`, payload);
  }

  /** Linkable login accounts: active student-role users with no pupil row. */
  unlinkedAccounts(centerId?: number | null): Observable<UnlinkedAccount[]> {
    return this.api.get<UnlinkedAccount[]>(
      '/students/unlinked-accounts',
      centerId ? { center_id: centerId } : undefined,
    );
  }
}

export interface UnlinkedAccount {
  id: number;
  full_name: string;
  email: string;
  center_id: number | null;
}

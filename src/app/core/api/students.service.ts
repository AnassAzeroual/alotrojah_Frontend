import { inject, Injectable } from '@angular/core';
import { firstValueFrom, Observable } from 'rxjs';
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

  /**
   * Every page (the list endpoint paginates 20/page). The entry sheet must
   * show the whole roster, not just page 1.
   */
  async listAll(params?: QueryParams): Promise<StudentResource[]> {
    const out: StudentResource[] = [];
    let page = 1;
    for (;;) {
      const res = await firstValueFrom(this.list({ ...params, page }));
      out.push(...res.data);
      if (res.meta.current_page * res.meta.per_page >= res.meta.total) break;
      page++;
    }
    return out;
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

import { inject, Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { ApiClient, QueryParams } from './api-client';
import { Paginated, RegistrationRequest, User } from './api-models';

/** Waiting-room registrations (admin only). */
@Injectable({ providedIn: 'root' })
export class RegistrationRequestsService {
  private readonly api = inject(ApiClient);

  list(params?: QueryParams): Observable<Paginated<RegistrationRequest>> {
    return this.api.get<Paginated<RegistrationRequest>>('/registration-requests', params);
  }

  /**
   * Copies the request into users (+ students when student) and removes it.
   * groupId places teacher/student accounts in the selected section; levelId
   * is required when accepting a student.
   */
  accept(
    id: number,
    centerId: number,
    groupId: number | null = null,
    levelId: number | null = null,
  ): Observable<User> {
    return this.api.post<User>(`/registration-requests/${id}/accept`, {
      center_id: centerId,
      ...(groupId !== null ? { group_id: groupId } : {}),
      ...(levelId !== null ? { level_id: levelId } : {}),
    });
  }

  /** Hard-deletes the request; the email can register again afterwards. */
  remove(id: number): Observable<null> {
    return this.api.delete<null>(`/registration-requests/${id}`);
  }
}

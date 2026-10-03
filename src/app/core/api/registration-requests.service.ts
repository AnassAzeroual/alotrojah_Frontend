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
   * groupId optionally links the new account to a group of the chosen center
   * (teacher → groups.teacher_id, student → students.group_id).
   */
  accept(id: number, centerId: number, groupId: number | null = null): Observable<User> {
    return this.api.post<User>(`/registration-requests/${id}/accept`, {
      center_id: centerId,
      ...(groupId !== null ? { group_id: groupId } : {}),
    });
  }

  /** Hard-deletes the request; the email can register again afterwards. */
  remove(id: number): Observable<null> {
    return this.api.delete<null>(`/registration-requests/${id}`);
  }
}

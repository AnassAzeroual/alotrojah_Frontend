import { inject, Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { ApiClient, QueryParams } from './api-client';
import {
  RegistrationRequestAcceptResponse,
  RegistrationRequestDestroyResponse,
  RegistrationRequestIndexResponse,
} from './models';

/** Waiting-room registrations (admin only). */
@Injectable({ providedIn: 'root' })
export class RegistrationRequestsService {
  private readonly api = inject(ApiClient);

  list(params?: QueryParams): Observable<RegistrationRequestIndexResponse['data']> {
    return this.api.get<RegistrationRequestIndexResponse['data']>('/registration-requests', params);
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
  ): Observable<RegistrationRequestAcceptResponse['data']> {
    return this.api.post<RegistrationRequestAcceptResponse['data']>(
      `/registration-requests/${id}/accept`,
      {
        center_id: centerId,
        ...(groupId !== null ? { group_id: groupId } : {}),
        ...(levelId !== null ? { level_id: levelId } : {}),
      },
    );
  }

  /** Hard-deletes the request; the email can register again afterwards. */
  remove(id: number): Observable<RegistrationRequestDestroyResponse['data']> {
    return this.api.delete<RegistrationRequestDestroyResponse['data']>(
      `/registration-requests/${id}`,
    );
  }
}

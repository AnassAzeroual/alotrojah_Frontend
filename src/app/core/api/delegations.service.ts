import { inject, Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { ApiClient } from './api-client';

export interface Delegation {
  id: number;
  group_id: number;
  duration_minutes: number;
  expires_at: string;
  used_by_teacher_id: number | null;
  is_revoked: boolean;
}

export interface GeneratedDelegation {
  delegation: Delegation;
  token: string;
  link: string;
  expires_at: string;
}

@Injectable({ providedIn: 'root' })
export class DelegationsService {
  private readonly api = inject(ApiClient);

  forGroup(groupId: number): Observable<Delegation[]> {
    return this.api.get<Delegation[]>(`/groups/${groupId}/delegations`);
  }

  generate(groupId: number, minutes: number): Observable<GeneratedDelegation> {
    return this.api.post<GeneratedDelegation>(`/groups/${groupId}/delegations`, { minutes });
  }

  redeem(token: string): Observable<{ group_id: number; expires_at: string }> {
    return this.api.post<{ group_id: number; expires_at: string }>('/delegations/redeem', {
      token,
    });
  }

  revoke(id: number): Observable<null> {
    return this.api.delete<null>(`/delegations/${id}`);
  }
}

import { inject, Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { ApiClient } from './api-client';
import {
  DelegationGenerateResponse,
  DelegationIndexResponse,
  DelegationRedeemResponse,
  DelegationRevokeResponse,
} from './models';

@Injectable({ providedIn: 'root' })
export class DelegationsService {
  private readonly api = inject(ApiClient);

  forGroup(groupId: number): Observable<DelegationIndexResponse['data']> {
    return this.api.get<DelegationIndexResponse['data']>(`/groups/${groupId}/delegations`);
  }

  generate(groupId: number, minutes: number): Observable<DelegationGenerateResponse['data']> {
    return this.api.post<DelegationGenerateResponse['data']>(`/groups/${groupId}/delegations`, {
      minutes,
    });
  }

  redeem(token: string): Observable<DelegationRedeemResponse['data']> {
    return this.api.post<DelegationRedeemResponse['data']>('/delegations/redeem', { token });
  }

  revoke(id: number): Observable<DelegationRevokeResponse['data']> {
    return this.api.delete<DelegationRevokeResponse['data']>(`/delegations/${id}`);
  }
}

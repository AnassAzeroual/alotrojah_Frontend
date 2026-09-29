import { inject, Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { ApiClient, QueryParams } from '../../core/api/api-client';
import { Guardian, Paginated } from '../../core/api/api-models';

@Injectable({ providedIn: 'root' })
export class GuardiansService {
  private readonly api = inject(ApiClient);

  list(params?: QueryParams): Observable<Paginated<Guardian>> {
    return this.api.get<Paginated<Guardian>>('/guardians', params);
  }
}

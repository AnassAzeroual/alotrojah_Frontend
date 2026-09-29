import { inject, Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { ApiClient, QueryParams } from './api-client';
import { Center, Paginated } from './api-models';

@Injectable({ providedIn: 'root' })
export class CentersService {
  private readonly api = inject(ApiClient);

  list(): Observable<Paginated<Center>> {
    return this.api.get<Paginated<Center>>('/centers');
  }
}

import { inject, Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { ApiClient, QueryParams } from './api-client';
import { Paginated, Student } from './api-models';

@Injectable({ providedIn: 'root' })
export class StudentsService {
  private readonly api = inject(ApiClient);

  list(params?: QueryParams): Observable<Paginated<Student>> {
    return this.api.get<Paginated<Student>>('/students', params);
  }

  get(id: number): Observable<Student> {
    return this.api.get<Student>(`/students/${id}`);
  }
}

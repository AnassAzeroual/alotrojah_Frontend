import { inject, Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { ApiClient } from './api-client';
import { ReportSeasonResponse, ReportTermResponse } from './models';

@Injectable({ providedIn: 'root' })
export class ReportsService {
  private readonly api = inject(ApiClient);

  // Composite payloads shaped for the printable pages (backend assembles).
  term(studentId: number, termId: number): Observable<ReportTermResponse['data']> {
    return this.api.get<ReportTermResponse['data']>('/reports/term', {
      student_id: studentId,
      term_id: termId,
    });
  }

  season(studentId: number, seasonId: number): Observable<ReportSeasonResponse['data']> {
    return this.api.get<ReportSeasonResponse['data']>('/reports/season', {
      student_id: studentId,
      season_id: seasonId,
    });
  }
}

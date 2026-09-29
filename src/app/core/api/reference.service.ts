import { inject, Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { ApiClient } from './api-client';

export interface Level {
  id: number;
  code: string;
  name_ar: string;
}

export interface Surah {
  id: number;
  name_ar: string;
  ayahs_count: number;
}

export interface HizbRef {
  hizb_no: number;
  juz_no: number;
  label_ar: string;
}

export interface Season {
  id: number;
  name: string;
  is_current: boolean;
}

@Injectable({ providedIn: 'root' })
export class ReferenceService {
  private readonly api = inject(ApiClient);

  levels(): Observable<Level[]> {
    return this.api.get<Level[]>('/reference/levels');
  }

  surahs(q?: string): Observable<Surah[]> {
    return this.api.get<Surah[]>('/reference/surahs', q ? { q } : undefined);
  }

  hizb(): Observable<HizbRef[]> {
    return this.api.get<HizbRef[]>('/reference/hizb');
  }

  seasons(): Observable<{ data: Season[] }> {
    return this.api.get<{ data: Season[] }>('/seasons');
  }
}

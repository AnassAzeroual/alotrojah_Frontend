import { inject, Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { ApiClient, QueryParams } from './api-client';
import { Paginated } from './api-models';

export interface OutboxMessage {
  id: number;
  recipient_phone: string;
  wa_link: string;
  channel: string;
  status: string;
  sent_at: string | null;
}

@Injectable({ providedIn: 'root' })
export class NotificationsService {
  private readonly api = inject(ApiClient);

  list(params?: QueryParams): Observable<Paginated<OutboxMessage>> {
    return this.api.get<Paginated<OutboxMessage>>('/notifications', params);
  }

  queue(recipientPhone: string, message: string): Observable<OutboxMessage> {
    return this.api.post<OutboxMessage>('/notifications', {
      recipient_phone: recipientPhone,
      message,
      channel: 'whatsapp',
    });
  }

  mark(id: number, status: 'sent' | 'failed'): Observable<OutboxMessage> {
    return this.api.patch<OutboxMessage>(`/notifications/${id}/status`, { status });
  }

  remove(id: number): Observable<null> {
    return this.api.delete<null>(`/notifications/${id}`);
  }
}

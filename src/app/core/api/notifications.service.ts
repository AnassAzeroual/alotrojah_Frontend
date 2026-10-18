import { inject, Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { ApiClient, QueryParams } from './api-client';
import {
  NotificationMarkResponse,
  NotificationsDestroyResponse,
  NotificationsIndexResponse,
  NotificationsStoreResponse,
  UpdateNotificationStatusRequest,
} from './models';

@Injectable({ providedIn: 'root' })
export class NotificationsService {
  private readonly api = inject(ApiClient);

  list(params?: QueryParams): Observable<NotificationsIndexResponse['data']> {
    return this.api.get<NotificationsIndexResponse['data']>('/notifications', params);
  }

  queue(recipientPhone: string, message: string): Observable<NotificationsStoreResponse['data']> {
    return this.api.post<NotificationsStoreResponse['data']>('/notifications', {
      recipient_phone: recipientPhone,
      message,
      channel: 'whatsapp',
    });
  }

  mark(
    id: number,
    status: UpdateNotificationStatusRequest['status'],
  ): Observable<NotificationMarkResponse['data']> {
    return this.api.patch<NotificationMarkResponse['data']>(`/notifications/${id}/status`, {
      status,
    });
  }

  remove(id: number): Observable<NotificationsDestroyResponse['data']> {
    return this.api.delete<NotificationsDestroyResponse['data']>(`/notifications/${id}`);
  }
}

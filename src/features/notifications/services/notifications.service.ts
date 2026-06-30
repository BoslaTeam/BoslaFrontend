import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { API_ENDPOINTS } from '../../../core/constants/api-endpoints';
import { ApiResponse } from '../../../core/models/api-response.model';
import { NotificationDto } from '../contracts/notifications.contracts';

@Injectable({ providedIn: 'root' })
export class NotificationsService {
  private http = inject(HttpClient);

  getNotifications(): Observable<ApiResponse<NotificationDto[]>> {
    return this.http.get<ApiResponse<NotificationDto[]>>(API_ENDPOINTS.notifications.mine);
  }

  markAsRead(id: string): Observable<ApiResponse<boolean>> {
    return this.http.put<ApiResponse<boolean>>(API_ENDPOINTS.notifications.markRead(id), {});
  }

  markAllAsRead(): Observable<ApiResponse<boolean>> {
    return this.http.put<ApiResponse<boolean>>(API_ENDPOINTS.notifications.markAllRead, {});
  }

  delete(id: string): Observable<ApiResponse<boolean>> {
    return this.http.delete<ApiResponse<boolean>>(API_ENDPOINTS.notifications.delete(id));
  }
}

import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, tap, map } from 'rxjs';
import { API_ENDPOINTS } from '@core/constants/api-endpoints';
import { ApiResponse } from '@core/models/api-response.model';
import { NotificationDto } from '../contracts/notifications.contracts';
import { NotificationPreferenceDto, UpdateNotificationPreferenceRequest } from '../contracts/notification-preferences.contracts';
import { NotificationService, AppNotification } from '@core/services/notification.service';

function toAppNotification(dto: NotificationDto): AppNotification {
  const typeMap: Record<string, number> = {
    Message: 0, Booking: 1, Reminder: 2, SpecialistVerification: 3, Withdrawal: 4,
    PortfolioApproved: 5, PortfolioRejected: 6, PortfolioPendingReview: 7,
  };
  const created = dto.createdAtUtc ?? new Date().toISOString();
  return {
    id: dto.id,
    type: (typeMap[dto.type ?? 'Message'] ?? 0) as any,
    title: dto.title,
    message: dto.message,
    isRead: dto.isRead,
    createdAtUtc: created,
    appointmentId: dto.appointmentId,
    appointmentStatus: dto.appointmentStatus,
  };
}

@Injectable({ providedIn: 'root' })
export class NotificationsService {
  private http = inject(HttpClient);
  private notificationState = inject(NotificationService);

  getNotifications(): Observable<ApiResponse<NotificationDto[]>> {
    return this.http.get<ApiResponse<NotificationDto[]>>(API_ENDPOINTS.notifications.mine)
      .pipe(
        tap((res) => {
          const data = Array.isArray(res.data) ? res.data : (res.data as any)?.items || [];
          this.notificationState.setAll(data.map(toAppNotification));
        })
      );
  }

  getUnreadCount(): Observable<ApiResponse<number>> {
    return this.http.get<ApiResponse<number>>(API_ENDPOINTS.notifications.unreadCount);
  }

  markAsRead(id: string): Observable<ApiResponse<boolean>> {
    this.notificationState.markAsRead(id);
    return this.http.put<ApiResponse<boolean>>(API_ENDPOINTS.notifications.markRead(id), {});
  }

  markAllAsRead(): Observable<ApiResponse<boolean>> {
    this.notificationState.markAllAsRead();
    return this.http.put<ApiResponse<boolean>>(API_ENDPOINTS.notifications.markAllRead, {});
  }

  delete(id: string): Observable<ApiResponse<boolean>> {
    return this.http.delete<ApiResponse<boolean>>(API_ENDPOINTS.notifications.delete(id))
      .pipe(tap(() => this.notificationState.remove(id)));
  }

  getPreferences(): Observable<ApiResponse<NotificationPreferenceDto[]>> {
    return this.http.get<ApiResponse<NotificationPreferenceDto[]>>(API_ENDPOINTS.notifications.preferences);
  }

  updatePreference(type: string, enabled: boolean): Observable<ApiResponse<boolean>> {
    const body: UpdateNotificationPreferenceRequest = { enabled };
    return this.http.put<ApiResponse<boolean>>(API_ENDPOINTS.notifications.updatePreference(type), body);
  }
}

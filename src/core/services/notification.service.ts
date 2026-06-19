import { Injectable, computed, signal } from '@angular/core';
import { NotificationType } from '../enums/notification-type.enum';

export interface AppNotification {
  id: string;
  type: NotificationType;
  title: string;
  message: string;
  isRead: boolean;
  createdAtUtc: string;
}

/**
 * Global notification state (badge counts, toast triggers).
 * SignalR push wiring + GET /notifications integration owned by `features/notifications`.
 */
@Injectable({ providedIn: 'root' })
export class NotificationService {
  private readonly _notifications = signal<AppNotification[]>([]);

  readonly notifications = this._notifications.asReadonly();
  readonly unreadCount = computed(() => this._notifications().filter((n) => !n.isRead).length);

  push(notification: AppNotification): void {
    this._notifications.update((list) => [notification, ...list]);
  }

  markAsRead(id: string): void {
    this._notifications.update((list) =>
      list.map((n) => (n.id === id ? { ...n, isRead: true } : n)),
    );
  }

  markAllAsRead(): void {
    this._notifications.update((list) => list.map((n) => ({ ...n, isRead: true })));
  }

  setAll(notifications: AppNotification[]): void {
    this._notifications.set(notifications);
  }
}
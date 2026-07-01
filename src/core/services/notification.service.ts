import { Injectable, computed, signal } from '@angular/core';
import { NotificationType } from '../enums/notification-type.enum';

export interface AppNotification {
  id: string;
  type: NotificationType;
  title: string;
  message: string;
  isRead: boolean;
  createdAtUtc: string;
  appointmentId?: string;
  appointmentStatus?: number;
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

  /** Fired only on real-time push (not setAll) for toast component */
  private readonly _livePush = signal<AppNotification | null>(null);
  readonly livePush = this._livePush.asReadonly();

  push(notification: AppNotification): void {
    this._notifications.update((list) => [notification, ...list]);
    this._livePush.set(notification);
  }

  markAsRead(id: string): void {
    this._notifications.update((list) =>
      list.map((n) => (n.id === id ? { ...n, isRead: true } : n)),
    );
  }

  markAllAsRead(): void {
    this._notifications.update((list) => list.map((n) => ({ ...n, isRead: true })));
  }

  remove(id: string): void {
    this._notifications.update((list) => list.filter((n) => n.id !== id));
  }

  setAll(notifications: AppNotification[]): void {
    this._notifications.set(notifications);
  }
}
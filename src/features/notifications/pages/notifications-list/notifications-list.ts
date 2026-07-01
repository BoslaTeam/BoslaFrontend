import { Component, OnInit, inject, signal, computed } from '@angular/core';
import { CommonModule, DatePipe } from '@angular/common';
import { NotificationsService } from '../../services/notifications.service';
import { NotificationService } from '@core/services/notification.service';

@Component({
  selector: 'app-notifications-list',
  standalone: true,
  imports: [CommonModule, DatePipe],
  templateUrl: './notifications-list.html',
})
export class NotificationsList implements OnInit {
  private notificationsService = inject(NotificationsService);
  private notificationState = inject(NotificationService);

  notifications = this.notificationState.notifications;
  unreadCount = this.notificationState.unreadCount;
  isLoading = signal(true);
  activeTab = signal<'all' | 'unread' | 'read'>('all');
  readonly tabs = [
    { key: 'all' as const, label: 'الكل' },
    { key: 'unread' as const, label: 'غير المقروءة' },
    { key: 'read' as const, label: 'المقروءة' },
  ];

  filteredNotifications = computed(() => {
    const all = this.notifications();
    const tab = this.activeTab();
    if (tab === 'unread') return all.filter(n => !n.isRead);
    if (tab === 'read') return all.filter(n => n.isRead);
    return all;
  });

  ngOnInit() {
    this.notificationsService.getNotifications().subscribe({
      next: () => this.isLoading.set(false),
      error: () => {
        this.isLoading.set(false);
        this.notificationState.setAll([
          {
            id: '1', type: 1 as any, title: 'تأكيد الحجز',
            message: 'تم تأكيد حجزك مع المتخصص أحمد يوسف.', isRead: false,
            createdAtUtc: new Date().toISOString(),
          },
          {
            id: '2', type: 2 as any, title: 'تذكير بموعد',
            message: 'لديك جلسة غداً في تمام الساعة 5:00 مساءً.', isRead: true,
            createdAtUtc: new Date(Date.now() - 86400000).toISOString(),
          },
        ]);
      }
    });
  }

  markAsRead(id: string) {
    this.notificationsService.markAsRead(id).subscribe();
  }

  markAllAsRead() {
    this.notificationsService.markAllAsRead().subscribe({
      error: () => {
        this.notificationsService.getNotifications().subscribe();
      }
    });
  }

  deleteNotification(id: string, event: MouseEvent) {
    event.stopPropagation();
    this.notificationsService.delete(id).subscribe({
      next: () => this.notificationState.remove(id),
    });
  }

  setTab(tab: 'all' | 'unread' | 'read') {
    this.activeTab.set(tab);
  }
}

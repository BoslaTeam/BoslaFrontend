import { Component, OnInit, inject, signal, computed } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';
import { NotificationsService } from '../../services/notifications.service';
import { NotificationService, AppNotification } from '@core/services/notification.service';
import { NotificationType } from '@core/enums/notification-type.enum';

import { TranslatePipe } from '@shared/pipes/translate.pipe';
import { TranslationService } from '@core/services/translation.service';
@Component({
  selector: 'app-notifications-list',
  standalone: true,
  imports: [CommonModule, TranslatePipe],
  templateUrl: './notifications-list.html',
})
export class NotificationsList implements OnInit {
  protected readonly NotificationType = NotificationType;
  private notificationsService = inject(NotificationsService);
  private notificationState = inject(NotificationService);
  private router = inject(Router);
  private translationService = inject(TranslationService);

  readonly direction = computed(() => this.translationService.currentLang() === 'ar' ? 'rtl' : 'ltr');
  notifications = this.notificationState.notifications;
  unreadCount = this.notificationState.unreadCount;
  isLoading = signal(true);
  activeTab = signal<'all' | 'unread' | 'read'>('all');
  readonly tabs = [
    { key: 'all' as const, labelKey: 'notifications.filterAll' },
    { key: 'unread' as const, labelKey: 'notifications.filterUnread' },
    { key: 'read' as const, labelKey: 'notifications.filterRead' },
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

  markAsRead(notif: AppNotification) {
    this.notificationsService.markAsRead(notif.id).subscribe();
    if (!notif.appointmentId) return;
    if (notif.type === NotificationType.Message) {
      this.router.navigate(['/chat', notif.appointmentId]);
    } else if (notif.type === NotificationType.Reminder) {
      this.router.navigate(['/appointments', notif.appointmentId]);
    } else {
      this.router.navigate(['/appointments', notif.appointmentId, 'pay']);
    }
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

  notificationTitle(notif: AppNotification): string {
    const keyMap: Record<number, string> = {
      [NotificationType.SpecialistVerification]: 'notifications.verification',
      [NotificationType.Booking]: 'notifications.newAppointment',
      [NotificationType.Message]: 'notifications.type.message',
      [NotificationType.Reminder]: 'notifications.reminder',
    };
    const key = keyMap[notif.type];
    return key ? this.translationService.translate(key) : notif.title;
  }

  notificationMessage(notif: AppNotification): string {
    return notif.message || '';
  }

  relativeTime(utc: string): string {
    const now = Date.now();
    const date = new Date(utc).getTime();
    const diff = now - date;
    const minutes = Math.floor(diff / 60000);
    const hours = Math.floor(diff / 3600000);
    const days = Math.floor(diff / 86400000);

    const t = (key: string, ...args: any[]) => this.translationService.translate(key, ...args);

    if (minutes < 1) return t('time.now');
    if (minutes < 60) return t('time.minutesAgo', minutes);
    if (hours < 24) return t('time.hoursAgo', hours);
    if (days < 7) return t('time.daysAgo', days);
    const locale = this.translationService.currentLang() === 'ar' ? 'ar-EG' : 'en-US';
    return new Date(utc).toLocaleDateString(locale, { day: 'numeric', month: 'short' });
  }

  setTab(tab: 'all' | 'unread' | 'read') {
    this.activeTab.set(tab);
  }
}

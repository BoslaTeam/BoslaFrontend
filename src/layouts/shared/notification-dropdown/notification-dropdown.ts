import { Component, inject, input, output, HostListener, OnInit } from '@angular/core';
import { RouterLink, Router } from '@angular/router';
import { NotificationService, AppNotification } from '@core/services/notification.service';
import { NotificationsService } from '@features/notifications/services/notifications.service';
import { NavigationService } from '@core/navigation/navigation.service';
import { NotificationType } from '@core/enums/notification-type.enum';
import { TranslationService } from '@core/services/translation.service';

import { TranslatePipe } from '@shared/pipes/translate.pipe';
@Component({
  selector: 'app-notification-dropdown',
  standalone: true,
  imports: [RouterLink, TranslatePipe],
  templateUrl: './notification-dropdown.html',
  styleUrl: './notification-dropdown.css',
})
export class NotificationDropdown implements OnInit {
  readonly isOpen = input(false);
  readonly close = output<void>();

  protected readonly notificationType = NotificationType;

  private notificationService = inject(NotificationService);
  private httpService = inject(NotificationsService);
  private navigationService = inject(NavigationService);
  private router = inject(Router);
  private readonly translationService = inject(TranslationService);

  readonly notifications = this.notificationService.notifications;
  readonly unreadCount = this.notificationService.unreadCount;
  readonly notifRoute = this.navigationService.notificationsRoute;

  ngOnInit() {
    if (this.notifications().length === 0) {
      this.httpService.getNotifications().subscribe({ error: () => {} });
    }
  }

  get latest(): AppNotification[] {
    return this.notifications().slice(0, 5);
  }

  iconType(type: NotificationType): string {
    switch (type) {
      case NotificationType.SpecialistVerification: return 'verification';
      case NotificationType.Booking: return 'booking';
      case NotificationType.Message: return 'message';
      default: return 'reminder';
    }
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

  @HostListener('document:click', ['$event'])
  onDocClick(e: MouseEvent) {
    const target = e.target as HTMLElement;
    if (!target.closest('app-notification-dropdown') && !target.closest('[data-notif-toggle]')) {
      this.close.emit();
    }
  }

  markAsRead(notif: AppNotification, e: MouseEvent) {
    e.stopPropagation();
    this.close.emit();
    this.httpService.markAsRead(notif.id).subscribe({ error: () => {} });
    if (!notif.appointmentId) return;
    if (notif.type === NotificationType.Message) {
      this.router.navigate(['/chat', notif.appointmentId]);
    } else if (notif.type === NotificationType.Reminder) {
      this.router.navigate(['/appointments', notif.appointmentId]);
    } else {
      this.router.navigate(['/appointments', notif.appointmentId, 'pay']);
    }
  }
}

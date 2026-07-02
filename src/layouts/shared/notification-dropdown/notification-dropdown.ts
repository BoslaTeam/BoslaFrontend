import { Component, inject, input, output, HostListener, OnInit } from '@angular/core';
import { RouterLink, Router } from '@angular/router';
import { NotificationService, AppNotification } from '@core/services/notification.service';
import { NotificationsService } from '@features/notifications/services/notifications.service';
import { NavigationService } from '@core/navigation/navigation.service';
import { NotificationType } from '@core/enums/notification-type.enum';

@Component({
  selector: 'app-notification-dropdown',
  standalone: true,
  imports: [RouterLink],
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

    if (minutes < 1) return 'الآن';
    if (minutes < 60) return `منذ ${minutes} د`;
    if (hours < 24) return `منذ ${hours} س`;
    if (days < 7) return `منذ ${days} ي`;
    return new Date(utc).toLocaleDateString('ar-EG', { day: 'numeric', month: 'short' });
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
      this.router.navigate(['/communications', notif.appointmentId]);
    } else {
      this.router.navigate(['/appointments', notif.appointmentId, 'pay']);
    }
  }
}

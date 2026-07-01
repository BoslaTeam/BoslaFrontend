import { Component, inject, input, output, HostListener, OnInit } from '@angular/core';
import { RouterLink } from '@angular/router';
import { NotificationService, AppNotification } from '@core/services/notification.service';
import { NotificationsService } from '@features/notifications/services/notifications.service';
import { NavigationService } from '@core/navigation/navigation.service';

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

  private notificationService = inject(NotificationService);
  private httpService = inject(NotificationsService);
  private navigationService = inject(NavigationService);

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

  @HostListener('document:click', ['$event'])
  onDocClick(e: MouseEvent) {
    const target = e.target as HTMLElement;
    if (!target.closest('app-notification-dropdown') && !target.closest('[data-notif-toggle]')) {
      this.close.emit();
    }
  }

  markAsRead(id: string, e: MouseEvent) {
    e.stopPropagation();
    this.httpService.markAsRead(id).subscribe({ error: () => {} });
  }
}

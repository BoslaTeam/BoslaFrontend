import { Component, OnInit, inject, signal } from '@angular/core';
import { CommonModule, DatePipe } from '@angular/common';
import { NotificationsService } from '../../services/notifications.service';
import { NotificationDto } from '../../contracts/notifications.contracts';

@Component({
  selector: 'app-notifications-list',
  standalone: true,
  imports: [CommonModule, DatePipe],
  templateUrl: './notifications-list.html',
})
export class NotificationsList implements OnInit {
  private notificationsService = inject(NotificationsService);

  notifications = signal<NotificationDto[]>([]);
  isLoading = signal(true);

  ngOnInit() {
    this.loadNotifications();
  }

  loadNotifications() {
    this.isLoading.set(true);
    this.notificationsService.getNotifications().subscribe({
      next: (res) => {
        // Fallback to empty array if data is null, handling the wrapper structure properly
        const data = Array.isArray(res.data) ? res.data : (res.data as any)?.items || [];
        this.notifications.set(data);
        this.isLoading.set(false);
      },
      error: (err) => {
        console.error('Error loading notifications', err);
        // Fallback mock data if API fails to test UI
        this.notifications.set([
          { id: '1', userId: 'usr1', title: 'تأكيد الحجز', message: 'تم تأكيد حجزك مع المتخصص أحمد يوسف.', isRead: false, createdAt: new Date().toISOString() },
          { id: '2', userId: 'usr1', title: 'تذكير بموعد', message: 'لديك جلسة غداً في تمام الساعة 5:00 مساءً.', isRead: true, createdAt: new Date(Date.now() - 86400000).toISOString() }
        ]);
        this.isLoading.set(false);
      }
    });
  }

  markAsRead(id: string) {
    const notif = this.notifications().find(n => n.id === id);
    if (notif && !notif.isRead) {
      notif.isRead = true; // Optimistic update
      this.notificationsService.markAsRead(id).subscribe({
        error: () => {
          notif.isRead = false; // Revert on failure
        }
      });
    }
  }

  markAllAsRead() {
    const updated = this.notifications().map(n => ({ ...n, isRead: true }));
    this.notifications.set(updated); // Optimistic update
    
    this.notificationsService.markAllAsRead().subscribe({
      error: () => {
        this.loadNotifications(); // Revert on failure by reloading
      }
    });
  }
}

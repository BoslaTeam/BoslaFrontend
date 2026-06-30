import { Component, OnInit, inject, signal } from '@angular/core';
import { CommonModule, DatePipe } from '@angular/common';
import { HttpClient } from '@angular/common/http';
import { NotificationsService } from '../../services/notifications.service';
import { NotificationDto } from '../../contracts/notifications.contracts';
import { AppNotification, NotificationService } from '@core/services/notification.service';
import { API_ENDPOINTS } from '@core/constants/api-endpoints';
import { ToastService } from '@core/services/toast.service';

const PAID_STATUSES = new Set([2, 5]); // Completed(2), Paid(5)

@Component({
  selector: 'app-notifications-list',
  standalone: true,
  imports: [CommonModule, DatePipe],
  templateUrl: './notifications-list.html',
})
export class NotificationsList implements OnInit {
  private http = inject(HttpClient);
  private toast = inject(ToastService);
  private apiService = inject(NotificationsService);
  private notificationService = inject(NotificationService);

  notifications = signal<AppNotification[]>([]);
  isLoading = signal(true);

  ngOnInit() {
    this.loadNotifications();
  }

  loadNotifications() {
    this.isLoading.set(true);
    this.apiService.getNotifications().subscribe({
      next: (res) => {
        const raw = Array.isArray(res.data) ? res.data : (res.data as any)?.items || [];
        const mapped: AppNotification[] = raw.map((n: NotificationDto) => ({
          id: n.id,
          type: parseInt(n.type, 10) || 1,
          title: n.title,
          message: n.message,
          isRead: n.isRead,
          createdAtUtc: n.createdAtUtc,
          appointmentId: n.appointmentId,
          appointmentStatus: n.appointmentStatus,
        }));
        this.notifications.set(mapped);
        this.notificationService.setAll(mapped);
        this.isLoading.set(false);
      },
      error: (err) => {
        console.error('Error loading notifications', err);
        this.notifications.set([]);
        this.isLoading.set(false);
      }
    });
  }

  markAsRead(id: string) {
    const notif = this.notifications().find(n => n.id === id);
    if (notif && !notif.isRead) {
      notif.isRead = true;
      this.notificationService.markAsRead(id);
      this.apiService.markAsRead(id).subscribe({
        error: () => {
          notif.isRead = false;
          this.notificationService.setAll(this.notifications());
        }
      });
    }
  }

  markAllAsRead() {
    const updated = this.notifications().map(n => ({ ...n, isRead: true }));
    this.notifications.set(updated);
    this.notificationService.markAllAsRead();

    this.apiService.markAllAsRead().subscribe({
      error: () => {
        this.loadNotifications();
      }
    });
  }

  deleteNotification(id: string, event: MouseEvent) {
    event.stopPropagation();
    this.notifications.update((list) => list.filter((n) => n.id !== id));
    this.notificationService.remove(id);

    this.apiService.delete(id).subscribe({
      error: () => {
        this.loadNotifications();
      }
    });
  }

  isPaymentDone(status?: number): boolean {
    return status !== undefined && PAID_STATUSES.has(status);
  }

  payForAppointment(appointmentId: string, event: MouseEvent) {
    event.stopPropagation();
    const notif = this.notifications().find(n => n.appointmentId === appointmentId);
    if (notif && this.isPaymentDone(notif.appointmentStatus)) return;
    this.http.put(API_ENDPOINTS.appointments.markAsPaid(appointmentId), {}).subscribe({
      next: () => {
        this.toast.success('تم اتمام الدفع بنجاح');
        this.notifications.update(list => list.map(n =>
          n.appointmentId === appointmentId ? { ...n, appointmentStatus: 5 } : n
        ));
      },
      error: () => this.toast.danger('فشل اتمام الدفع'),
    });
  }
}

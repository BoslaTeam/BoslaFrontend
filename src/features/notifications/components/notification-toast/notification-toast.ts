import { Component, inject, signal, effect } from '@angular/core';
import { Router } from '@angular/router';
import { NotificationService, AppNotification } from '@core/services/notification.service';
import { NotificationType } from '@core/enums/notification-type.enum';

interface ToastItem {
  id: string;
  title: string;
  message: string;
  visible: boolean;
  appointmentId?: string;
  type: number;
}

@Component({
  selector: 'app-notification-toast',
  standalone: true,
  imports: [],
  templateUrl: './notification-toast.html',
  styleUrl: './notification-toast.css',
})
export class NotificationToast {
  private notificationService = inject(NotificationService);
  private router = inject(Router);

  toasts = signal<ToastItem[]>([]);
  private timers = new Map<string, ReturnType<typeof setTimeout>>();

  constructor() {
    effect(() => {
      const push = this.notificationService.livePush();
      if (push) {
        this.showToast(push);
      }
    });
  }

  private showToast(n: AppNotification): void {
    const item: ToastItem = { id: n.id, title: n.title, message: n.message, visible: true, appointmentId: n.appointmentId, type: n.type };
    this.toasts.update(list => [...list, item]);

    const timer = setTimeout(() => this.dismiss(n.id), 5000);
    this.timers.set(n.id, timer);
  }

  dismiss(id: string): void {
    this.toasts.update(list => list.map(t => t.id === id ? { ...t, visible: false } : t));
    const timer = this.timers.get(id);
    if (timer) { clearTimeout(timer); this.timers.delete(id); }
    setTimeout(() => {
      this.toasts.update(list => list.filter(t => t.id !== id));
    }, 350);
  }

  onClickToast(item: ToastItem): void {
    this.dismiss(item.id);
    if (!item.appointmentId) return;
    if (item.type === NotificationType.Message) {
      this.router.navigate(['/communications', item.appointmentId]);
    } else {
      this.router.navigate(['/appointments', item.appointmentId, 'pay']);
    }
  }
}

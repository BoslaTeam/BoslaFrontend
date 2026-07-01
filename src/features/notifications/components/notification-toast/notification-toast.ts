import { Component, inject, signal, effect } from '@angular/core';
import { NotificationService } from '@core/services/notification.service';

interface ToastItem {
  id: string;
  title: string;
  message: string;
  visible: boolean;
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

  private showToast(n: { id: string; title: string; message: string }): void {
    const item: ToastItem = { id: n.id, title: n.title, message: n.message, visible: true };
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
}

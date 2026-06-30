import { Injectable, inject, DestroyRef, effect } from '@angular/core';
import { NotificationService } from './notification.service';

@Injectable({ providedIn: 'root' })
export class FaviconBadgeService {
  private notificationService = inject(NotificationService);
  private destroyRef = inject(DestroyRef);

  private originalHref: string | null = null;
  private linkEl: HTMLLinkElement | null = null;
  private canvas = document.createElement('canvas');
  private ctx = this.canvas.getContext('2d')!;
  private readonly SIZE = 32;

  constructor() {
    this.canvas.width = this.SIZE;
    this.canvas.height = this.SIZE;

    const links = document.querySelectorAll<HTMLLinkElement>('link[rel*="icon"]');
    this.linkEl = links[0] ?? null;
    this.originalHref = this.linkEl?.href ?? null;

    effect(() => {
      const count = this.notificationService.unreadCount();
      this.update(count);
    });

    this.destroyRef.onDestroy(() => this.restore());
  }

  private update(count: number): void {
    if (!this.linkEl) return;

    if (count === 0) {
      this.restore();
      return;
    }

    this.ctx.clearRect(0, 0, this.SIZE, this.SIZE);

    this.ctx.beginPath();
    this.ctx.arc(this.SIZE / 2, this.SIZE / 2, this.SIZE / 2 - 1, 0, Math.PI * 2);
    this.ctx.fillStyle = '#1B4F72';
    this.ctx.fill();

    this.ctx.fillStyle = '#F39C12';
    this.ctx.font = 'bold 18px Arial';
    this.ctx.textAlign = 'center';
    this.ctx.textBaseline = 'middle';
    this.ctx.fillText('ب', this.SIZE / 2, this.SIZE / 2 - 1);

    const display = count > 99 ? '99+' : String(count);
    const badgeX = this.SIZE - 1;
    const badgeY = 1;
    const badgeR = display.length > 2 ? 8 : 7;

    this.ctx.beginPath();
    this.ctx.arc(badgeX, badgeY, badgeR, 0, Math.PI * 2);
    this.ctx.fillStyle = '#dc2626';
    this.ctx.fill();

    this.ctx.strokeStyle = '#fff';
    this.ctx.lineWidth = 1.5;
    this.ctx.stroke();

    this.ctx.fillStyle = '#fff';
    this.ctx.font = 'bold 10px Arial';
    this.ctx.textAlign = 'center';
    this.ctx.textBaseline = 'middle';
    this.ctx.fillText(display, badgeX, badgeY);

    this.linkEl.href = this.canvas.toDataURL();
  }

  private restore(): void {
    if (this.linkEl && this.originalHref && this.linkEl.href !== this.originalHref) {
      this.linkEl.href = this.originalHref;
    }
  }
}

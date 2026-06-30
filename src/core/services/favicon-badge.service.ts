import { Injectable, inject, DestroyRef, effect } from '@angular/core';
import { NotificationService } from './notification.service';

@Injectable({ providedIn: 'root' })
export class FaviconBadgeService {
  private notificationService = inject(NotificationService);
  private destroyRef = inject(DestroyRef);

  private originalHref = '';
  private badgeLink: HTMLLinkElement | null = null;
  private baseBitmap: ImageBitmap | null = null;
  private loading = false;
  private canvas: HTMLCanvasElement;
  private ctx: CanvasRenderingContext2D;
  private readonly SIZE = 64;

  constructor() {
    this.canvas = document.createElement('canvas');
    this.canvas.width = this.SIZE;
    this.canvas.height = this.SIZE;
    this.ctx = this.canvas.getContext('2d')!;

    const links = document.querySelectorAll<HTMLLinkElement>('link[rel*="icon"]');
    const originalLink = links[0] ?? null;
    this.originalHref = originalLink?.href ?? '';
    this.loadBaseImage();

    effect(() => {
      const count = this.notificationService.unreadCount();
      this.drawBadge(count);
    });

    this.destroyRef.onDestroy(() => {
      this.removeBadgeLink();
      this.baseBitmap?.close();
    });
  }

  private async loadBaseImage(): Promise<void> {
    if (!this.originalHref || this.loading) return;
    this.loading = true;
    try {
      const resp = await fetch(this.originalHref);
      const blob = await resp.blob();
      this.baseBitmap = await createImageBitmap(blob);
    } catch {
      this.baseBitmap = null;
    }
    this.loading = false;
  }

  private ensureBadgeLink(): HTMLLinkElement {
    if (!this.badgeLink) {
      this.badgeLink = document.createElement('link');
      this.badgeLink.rel = 'icon';
      this.badgeLink.id = 'bosla-favicon-badge';
      document.head.appendChild(this.badgeLink);
    }
    return this.badgeLink;
  }

  private removeBadgeLink(): void {
    if (this.badgeLink && this.badgeLink.parentNode) {
      this.badgeLink.parentNode.removeChild(this.badgeLink);
    }
    this.badgeLink = null;
  }

  private drawBadge(count: number): void {
    if (count === 0) {
      this.removeBadgeLink();
      return;
    }

    const link = this.ensureBadgeLink();

    if (this.baseBitmap) {
      this.renderWithBase(this.baseBitmap, link, count);
    } else if (this.loading) {
      setTimeout(() => this.drawBadge(this.notificationService.unreadCount()), 100);
    } else {
      this.renderFallback(link, count);
    }
  }

  private renderWithBase(bitmap: ImageBitmap, link: HTMLLinkElement, count: number): void {
    const s = this.SIZE;
    const ctx = this.ctx;
    ctx.clearRect(0, 0, s, s);
    ctx.drawImage(bitmap, 0, 0, s, s);
    this.drawOverlay(ctx, s, count);
    link.href = this.canvas.toDataURL();
  }

  private drawOverlay(ctx: CanvasRenderingContext2D, s: number, count: number): void {
    const display = count > 99 ? '99+' : String(count);
    ctx.beginPath();
    ctx.arc(s - 8, 8, display.length > 2 ? 20 : 17, 0, Math.PI * 2);
    ctx.fillStyle = '#dc2626';
    ctx.fill();
    ctx.strokeStyle = '#fff';
    ctx.lineWidth = 3;
    ctx.stroke();
    ctx.fillStyle = '#fff';
    ctx.font = `bold ${display.length > 2 ? 18 : 20}px Arial`;
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    ctx.fillText(display, s - 8, 9);
  }

  private renderFallback(link: HTMLLinkElement, count: number): void {
    const s = this.SIZE;
    const ctx = this.ctx;
    ctx.clearRect(0, 0, s, s);
    ctx.fillStyle = '#1B4F72';
    ctx.beginPath();
    ctx.arc(s / 2, s / 2, s / 2, 0, Math.PI * 2);
    ctx.fill();
    ctx.fillStyle = '#fff';
    ctx.font = 'bold 32px Arial';
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    ctx.fillText('ب', s / 2, s / 2);
    this.drawOverlay(ctx, s, count);
    link.href = this.canvas.toDataURL();
  }
}

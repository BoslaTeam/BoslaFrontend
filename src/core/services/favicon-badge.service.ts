import { Injectable, inject, DestroyRef, effect } from '@angular/core';
import { NotificationService } from './notification.service';

@Injectable({ providedIn: 'root' })
export class FaviconBadgeService {
  private notificationService = inject(NotificationService);
  private destroyRef = inject(DestroyRef);

  private targetLink: HTMLLinkElement | null = null;
  private savedHref = '';
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
    this.targetLink = links[0] ?? null;
    this.savedHref = this.targetLink?.href ?? '';

    if (this.targetLink) {
      this.loadBaseImage();
    }

    effect(() => {
      const count = this.notificationService.unreadCount();
      this.drawBadge(count);
    });

    this.destroyRef.onDestroy(() => {
      this.restoreOriginal();
      this.baseBitmap?.close();
    });
  }

  private restoreOriginal(): void {
    if (this.targetLink && this.savedHref) {
      this.targetLink.href = this.savedHref;
    }
  }

  private async loadBaseImage(): Promise<void> {
    if (!this.savedHref || this.loading || this.baseBitmap) return;
    this.loading = true;
    try {
      const resp = await fetch(this.savedHref, { cache: 'no-cache' });
      if (!resp.ok) throw new Error(`HTTP ${resp.status}`);
      const blob = await resp.blob();
      this.baseBitmap = await createImageBitmap(blob);
    } catch (err) {
      console.warn('[FaviconBadge] fallback – could not load base image:', err);
      this.baseBitmap = null;
    }
    this.loading = false;
  }

  private drawBadge(count: number): void {
    if (!this.targetLink) return;

    if (count === 0) {
      this.restoreOriginal();
      return;
    }

    if (this.baseBitmap) {
      this.renderWithBase(this.targetLink, count);
    } else {
      if (this.loading) {
        setTimeout(() => this.drawBadge(this.notificationService.unreadCount()), 200);
      } else {
        this.renderFallback(this.targetLink, count);
        if (this.savedHref) {
          this.loadBaseImage().then(() => {
            if (this.baseBitmap && this.notificationService.unreadCount() > 0) {
              this.drawBadge(this.notificationService.unreadCount());
            }
          });
        }
      }
    }
  }

  private renderWithBase(link: HTMLLinkElement, count: number): void {
    const s = this.SIZE;
    const ctx = this.ctx;
    ctx.clearRect(0, 0, s, s);
    ctx.drawImage(this.baseBitmap!, 0, 0, s, s);
    this.drawOverlay(ctx, s, count);
    link.href = this.canvas.toDataURL();
  }

  private drawOverlay(ctx: CanvasRenderingContext2D, s: number, count: number): void {
    const display = count > 99 ? '99+' : String(count);
    const cx = s - 9;
    const cy = 9;
    const r = display.length > 2 ? 21 : 18;

    ctx.beginPath();
    ctx.arc(cx, cy, r, 0, Math.PI * 2);
    ctx.fillStyle = '#dc2626';
    ctx.fill();
    ctx.strokeStyle = '#fff';
    ctx.lineWidth = 3;
    ctx.stroke();
    ctx.fillStyle = '#fff';
    ctx.font = `bold ${display.length > 2 ? 18 : 20}px Arial`;
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    ctx.fillText(display, cx, cy + 1);
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
import {
  Component,
  ChangeDetectionStrategy,
  CUSTOM_ELEMENTS_SCHEMA,
  ElementRef,
  HostListener,
  PLATFORM_ID,
  inject,
  output,
  signal,
} from '@angular/core';
import { isPlatformBrowser } from '@angular/common';

/**
 * BoslaEmojiPicker
 * ─────────────────────────────────────────────────────────────────────────────
 * Reusable emoji picker built on top of `emoji-picker-element` (Web Component).
 *
 * Responsive strategy (Bosla-specific)
 * ─────────────────────────────────────
 * ≥ 768px (md)  → Floating popover, opens upward, anchored to inset-inline-end.
 *                 Width is 340 px, capped at calc(100vw − 32 px) for safety.
 * < 768px       → Fixed bottom-sheet with dim backdrop + drag handle.
 *                 Width is 100vw — no overflow possible.
 *
 * Why 768px?  The rest of the Bosla app uses md (768 px) as the
 * mobile/desktop boundary (isMobileView, md: Tailwind breakpoint).
 * The previous breakpoint (max-width: 639px = Tailwind `sm`) left the
 * 640–767 px range using the desktop popover, which would overflow a
 * viewport narrower than 340 px + the button's right offset.
 */
@Component({
  selector: 'bosla-emoji-picker',
  standalone: true,
  imports: [],
  schemas: [CUSTOM_ELEMENTS_SCHEMA],
  changeDetection: ChangeDetectionStrategy.OnPush,
  styles: [`
    /* ── Host: positioning context for the absolute popover ────────────── */
    :host {
      position: relative;
      display: inline-block;
    }

    /* ══════════════════════════════════════════════════════════════════════
       DESKTOP POPOVER  (≥ 768 px)
       Absolute, opens upward, RTL-aware via inset-inline-end.
       max-width clamp guarantees it never overflows even at the md boundary.
    ══════════════════════════════════════════════════════════════════════ */
    .ep-popover {
      position: absolute;
      bottom: calc(100% + 10px);
      /* CSS logical property: resolves to right in LTR, left in RTL */
      inset-inline-end: 0;
      z-index: 50;
      border-radius: 16px;
      overflow: hidden;
      box-shadow:
        0 8px 32px rgba(27, 79, 114, 0.18),
        0 2px 8px rgba(0, 0, 0, 0.08);
      border: 1px solid rgba(27, 79, 114, 0.1);
      animation: ep-fade-in 0.15s ease-out;
    }

    @keyframes ep-fade-in {
      from { opacity: 0; transform: translateY(6px); }
      to   { opacity: 1; transform: translateY(0); }
    }

    /* ══════════════════════════════════════════════════════════════════════
       COMPACT / MOBILE  (< 768 px)
       Fixed bottom-sheet — never overflows the viewport horizontally.
       Breakpoint aligned to Bosla's md (768 px) not Tailwind's sm (640 px).
    ══════════════════════════════════════════════════════════════════════ */
    @media (max-width: 767px) {
      .ep-popover {
        /* Switch from absolute (relative to button) to fixed (relative to viewport) */
        position: fixed;
        bottom: 0;
        /* Cancel the logical property anchoring — bottom-sheet must be full-width */
        inset-inline-end: auto;
        left: 0;
        right: 0;
        /* No bottom offset — sheet extends to the bottom edge */
        border-radius: 20px 20px 0 0;
        /* Cancel the upward opening transform from desktop */
        transform: none;
        animation: ep-slide-up 0.22s cubic-bezier(0.4, 0, 0.2, 1);
      }

      @keyframes ep-slide-up {
        from { opacity: 0; transform: translateY(100%); }
        to   { opacity: 1; transform: translateY(0); }
      }

      .ep-backdrop {
        /* Show the dim overlay only on compact screens */
        display: block !important;
      }

      .ep-drag-handle {
        display: block !important;
      }

      emoji-picker {
        width: 100% !important;
        max-width: 100% !important;
        border-radius: 0 !important;
      }
    }

    /* ── Dim backdrop — hidden on desktop, shown on compact via media query ─ */
    .ep-backdrop {
      display: none;
      position: fixed;
      inset: 0;
      background: rgba(0, 0, 0, 0.35);
      z-index: 49;
      animation: ep-fade-backdrop 0.2s ease-out;
    }

    @keyframes ep-fade-backdrop {
      from { opacity: 0; }
      to   { opacity: 1; }
    }

    /* ── Drag handle pill — hidden on desktop ─────────────────────────── */
    .ep-drag-handle {
      display: none;
      width: 40px;
      height: 4px;
      background: rgba(149, 165, 166, 0.4);
      border-radius: 2px;
      margin: 10px auto 4px;
    }

    /* ══════════════════════════════════════════════════════════════════════
       emoji-picker-element sizing + Bosla Design System theming
    ══════════════════════════════════════════════════════════════════════ */
    emoji-picker {
      /*
        Desktop: 340 px wide, but capped so it never exceeds the viewport.
        The calc subtracts 32 px (16 px margin on each side) as a safety buffer
        so the popover never triggers a horizontal scroll bar even when the
        host button is near an edge.
      */
      width: 340px;
      max-width: calc(100vw - 32px);

      /* Bosla Design System colours via CSS custom properties */
      --background: #ffffff;
      --border-color: rgba(27, 79, 114, 0.1);
      --border-radius: 0px;           /* outer radius is on .ep-popover */
      --category-button-active-color: #1B4F72;
      --category-button-color: #95A5A6;
      --indicator-color: #1B4F72;
      --input-border-color: rgba(27, 79, 114, 0.18);
      --input-border-radius: 10px;
      --input-font-color: #2C3E50;
      --input-font-size: 13px;
      --input-placeholder-color: rgba(149, 165, 166, 0.7);
      --input-padding: 8px 12px;
      --outline-color: rgba(27, 79, 114, 0.25);
      --emoji-size: 1.45rem;
      --emoji-padding: 0.35rem;
      --num-columns: 8;
      --skintone-border-radius: 50%;
    }
  `],
  template: `
    <!-- ── Trigger button ──────────────────────────────────────────────── -->
    <button
      type="button"
      class="w-8 h-8 rounded-xl flex items-center justify-center transition-all duration-150
             cursor-pointer hover:bg-bosla-primary/8 focus:outline-none
             focus:ring-2 focus:ring-bosla-primary/20"
      [class.text-bosla-primary]="isOpen()"
      [class.bg-bosla-primary/10]="isOpen()"
      [class.text-bosla-grey]="!isOpen()"
      (click)="toggle($event)"
      [attr.aria-expanded]="isOpen()"
      aria-haspopup="dialog"
      aria-label="إضافة رموز تعبيرية"
      title="إضافة رموز تعبيرية"
      id="bosla-emoji-trigger"
    >
      <svg width="17" height="17" viewBox="0 0 24 24"
           fill="none" stroke="currentColor" stroke-width="2.2" aria-hidden="true">
        <circle cx="12" cy="12" r="10"/>
        <path d="M8 14s1.5 2 4 2 4-2 4-2"/>
        <line x1="9"  y1="9"  x2="9.01"  y2="9"/>
        <line x1="15" y1="9"  x2="15.01" y2="9"/>
      </svg>
    </button>

    @if (isOpen()) {
      <!-- Dim backdrop — visible on compact screens via CSS media query -->
      <div class="ep-backdrop" (click)="close()" aria-hidden="true"></div>

      <!-- Popover (desktop) / bottom-sheet (compact) -->
      <div
        class="ep-popover"
        role="dialog"
        aria-modal="true"
        aria-label="منتقي الرموز التعبيرية"
        id="bosla-emoji-popover"
      >
        <!-- Drag handle — shown on compact via CSS media query -->
        <div class="ep-drag-handle"></div>

        <emoji-picker (emoji-click)="onEmojiClick($event)"></emoji-picker>
      </div>
    }
  `,
})
export class EmojiPickerComponent {
  private readonly el = inject(ElementRef);
  private readonly platformId = inject(PLATFORM_ID);
  private pickerLoaded = false;

  /** Emits a raw Unicode emoji string, e.g. "😊" */
  readonly emojiSelected = output<string>();

  readonly isOpen = signal(false);

  // ── Public API ─────────────────────────────────────────────────────────

  async toggle(event: MouseEvent): Promise<void> {
    event.stopPropagation();
    if (!this.isOpen()) {
      await this.ensurePickerLoaded();
    }
    this.isOpen.update(v => !v);
  }

  close(): void {
    this.isOpen.set(false);
  }

  /**
   * Handles the `emoji-click` CustomEvent fired by emoji-picker-element.
   * `event.detail.unicode` contains the raw Unicode character (e.g. "😊").
   * After emitting, the picker closes so focus returns to the textarea.
   */
  onEmojiClick(event: Event): void {
    const detail = (event as CustomEvent<{ unicode: string }>).detail;
    if (detail?.unicode) {
      this.emojiSelected.emit(detail.unicode);
      this.close();
    }
  }

  // ── Keyboard & focus handling ───────────────────────────────────────────

  /** ESC key closes the picker from anywhere on the page */
  @HostListener('document:keydown.escape')
  onEscape(): void {
    if (isPlatformBrowser(this.platformId) && this.isOpen()) {
      this.close();
    }
  }

  /** Click outside the component closes the picker */
  @HostListener('document:click', ['$event'])
  onDocumentClick(event: MouseEvent): void {
    if (!isPlatformBrowser(this.platformId) || !this.isOpen()) return;
    if (!this.el.nativeElement.contains(event.target as Node)) {
      this.close();
    }
  }

  // ── Private helpers ─────────────────────────────────────────────────────

  /**
   * Lazy-loads `emoji-picker-element` on first use.
   * The dynamic import() registers the <emoji-picker> custom element globally;
   * subsequent calls are no-ops because the browser's CustomElementRegistry
   * prevents double-registration.
   */
  private async ensurePickerLoaded(): Promise<void> {
    if (this.pickerLoaded || !isPlatformBrowser(this.platformId)) return;
    await import('emoji-picker-element');
    this.pickerLoaded = true;
  }
}

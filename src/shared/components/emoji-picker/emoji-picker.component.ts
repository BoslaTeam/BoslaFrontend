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
 * Features
 * ────────
 * • Lazy-loads the picker library on first open → zero initial-bundle impact
 * • RTL-aware: popover anchors to `inset-inline-end` (CSS logical property)
 * • Responsive: absolute popover on md+, CSS-driven bottom-sheet on mobile
 * • Click-outside & Escape → close
 * • Emits a plain Unicode emoji string (e.g. "😊") via `emojiSelected`
 * • Themed via CSS custom properties to match the Bosla Design System
 * • Fully zoneless-compatible (app uses provideZonelessChangeDetection)
 *
 * Usage
 * ─────
 * <bosla-emoji-picker (emojiSelected)="insertEmoji($event)" />
 */
@Component({
  selector: 'bosla-emoji-picker',
  standalone: true,
  imports: [],
  schemas: [CUSTOM_ELEMENTS_SCHEMA],
  changeDetection: ChangeDetectionStrategy.OnPush,
  styles: [`
    /* ── Host positioning context ─────────────────────────────────────── */
    :host {
      position: relative;
      display: inline-block;
    }

    /* ── Popover wrapper ─────────────────────────────────────────────── */
    .ep-popover {
      position: absolute;
      /* Open upward: above the toolbar (composer is pinned to the bottom) */
      bottom: calc(100% + 10px);
      /* RTL logical property: right on LTR, left on RTL */
      inset-inline-end: 0;
      z-index: 50;
      border-radius: 16px;
      overflow: hidden;
      box-shadow: 0 8px 32px rgba(27, 79, 114, 0.18), 0 2px 8px rgba(0,0,0,.08);
      border: 1px solid rgba(27, 79, 114, 0.1);
      animation: ep-fade-in 0.15s ease-out;
    }

    @keyframes ep-fade-in {
      from { opacity: 0; transform: translateY(6px); }
      to   { opacity: 1; transform: translateY(0); }
    }

    /* ── Mobile: full-width bottom sheet ─────────────────────────────── */
    @media (max-width: 639px) {
      .ep-popover {
        position: fixed;
        bottom: 0;
        /* Override logical positioning for true full-width bottom sheet */
        inset-inline-end: auto;
        left: 0;
        right: 0;
        border-radius: 20px 20px 0 0;
        animation: ep-slide-up 0.2s ease-out;
      }

      @keyframes ep-slide-up {
        from { opacity: 0; transform: translateY(100%); }
        to   { opacity: 1; transform: translateY(0); }
      }

      .ep-backdrop {
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

    /* ── Backdrop (mobile only, hidden by default) ────────────────────── */
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

    /* ── Mobile drag handle (hidden on desktop) ───────────────────────── */
    .ep-drag-handle {
      display: none;
      width: 40px;
      height: 4px;
      background: rgba(149, 165, 166, 0.4);
      border-radius: 2px;
      margin: 10px auto 4px;
    }

    /* ── emoji-picker-element CSS custom property theming ─────────────── */
    emoji-picker {
      /* Sizing: fixed on desktop, full-width on mobile (overridden above) */
      width: 340px;
      max-width: calc(100vw - 16px);

      /* Bosla Design System colours */
      --background: #ffffff;
      --border-color: rgba(27, 79, 114, 0.1);
      --border-radius: 0px;          /* outer radius handled by .ep-popover */
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

      /* Skin tone */
      --skintone-border-radius: 50%;
    }
  `],
  template: `
    <!-- ── Trigger button ─────────────────────────────────────────────── -->
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
      <!-- ── Backdrop: visible on mobile via CSS ─────────────────────── -->
      <div class="ep-backdrop" (click)="close()" aria-hidden="true"></div>

      <!-- ── Picker popover / bottom sheet ──────────────────────────── -->
      <div
        class="ep-popover"
        role="dialog"
        aria-modal="true"
        aria-label="منتقي الرموز التعبيرية"
        id="bosla-emoji-popover"
      >
        <!-- Mobile drag handle -->
        <div class="ep-drag-handle"></div>

        <!--
          emoji-picker is a native Custom Element from emoji-picker-element.
          It is lazy-loaded the first time toggle() is called.
          The (emoji-click) binding listens to the custom DOM event it fires.
          $any() cast avoids strict-template errors since Angular doesn't know
          the type of a custom element's event.
        -->
        <emoji-picker
          (emoji-click)="onEmojiClick($event)">
        </emoji-picker>
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

  // ── Public API ────────────────────────────────────────────────────────

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

  // ── Keyboard & focus handling ─────────────────────────────────────────

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

  // ── Private helpers ───────────────────────────────────────────────────

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

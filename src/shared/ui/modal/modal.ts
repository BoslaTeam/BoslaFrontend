import { Component, input, output, HostListener } from '@angular/core';

@Component({
  selector: 'ui-modal',
  standalone: true,
  imports: [],
  templateUrl: './modal.html',
})
export class UiModal {
  readonly isOpen = input.required<boolean>();
  readonly title = input<string>('تأكيد الإجراء');
  readonly message = input<string>('');
  readonly confirmText = input<string>('تأكيد');
  readonly cancelText = input<string>('إلغاء');
  readonly danger = input<boolean>(false);

  readonly close = output<void>();
  readonly confirm = output<void>();

  @HostListener('keydown.escape')
  onEscape(): void {
    if (this.isOpen()) {
      this.close.emit();
    }
  }

  onBackdropClick(event: MouseEvent): void {
    if ((event.target as HTMLElement) === event.currentTarget) {
      this.close.emit();
    }
  }

  onCancel(): void {
    this.close.emit();
  }

  onConfirm(): void {
    this.confirm.emit();
  }
}

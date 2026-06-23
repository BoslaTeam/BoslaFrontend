import { Component, input, output } from '@angular/core';

@Component({
  selector: 'ui-modal',
  standalone: true,
  imports: [],
  templateUrl: './modal.html',
})
export class UiModal {
  // المدخلات الأساسية للتحكم بالنافذة المنبثقة
  readonly isOpen = input.required<boolean>();
  readonly title = input<string>('تأكيد الإجراء');
  readonly message = input<string>('');

  // الأحداث التفاعلية للأزرار
  readonly close = output<void>();
  readonly confirm = output<void>();

  onClose(): void {
    this.close.emit();
  }

  onConfirm(): void {
    this.confirm.emit();
  }
}
import { Component, input, output, computed, inject } from '@angular/core';
import { TranslationService } from '@core/services/translation.service';

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

  private readonly translationService = inject(TranslationService);
  readonly direction = computed(() => this.translationService.currentLang() === 'ar' ? 'rtl' : 'ltr');

  onClose(): void {
    this.close.emit();
  }

  onConfirm(): void {
    this.confirm.emit();
  }
}
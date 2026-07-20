import { Component, input, computed, inject } from '@angular/core';
import { TranslationService } from '@core/services/translation.service';

@Component({
  selector: 'ui-empty-state',
  standalone: true,
  imports: [],
  templateUrl: './empty-state.html',
  styleUrl: './empty-state.css',
})
export class UiEmptyState {
  // اسم كلاس أيقونة Font Awesome مثل (fa-solid fa-envelope-open-text)
  readonly icon = input<string>('fa-solid fa-folder-open'); 
  
  // العنوان الرئيسي للحالة الفارغة
  readonly title = input<string>('لا توجد بيانات متاحة حالياً');
  
  // الوصف التفصيلي المساعد للـ Empty State
  readonly description = input<string>('');

  private readonly translationService = inject(TranslationService);
  readonly direction = computed(() => this.translationService.currentLang() === 'ar' ? 'rtl' : 'ltr');
}
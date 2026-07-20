import { Component, input, computed, inject } from '@angular/core';
import { TranslationService } from '@core/services/translation.service';

@Component({
  selector: 'ui-table-row-skeleton',
  standalone: true,
  templateUrl: './table-row-skeleton.html',
})
export class UiTableRowSkeleton {
  // تحديد عدد الأسطر الوهمية المطلوب عرضها أثناء التحميل
  readonly rowsCount = input<number>(4);

  private readonly translationService = inject(TranslationService);
  readonly direction = computed(() => this.translationService.currentLang() === 'ar' ? 'rtl' : 'ltr');
}
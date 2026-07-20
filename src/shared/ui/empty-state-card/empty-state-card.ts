import { Component, input, computed, inject } from '@angular/core';
import { TranslationService } from '@core/services/translation.service';

@Component({
  selector: 'ui-empty-state-card',
  standalone: true,
  imports: [],
  templateUrl: './empty-state-card.html',
})
export class UiEmptyStateCard {
  readonly message = input<string>('لا توجد بيانات حالية');
  readonly icon = input<string>('fa-regular fa-image'); // الأيقونة الافتراضية بالسكتش

  private readonly translationService = inject(TranslationService);
  readonly direction = computed(() => this.translationService.currentLang() === 'ar' ? 'rtl' : 'ltr');
}
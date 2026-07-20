import { Component, computed, inject } from '@angular/core';
import { TranslationService } from '@core/services/translation.service';

@Component({
  selector: 'ui-loading-skeleton',
  standalone: true,
  imports: [],
  templateUrl: './loading-skeleton.html',
  styleUrl: './loading-skeleton.css'
})
export class UiLoadingSkeleton {
  private readonly translationService = inject(TranslationService);
  readonly direction = computed(() => this.translationService.currentLang() === 'ar' ? 'rtl' : 'ltr');
}
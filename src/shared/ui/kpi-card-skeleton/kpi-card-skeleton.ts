import { Component, computed, inject } from '@angular/core';
import { TranslationService } from '@core/services/translation.service';

@Component({
  selector: 'ui-kpi-card-skeleton',
  standalone: true,
  imports: [],
  templateUrl: './kpi-card-skeleton.html',
})
export class UiKpiCardSkeleton {
  private readonly translationService = inject(TranslationService);
  readonly direction = computed(() => this.translationService.currentLang() === 'ar' ? 'rtl' : 'ltr');
}

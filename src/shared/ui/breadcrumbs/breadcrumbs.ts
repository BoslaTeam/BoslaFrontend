import { Component, input, output, computed, inject } from '@angular/core';
import { TranslationService } from '@core/services/translation.service';

export interface BreadcrumbItem {
  label: string;
  url?: string;
}

@Component({
  selector: 'ui-breadcrumbs',
  standalone: true,
  imports: [],
  templateUrl: './breadcrumbs.html',
})
export class UiBreadcrumbs {
  readonly items = input<BreadcrumbItem[]>([]);
  readonly itemClick = output<BreadcrumbItem>();

  private readonly translationService = inject(TranslationService);
  readonly direction = computed(() => this.translationService.currentLang() === 'ar' ? 'rtl' : 'ltr');

  onItemClick(item: BreadcrumbItem, isLast: boolean): void {
    if (!isLast && item.url) {
      this.itemClick.emit(item);
    }
  }
}
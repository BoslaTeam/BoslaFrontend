import { Component, input, output, model, computed, inject } from '@angular/core';
import { TranslationService } from '@core/services/translation.service';

export interface TabItem {
  id: string;
  label: string;
}

@Component({
  selector: 'ui-tabs',
  standalone: true,
  imports: [],
  templateUrl: './tabs.html',
})
export class UiTabs {
  // استقبال قائمة التبويبات ديناميكياً
  readonly items = input<TabItem[]>([]);
  
  readonly activeId = model<string>('');

  // حدث يطلق عند تغيير التبويب
  readonly tabChange = output<string>();

  private readonly translationService = inject(TranslationService);
  readonly direction = computed(() => this.translationService.currentLang() === 'ar' ? 'rtl' : 'ltr');

  selectTab(id: string): void {
    this.activeId.set(id);
    this.tabChange.emit(id);
  }
}
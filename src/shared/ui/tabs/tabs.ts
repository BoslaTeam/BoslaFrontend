import { Component, input, output, model } from '@angular/core';

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

  selectTab(id: string): void {
    this.activeId.set(id);
    this.tabChange.emit(id);
  }
}
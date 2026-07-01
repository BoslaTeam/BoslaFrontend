import { Component, input, output } from '@angular/core';

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

  onItemClick(item: BreadcrumbItem, isLast: boolean): void {
    if (!isLast && item.url) {
      this.itemClick.emit(item);
    }
  }
}
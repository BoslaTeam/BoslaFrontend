import { Component, input } from '@angular/core';

@Component({
  selector: 'ui-table-row-skeleton',
  standalone: true,
  templateUrl: './table-row-skeleton.html',
})
export class UiTableRowSkeleton {
  // تحديد عدد الأسطر الوهمية المطلوب عرضها أثناء التحميل
  readonly rowsCount = input<number>(4);
}
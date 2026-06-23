import { Component, input } from '@angular/core';

@Component({
  selector: 'ui-empty-state-card',
  standalone: true,
  imports: [],
  templateUrl: './empty-state-card.html',
})
export class UiEmptyStateCard {
  readonly message = input<string>('لا توجد بيانات حالية');
  readonly icon = input<string>('fa-regular fa-image'); // الأيقونة الافتراضية بالسكتش
}
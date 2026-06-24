import { Component, input, computed } from '@angular/core';

@Component({
  selector: 'ui-dashboard-stat-card',
  standalone: true,
  imports: [],
  templateUrl: './dashboard-stat-card.html',
  styleUrl: './dashboard-stat-card.css'
})
export class UiDashboardStatCard {
  readonly title = input<string>(''); // عنوان البطاقة (مثل: إجمالي الجلسات)
  readonly value = input<string | number>(''); // القيمة الرقمية (مثل: 1,284)
  readonly subtitle = input<string>('مقارنة بالشهر الماضي'); // النص السفلي المساعد
  readonly icon = input<string>(''); // كلاس أيقونة Font Awesome (مثل: fa-solid fa-users)

  // مؤشر التغيير الإحصائي
  readonly trendValue = input<string>(''); // قيمة النسبة (مثل: +12% أو -0.2%)
  readonly trendDirection = input<'up' | 'down' | 'none'>('none'); // اتجاه السهم والمؤشر

  // تحديد ما إذا كانت البطاقة تحتوي على حد برتقالي جانبي (مثل بطاقة التقييم)
  readonly hasOrangeBorder = input<boolean>(false);
}
import { Component, input } from '@angular/core';

export interface DashboardActivity {
  id: any;
  title: string;
  highlightedText?: string; // نص مميز بخط أعرض (مثل أسماء العملاء)
  time: string; // وقت النشاط (مثل: قبل 10 دقائق)
  icon: string; // أيقونة النشاط من Font Awesome
  iconColorClass?: string; // لون مخصص للأيقونة إذا لزم الأمر
}

@Component({
  selector: 'ui-dashboard-activity-card',
  standalone: true,
  imports: [],
  templateUrl: './dashboard-activity-card.html',
  styleUrl: './dashboard-activity-card.css'
})
export class UiDashboardActivityCard {
  readonly title = input<string>('النشاط الأخير');
  readonly activities = input<DashboardActivity[]>([]);
}
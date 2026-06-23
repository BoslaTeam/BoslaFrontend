import { Component, input, output } from '@angular/core';
import { UiButton } from '../button/button';
import { DecimalPipe } from '@angular/common';

export interface ExpertData {
  id: string;
  name: string;
  title: string;
  rating: number;
  price: number;
  avatarUrl: string;
  isOnline: boolean;
  isVerified: boolean;
}

@Component({
  selector: 'ui-expert-card',
  standalone: true,
  imports: [UiButton, DecimalPipe],
  templateUrl: './expert-card.html',
  styleUrl: './expert-card.css'
})
export class UiExpertCard {
  // استقبال بيانات المستشار بالكامل كـ Input
  readonly expert = input.required<ExpertData>();

  // حدث مخصص عند الضغط على زر الحجز
  readonly bookClick = output<string>();

  onBook() {
    this.bookClick.emit(this.expert().id);
  }
}
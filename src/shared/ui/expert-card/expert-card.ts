import { Component, inject, input, output } from '@angular/core';
import { DecimalPipe } from '@angular/common';
import { Router } from '@angular/router';

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
  imports: [DecimalPipe],
  templateUrl: './expert-card.html',
  styleUrls: ['./expert-card.css']
})
export class UiExpertCard {
  readonly expert = input.required<ExpertData>();
  readonly cardClick = output<string>();

  private readonly router = inject(Router);

  onCardClick(): void {
    this.cardClick.emit(this.expert().id);
  }

  bookAppointment(event: Event): void {
    event.stopPropagation();
    this.router.navigate(['/appointments/book'], { queryParams: { specialistId: this.expert().id } });
  }
}
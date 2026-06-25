import { Component, EventEmitter, Input, Output } from '@angular/core';
import { Specialist } from '@features/specialists/models/specialist.model';
import { UiExpertCard } from "@shared/ui/expert-card/expert-card";

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
  selector: 'specialists-grid',
  imports: [UiExpertCard],
  templateUrl: './specialists-grid.html',
  styleUrl: './specialists-grid.css',
})
export class SpecialistsGridComponent {
  @Input({ required: true }) specialists: Specialist[] = [];
  @Output() detailsClick = new EventEmitter<string>();

  mapToExpertCard(specialist: Specialist): ExpertData {
    return {
      id: specialist.id,
      name: specialist.name,
      title: specialist.title ?? '',
      rating: specialist.rating,
      price: specialist.hourlyRate,
      avatarUrl: specialist.imageUrl ?? 'assets/icons/favicon.ico',
      isOnline: specialist.isOnline,
      isVerified: specialist.isVerified,
    };
  }
}

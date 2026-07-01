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
})
export class SpecialistsGridComponent {
  @Input({ required: true }) specialists: Specialist[] = [];
  @Output() detailsClick = new EventEmitter<string>();

  mapToExpertCard(specialist: Specialist): ExpertData {
    const defaultAvatar = `https://ui-avatars.com/api/?name=${encodeURIComponent(specialist.name)}&background=1B4F72&color=fff&size=150`;
    return {
      id: specialist.id,
      name: specialist.name,
      title: specialist.title ?? '',
      rating: specialist.rating,
      price: specialist.hourlyRate,
      avatarUrl: specialist.imageUrl?.trim() ? specialist.imageUrl : defaultAvatar,
      isOnline: specialist.isOnline,
      isVerified: specialist.isVerified,
    };
  }
}

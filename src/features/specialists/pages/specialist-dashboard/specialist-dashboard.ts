import { Component, inject, OnInit, signal } from '@angular/core';
import { SpecialistApiService } from '../../data-access/specialist-api.service';
import { SpecialistProfileResponse } from '../../contracts/specialist-profile-response';
import { SpecialistReviewsResponse } from '../../contracts/specialist-reviews-response';
import { DatePipe } from '@angular/common';
import { computed } from '@angular/core';
import { RouterLink } from '@angular/router';

@Component({
  selector: 'app-specialist-dashboard',
  imports: [DatePipe,RouterLink],
  templateUrl: './specialist-dashboard.html',
})
export class SpecialistDashboard implements OnInit {
  private specialistApi = inject(SpecialistApiService);
  reviews = signal<SpecialistReviewsResponse | null>(null);
  profile = signal<SpecialistProfileResponse | null>(null);
  searchTerm = signal('');

  dashboard = signal<any>(null);

  ngOnInit(): void {
    this.loadProfile();
    this.loadDashboard();
    this.loadReviews();
  }


  private loadProfile(): void {
    this.specialistApi.getMyProfile().subscribe({
      next: (response) => {
        this.profile.set(response.data);
      },
    });
  }

  private loadDashboard(): void {
    this.specialistApi.getDashboard().subscribe({
      next: (response) => {
        this.dashboard.set(response.data);
      },
    });
  }
private loadReviews(): void {
  this.specialistApi.getMyReviews().subscribe({
    next: (response) => {
      this.reviews.set(response.data);
    },
  });
}


filteredAppointments = computed(() => {
  const appointments = this.dashboard()?.upcomingAppointmentsList ?? [];
  const term = this.searchTerm().trim().toLowerCase();

  if (!term) {
    return appointments;
  }

  return appointments.filter((appointment: any) =>
    appointment.clientName?.toLowerCase().includes(term) ||
    appointment.serviceName?.toLowerCase().includes(term)
  );
});

maxRevenue = computed(() => {
  const revenue = this.dashboard()?.monthlyRevenue ?? [];

  if (!revenue.length) {
    return 1;
  }

  return Math.max(...revenue.map((item: any) => item.amount), 1);
});

  stats = signal([
  {
    title: 'التقييم العام',
    value: this.dashboard()?.averageRating ?? 0,
    growth: 'ممتاز',
  },
  {
    title: 'أرباح الشهر',
    value: this.dashboard()?.monthlyEarnings ?? 0,
    growth: `${this.dashboard()?.earningsGrowthPercentage ?? 0}%+`,
  },
  {
    title: 'جلسات مكتملة',
    value: this.dashboard()?.completedAppointments ?? 0,
    growth: '5.4%+',
  },
  {
    title: 'مواعيد قادمة',
    value: this.dashboard()?.upcomingAppointments ?? 0,
    growth: '12%+',
  },
]);
}
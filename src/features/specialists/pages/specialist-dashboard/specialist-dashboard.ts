import { Component, inject, OnInit, signal } from '@angular/core';
import { SpecialistApiService } from '../../data-access/specialist-api.service';
import { SpecialistProfileResponse } from '../../contracts/specialist-profile-response';
import { SpecialistReviewsResponse } from '../../contracts/specialist-reviews-response';
import { DatePipe, SlicePipe } from '@angular/common';
import { computed } from '@angular/core';
import { RouterLink } from '@angular/router';

@Component({
  selector: 'app-specialist-dashboard',
  imports: [DatePipe, SlicePipe, RouterLink],
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

revenueLineChartPath = computed(() => {
  const revenue = this.dashboard()?.monthlyRevenue ?? [];
  if (!revenue.length) return '';

  const maxVal = this.maxRevenue();
  const height = 250;
  const width = 800; // arbitrary width for viewBox
  const stepX = width / (revenue.length > 1 ? revenue.length - 1 : 1);
  
  let path = '';
  revenue.forEach((item: any, index: number) => {
    const x = index * stepX;
    // Calculate y, where 0 is bottom (height) and maxVal is top (0)
    // Add some padding by multiplying by 0.9 and subtracting from height
    const y = height - (item.amount / maxVal) * (height * 0.9);
    
    if (index === 0) {
      path += `M ${x},${y} `;
    } else {
      // Add slight curve
      const prevX = (index - 1) * stepX;
      const prevY = height - (revenue[index - 1].amount / maxVal) * (height * 0.9);
      const cp1X = prevX + stepX / 2;
      const cp1Y = prevY;
      const cp2X = x - stepX / 2;
      const cp2Y = y;
      path += `C ${cp1X},${cp1Y} ${cp2X},${cp2Y} ${x},${y} `;
    }
  });
  return path;
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
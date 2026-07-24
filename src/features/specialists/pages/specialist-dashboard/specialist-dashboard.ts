import { Component, inject, OnInit, OnDestroy, signal } from '@angular/core';
import { SpecialistApiService } from '../../data-access/specialist-api.service';
import { SpecialistProfileResponse } from '../../contracts/specialist-profile-response';
import { SpecialistReviewsResponse } from '../../contracts/specialist-reviews-response';
import { DatePipe } from '@angular/common';
import { computed } from '@angular/core';
import { RouterLink } from '@angular/router';
import { SpecialistAiService } from '@features/ai/services/specialist-ai.service';
import { DashboardInsightsDto } from '@features/ai/contracts/specialist-ai.contracts';

import { TranslatePipe } from '@shared/pipes/translate.pipe';
import { NotificationsService } from '@features/notifications/services/notifications.service';
@Component({
  selector: 'app-specialist-dashboard',
  imports: [DatePipe, RouterLink, TranslatePipe],
  templateUrl: './specialist-dashboard.html',
})
export class SpecialistDashboard implements OnInit, OnDestroy {
  private specialistApi = inject(SpecialistApiService);
  private specialistAiService = inject(SpecialistAiService);
  private notifHttp = inject(NotificationsService);
  private notifInterval: ReturnType<typeof setInterval> | null = null;
  reviews = signal<SpecialistReviewsResponse | null>(null);
  profile = signal<SpecialistProfileResponse | null>(null);
  searchTerm = signal('');

  dashboard = signal<any>(null);
  showAllReviews = signal(false);
  readonly currentYear = computed(() => new Date().getFullYear());
  readonly totalEarnings = computed(() => {
    const revenue = this.dashboard()?.monthlyRevenue ?? [];
    if (!Array.isArray(revenue) || revenue.length === 0) return 0;
    return revenue.reduce((sum: number, item: any) => sum + (item.amount || 0), 0);
  });

  /** AI Dashboard Insights */
  aiInsights = signal<DashboardInsightsDto | null>(null);
  aiInsightsLoading = signal(false);
  private aiRefreshInterval: ReturnType<typeof setInterval> | null = null;

  ngOnInit(): void {
    this.notifHttp.getNotifications().subscribe({ error: () => {} });
    this.loadProfile();
    this.loadDashboard();
    this.loadReviews();
    this.loadAiInsights();
    this.aiRefreshInterval = setInterval(() => this.loadAiInsights(), 5 * 60 * 1000);
    this.notifInterval = setInterval(() => {
      this.notifHttp.getNotifications().subscribe({ error: () => {} });
    }, 30000);
  }

  ngOnDestroy(): void {
    if (this.aiRefreshInterval) {
      clearInterval(this.aiRefreshInterval);
    }
    if (this.notifInterval) {
      clearInterval(this.notifInterval);
    }
  }


  loadAiInsights(): void {
    this.aiInsightsLoading.set(true);
    this.specialistAiService.getDashboardInsights().subscribe({
      next: (insights) => {
        this.aiInsights.set(insights);
        this.aiInsightsLoading.set(false);
      },
      error: () => {
        this.aiInsightsLoading.set(false);
      },
    });
  }

  private loadProfile(): void {
    this.specialistApi.getMyProfile().subscribe({
      next: (response) => {
        this.profile.set(response.data);
      },
      error: () => this.profile.set(null),
    });
  }

  private loadDashboard(): void {
    this.specialistApi.getDashboard().subscribe({
      next: (response) => {
        this.dashboard.set(response.data);
      },
      error: () => this.dashboard.set(null),
    });
  }

  private loadReviews(): void {
    this.specialistApi.getMyReviews().subscribe({
      next: (response) => {
        this.reviews.set(response.data);
      },
      error: () => this.reviews.set(null),
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
    const width = 800;
    const stepX = width / (revenue.length > 1 ? revenue.length - 1 : 1);
    
    let path = '';
    revenue.forEach((item: any, index: number) => {
      const x = index * stepX;
      const y = height - (item.amount / maxVal) * (height * 0.9);
      
      if (index === 0) {
        path += `M ${x},${y} `;
      } else {
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

  revenuePoints = computed(() => {
    const revenue = this.dashboard()?.monthlyRevenue ?? [];
    if (!revenue.length) return [];
    const maxVal = this.maxRevenue();
    const height = 250;
    const width = 800;
    const stepX = width / (revenue.length > 1 ? revenue.length - 1 : 1);
    return revenue.map((item: any, index: number) => ({
      x: index * stepX,
      y: height - (item.amount / maxVal) * (height * 0.9),
      amount: item.amount,
    }));
  });

}
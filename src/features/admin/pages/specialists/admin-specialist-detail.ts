import { Component, inject, OnInit, signal, input } from '@angular/core';
import { Router } from '@angular/router';
import { DatePipe } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { AdminService } from '../../services/admin.service';
import { AdminSpecialistDetailDto } from '../../contracts/admin.contracts';

@Component({
  selector: 'app-admin-specialist-detail',
  imports: [DatePipe, FormsModule],
  templateUrl: './admin-specialist-detail.html',
  styleUrl: './admin-specialist-detail.css',
})
export class AdminSpecialistDetail implements OnInit {
  private readonly adminService = inject(AdminService);
  private readonly router = inject(Router);

  readonly id = input.required<string>();

  readonly specialist = signal<AdminSpecialistDetailDto | null>(null);
  readonly isLoading = signal(true);
  readonly hasError = signal(false);
  readonly activeTab = signal<'info' | 'skills' | 'experience' | 'expertise' | 'reviews'>('info');
  readonly isVerifying = signal(false);
  readonly isUpdatingStatus = signal(false);

  ngOnInit(): void {
    this.loadSpecialist();
  }

  loadSpecialist(): void {
    this.isLoading.set(true);
    this.hasError.set(false);

    this.adminService.getSpecialistDetail(this.id()).subscribe({
      next: (data) => {
        this.specialist.set(data);
        this.isLoading.set(false);
      },
      error: () => {
        this.hasError.set(true);
        this.isLoading.set(false);
      },
    });
  }

  setTab(tab: 'info' | 'skills' | 'experience' | 'expertise' | 'reviews'): void {
    this.activeTab.set(tab);
  }

  verify(isApproved: boolean): void {
    this.isVerifying.set(true);
    this.adminService.verifySpecialist(this.id(), { isApproved }).subscribe({
      next: () => this.loadSpecialist(),
      error: () => this.isVerifying.set(false),
      complete: () => this.isVerifying.set(false),
    });
  }

  updateStatus(status: string): void {
    const current = this.specialist()?.verificationStatus;
    if (!current || current === status) return;
    this.isUpdatingStatus.set(true);
    this.adminService.updateSpecialistStatus(this.id(), status).subscribe({
      next: () => this.loadSpecialist(),
      error: () => this.isUpdatingStatus.set(false),
      complete: () => this.isUpdatingStatus.set(false),
    });
  }

  goBack(): void {
    this.router.navigate(['/admin/specialists']);
  }

  getVerificationStatusLabel(status: string): string {
    const labels: Record<string, string> = { Pending: 'معلق', Approved: 'مقبول', Rejected: 'مرفوض' };
    return labels[status] ?? status;
  }

  getVerificationStatusClass(status: string): string {
    const classes: Record<string, string> = { Pending: 'status-pending', Approved: 'status-approved', Rejected: 'status-rejected' };
    return classes[status] ?? 'status-pending';
  }

  getExperienceLevelLabel(level: string): string {
    const labels: Record<string, string> = { Entry: 'مبتدئ', Mid: 'متوسط', Senior: 'خبير', Lead: 'قائد' };
    return labels[level] ?? level;
  }

  getUserInitials(name: string): string {
    const parts = name.split(' ').filter(Boolean);
    if (parts.length >= 2) return parts[0][0] + parts[1][0];
    return name.substring(0, 2).toUpperCase();
  }

  formatRating(rating: number | undefined | null): string {
    if (!rating || rating <= 0) return 'لا توجد تقييمات';
    return `${rating.toFixed(1)} ★`;
  }
}

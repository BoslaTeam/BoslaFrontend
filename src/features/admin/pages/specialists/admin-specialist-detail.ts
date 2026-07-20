import { Component, inject, OnInit, signal, input } from '@angular/core';
import { Router, RouterLink } from '@angular/router';
import { DatePipe } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { AdminService } from '../../services/admin.service';
import { AdminSpecialistDetailDto } from '../../contracts/admin.contracts';
import { PortfolioItemDto, AdminReviewPortfolioRequest } from '@features/specialists/contracts/specialist-portfolio.contract';
import { API_ENDPOINTS } from '@core/constants/api-endpoints';
import { TranslationService } from '@core/services/translation.service';

import { TranslatePipe } from '@shared/pipes/translate.pipe';
@Component({
  selector: 'app-admin-specialist-detail',
  imports: [DatePipe, FormsModule, RouterLink, TranslatePipe],
  templateUrl: './admin-specialist-detail.html',
  styleUrl: './admin-specialist-detail.css',
})
export class AdminSpecialistDetail implements OnInit {
  private readonly adminService = inject(AdminService);
  private readonly router = inject(Router);
  private readonly translationService = inject(TranslationService);

  readonly id = input.required<string>();

  readonly specialist = signal<AdminSpecialistDetailDto | null>(null);
  readonly isLoading = signal(true);
  readonly hasError = signal(false);
  readonly activeTab = signal<'info' | 'skills' | 'experience' | 'expertise' | 'reviews' | 'documents' | 'portfolio' | 'ai'>('info');
  readonly isVerifying = signal(false);
  readonly isUpdatingStatus = signal(false);
  readonly adminNotes = signal('');

  // Portfolio
  readonly portfolioItems = signal<PortfolioItemDto[]>([]);
  readonly portfolioLoading = signal(false);
  readonly reviewingItemId = signal<string | null>(null);

  get documentTypeLabels(): Record<string, string> {
    return {
      Identity: this.translationService.translate('admin.specialists.documentIdentity'),
      Certificate: this.translationService.translate('admin.specialists.documentCertificate'),
    };
  }

  ngOnInit(): void {
    this.loadSpecialist();
  }

  loadSpecialist(): void {
    this.isLoading.set(true);
    this.hasError.set(false);

    this.adminService.getSpecialistDetail(this.id()).subscribe({
      next: (data) => {
        this.specialist.set(data);
        this.adminNotes.set(data.adminNotes || '');
        this.isLoading.set(false);
      },
      error: () => {
        this.hasError.set(true);
        this.isLoading.set(false);
      },
    });
  }

  setTab(tab: 'info' | 'skills' | 'experience' | 'expertise' | 'reviews' | 'documents' | 'portfolio' | 'ai'): void {
    this.activeTab.set(tab);
    if (tab === 'portfolio') {
      this.loadPortfolio();
    }
  }

  readonly rejectionError = signal('');

  get isPending(): boolean {
    return this.specialist()?.verificationStatus === 'Pending';
  }

  get isRejected(): boolean {
    return this.specialist()?.verificationStatus === 'Rejected';
  }

  verifyWithNotes(isApproved: boolean): void {
    this.rejectionError.set('');

    if (!isApproved && !this.adminNotes()?.trim()) {
      this.rejectionError.set(this.translationService.translate('admin.specialists.rejectionError'));
      return;
    }

    this.isVerifying.set(true);
    this.adminService.verifySpecialist(this.id(), {
      isVerified: isApproved,
      adminNotes: this.adminNotes() || undefined,
    }).subscribe({
      next: () => {
        this.rejectionError.set('');
        this.loadSpecialist();
      },
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
    const labels: Record<string, string> = {
      Draft: this.translationService.translate('specialist.status.Draft'),
      Pending: this.translationService.translate('specialist.status.Pending'),
      Approved: this.translationService.translate('specialist.status.Approved'),
      Rejected: this.translationService.translate('specialist.status.Rejected'),
    };
    return labels[status] ?? status;
  }

  getVerificationStatusClass(status: string): string {
    const classes: Record<string, string> = { Draft: 'status-draft', Pending: 'status-pending', Approved: 'status-approved', Rejected: 'status-rejected' };
    return classes[status] ?? 'status-draft';
  }

  getExperienceLevelLabel(level: string): string {
    const labels: Record<string, string> = {
      Entry: this.translationService.translate('specialist.level.Entry'),
      Mid: this.translationService.translate('specialist.level.Mid'),
      Senior: this.translationService.translate('specialist.level.Senior'),
      Lead: this.translationService.translate('specialist.level.Lead'),
    };
    return labels[level] ?? level;
  }

  getUserInitials(name: string): string {
    const parts = name.split(' ').filter(Boolean);
    if (parts.length >= 2) return parts[0][0] + parts[1][0];
    return name.substring(0, 2).toUpperCase();
  }

  formatRating(rating: number): string {
    if (!rating || rating <= 0) return this.translationService.translate('common.noReviews');
    return `${rating.toFixed(1)} ★`;
  }

  // ── Portfolio ──

  private loadPortfolio(): void {
    this.portfolioLoading.set(true);
    this.adminService.getSpecialistPortfolio(this.id()).subscribe({
      next: (items) => {
        this.portfolioItems.set(items);
        this.portfolioLoading.set(false);
      },
      error: () => this.portfolioLoading.set(false),
    });
  }

  approvePortfolioItem(itemId: string): void {
    this.reviewingItemId.set(itemId);
    const request: AdminReviewPortfolioRequest = { adminNotes: '' };
    this.adminService.approvePortfolioItem(this.id(), itemId, request).subscribe({
      next: () => {
        this.loadPortfolio();
        this.reviewingItemId.set(null);
      },
      error: () => this.reviewingItemId.set(null),
    });
  }

  rejectPortfolioItem(itemId: string): void {
    const notes = prompt(this.translationService.translate('admin.portfolio.rejectionReason'));
    this.reviewingItemId.set(itemId);
    const request: AdminReviewPortfolioRequest = { adminNotes: notes || '' };
    this.adminService.rejectPortfolioItem(this.id(), itemId, request).subscribe({
      next: () => {
        this.loadPortfolio();
        this.reviewingItemId.set(null);
      },
      error: () => this.reviewingItemId.set(null),
    });
  }
}

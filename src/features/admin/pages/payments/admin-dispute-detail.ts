import { Component, OnInit, inject, signal, input } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router, RouterLink } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { AdminService } from '../../services/admin.service';
import { ComplaintDetailDto, ResolveDisputeRequest } from '@features/payments/contracts/payment.contracts';
import { TranslationService } from '@core/services/translation.service';

import { TranslatePipe } from '@shared/pipes/translate.pipe';
@Component({
  selector: 'app-admin-dispute-detail',
  standalone: true,
  imports: [CommonModule, RouterLink, FormsModule, TranslatePipe],
  templateUrl: './admin-dispute-detail.html',
})
export class AdminDisputeDetail implements OnInit {
  private readonly adminService = inject(AdminService);
  private readonly router = inject(Router);
  private readonly translationService = inject(TranslationService);

  readonly id = input.required<string>();

  readonly dispute = signal<ComplaintDetailDto | null>(null);
  readonly isLoading = signal(true);
  readonly isResolving = signal(false);
  readonly resolved = signal(false);
  readonly errorMessage = signal<string | null>(null);
  adminNotes = '';

  ngOnInit(): void {
    this.loadDispute();
  }

  loadDispute(): void {
    this.isLoading.set(true);
    this.adminService.getDisputeDetail(this.id()).subscribe({
      next: (data) => {
        this.dispute.set(data);
        this.isLoading.set(false);
      },
      error: () => this.isLoading.set(false),
    });
  }

  resolveDispute(approveRefund: boolean): void {
    if (!this.confirmResolve(approveRefund)) return;

    this.isResolving.set(true);
    this.errorMessage.set(null);

    const request: ResolveDisputeRequest = {
      approveRefund,
      adminNotes: this.adminNotes || undefined,
    };

    this.adminService.resolveDispute(this.id(), request).subscribe({
      next: () => {
        this.isResolving.set(false);
        this.resolved.set(true);
      },
      error: (err) => {
        this.isResolving.set(false);
        this.errorMessage.set(err?.error?.message || this.translationService.translate('errors.unknownError'));
      },
    });
  }

  getStatusLabel(status: string): string {
    const labels: Record<string, string> = {
      Pending: this.translationService.translate('dispute.status.Pending'),
      Reviewed: this.translationService.translate('dispute.status.Reviewed'),
      ResolvedRefunded: this.translationService.translate('dispute.status.ResolvedRefunded'),
      ResolvedRejected: this.translationService.translate('dispute.status.ResolvedRejected'),
    };
    return labels[status] ?? status;
  }

  confirmResolve(approveRefund: boolean): boolean {
    return confirm(approveRefund
      ? this.translationService.translate('admin.disputes.confirmRefund')
      : this.translationService.translate('admin.disputes.confirmReject'));
  }

}

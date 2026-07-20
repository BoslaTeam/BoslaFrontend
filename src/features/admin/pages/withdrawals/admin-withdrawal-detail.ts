import { Component, inject, OnInit, signal } from '@angular/core';
import { ActivatedRoute, Router, RouterLink } from '@angular/router';
import { DatePipe, DecimalPipe } from '@angular/common';
import { TranslationService } from '@core/services/translation.service';
import { WithdrawalService } from '@features/withdrawals/services/withdrawal.service';
import { AdminWithdrawalDetailDto } from '@features/withdrawals/contracts/withdrawal.contracts';
import { FormsModule } from '@angular/forms';

import { TranslatePipe } from '@shared/pipes/translate.pipe';
@Component({
  selector: 'app-admin-withdrawal-detail',
  imports: [DatePipe, DecimalPipe, FormsModule, RouterLink, TranslatePipe],
  templateUrl: './admin-withdrawal-detail.html',
  styleUrl: './admin-withdrawal-detail.css',
})
export class AdminWithdrawalDetail implements OnInit {
  private readonly route = inject(ActivatedRoute);
  private readonly router = inject(Router);
  private readonly withdrawalService = inject(WithdrawalService);
  private readonly translationService = inject(TranslationService);

  readonly withdrawal = signal<AdminWithdrawalDetailDto | null>(null);
  readonly isLoading = signal(true);
  readonly actionLoading = signal(false);

  adminNotes = '';

  ngOnInit(): void {
    const id = this.route.snapshot.paramMap.get('id');
    if (id) this.loadDetail(id);
  }

  loadDetail(id: string): void {
    this.isLoading.set(true);
    this.withdrawalService.getWithdrawalDetail(id).subscribe({
      next: (item) => {
        this.withdrawal.set(item);
        this.adminNotes = item.adminNotes ?? '';
        this.isLoading.set(false);
      },
      error: () => this.isLoading.set(false),
    });
  }

  approve(): void {
    const w = this.withdrawal();
    if (!w) return;
    this.actionLoading.set(true);
    this.withdrawalService.approveWithdrawal(w.id, { adminNotes: this.adminNotes || undefined }).subscribe({
      next: () => {
        this.actionLoading.set(false);
        this.router.navigate(['/admin/withdrawals']);
      },
      error: () => this.actionLoading.set(false),
    });
  }

  reject(): void {
    const w = this.withdrawal();
    if (!w) return;
    this.actionLoading.set(true);
    this.withdrawalService.rejectWithdrawal(w.id, { adminNotes: this.adminNotes || undefined }).subscribe({
      next: () => {
        this.actionLoading.set(false);
        this.router.navigate(['/admin/withdrawals']);
      },
      error: () => this.actionLoading.set(false),
    });
  }

  markCompleted(): void {
    const w = this.withdrawal();
    if (!w) return;
    this.actionLoading.set(true);
    this.withdrawalService.completeWithdrawal(w.id).subscribe({
      next: () => {
        this.actionLoading.set(false);
        this.router.navigate(['/admin/withdrawals']);
      },
      error: () => this.actionLoading.set(false),
    });
  }

  getStatusLabel(status: string): string {
    const labels: Record<string, string> = {
      Pending: this.translationService.translate('admin.status.pending'),
      Processing: this.translationService.translate('admin.status.processing'),
      Completed: this.translationService.translate('admin.status.completed'),
      Rejected: this.translationService.translate('admin.status.rejected'),
    };
    return labels[status] ?? status;
  }

  getStatusClass(status: string): string {
    const classes: Record<string, string> = {
      Pending: 'status-pending',
      Processing: 'status-processing',
      Completed: 'status-completed',
      Rejected: 'status-rejected',
    };
    return classes[status] ?? 'status-pending';
  }

  getMethodLabel(method: string): string {
    const labels: Record<string, string> = {
      bank: this.translationService.translate('admin.method.bank'),
      wallet: this.translationService.translate('admin.method.eWallet'),
      paypal: this.translationService.translate('admin.method.paypal'),
      stripe: this.translationService.translate('admin.method.stripe'),
    };
    return labels[method.toLowerCase()] ?? method;
  }
}

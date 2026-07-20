import { Component, inject, OnInit, signal, computed } from '@angular/core';
import { RouterLink } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { DatePipe, DecimalPipe } from '@angular/common';
import { TranslationService } from '@core/services/translation.service';
import { WithdrawalService } from '@features/withdrawals/services/withdrawal.service';
import { AdminWithdrawalListDto } from '@features/withdrawals/contracts/withdrawal.contracts';

import { TranslatePipe } from '@shared/pipes/translate.pipe';
@Component({
  selector: 'app-admin-withdrawals-list',
  imports: [RouterLink, FormsModule, DatePipe, DecimalPipe, TranslatePipe],
  templateUrl: './admin-withdrawals-list.html',
  styleUrl: './admin-withdrawals-list.css',
})
export class AdminWithdrawalsList implements OnInit {
  private readonly withdrawalService = inject(WithdrawalService);
  private readonly translationService = inject(TranslationService);

  readonly withdrawals = signal<AdminWithdrawalListDto[]>([]);
  readonly isLoading = signal(true);

  selectedStatus = signal<string | null>(null);

  get statusOptions() {
    return [
      { value: null, label: this.translationService.translate('admin.filter.all') },
      { value: 'Pending', label: this.translationService.translate('admin.status.pending') },
      { value: 'Processing', label: this.translationService.translate('admin.status.processing') },
      { value: 'Completed', label: this.translationService.translate('admin.status.completed') },
      { value: 'Rejected', label: this.translationService.translate('admin.status.rejected') },
    ];
  }

  ngOnInit(): void {
    this.loadWithdrawals();
  }

  loadWithdrawals(): void {
    this.isLoading.set(true);
    this.withdrawalService.getAllWithdrawals(this.selectedStatus() ?? undefined).subscribe({
      next: (items) => {
        this.withdrawals.set(items);
        this.isLoading.set(false);
      },
      error: () => {
        this.withdrawals.set([]);
        this.isLoading.set(false);
      },
    });
  }

  onStatusFilter(status: string | null): void {
    this.selectedStatus.set(status);
    this.loadWithdrawals();
  }

  getStatusLabel(status: string): string {
    return this.statusOptions.find((o) => o.value === status)?.label ?? status;
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

  getUserInitials(name: string): string {
    const parts = name.split(' ').filter(Boolean);
    if (parts.length >= 2) return parts[0][0] + parts[parts.length - 1][0];
    return name.substring(0, 2).toUpperCase();
  }
}

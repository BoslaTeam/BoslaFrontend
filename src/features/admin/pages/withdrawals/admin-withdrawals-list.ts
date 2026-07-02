import { Component, inject, OnInit, signal, computed } from '@angular/core';
import { RouterLink } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { DatePipe, DecimalPipe } from '@angular/common';
import { WithdrawalService } from '@features/withdrawals/services/withdrawal.service';
import { AdminWithdrawalListDto } from '@features/withdrawals/contracts/withdrawal.contracts';

@Component({
  selector: 'app-admin-withdrawals-list',
  imports: [RouterLink, FormsModule, DatePipe, DecimalPipe],
  templateUrl: './admin-withdrawals-list.html',
  styleUrl: './admin-withdrawals-list.css',
})
export class AdminWithdrawalsList implements OnInit {
  private readonly withdrawalService = inject(WithdrawalService);

  readonly withdrawals = signal<AdminWithdrawalListDto[]>([]);
  readonly isLoading = signal(true);

  selectedStatus = signal<string | null>(null);

  readonly statusOptions = [
    { value: null, label: 'الكل' },
    { value: 'Pending', label: 'قيد الانتظار' },
    { value: 'Processing', label: 'قيد المعالجة' },
    { value: 'Completed', label: 'مكتمل' },
    { value: 'Rejected', label: 'مرفوض' },
  ];

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
      bank: 'تحويل بنكي',
      wallet: 'محفظة إلكترونية',
      paypal: 'PayPal',
      stripe: 'Stripe',
    };
    return labels[method.toLowerCase()] ?? method;
  }

  getUserInitials(name: string): string {
    const parts = name.split(' ').filter(Boolean);
    if (parts.length >= 2) return parts[0][0] + parts[parts.length - 1][0];
    return name.substring(0, 2).toUpperCase();
  }
}

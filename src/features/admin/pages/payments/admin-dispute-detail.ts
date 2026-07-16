import { Component, OnInit, inject, signal, input } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router, RouterLink } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { AdminService } from '../../services/admin.service';
import { ComplaintDetailDto, ResolveDisputeRequest } from '@features/payments/contracts/payment.contracts';

@Component({
  selector: 'app-admin-dispute-detail',
  standalone: true,
  imports: [CommonModule, RouterLink, FormsModule],
  templateUrl: './admin-dispute-detail.html',
})
export class AdminDisputeDetail implements OnInit {
  private readonly adminService = inject(AdminService);
  private readonly router = inject(Router);

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
    if (!confirm(approveRefund
      ? 'هل أنت متأكد من رد المبلغ للمستخدم؟'
      : 'هل أنت متأكد من رفض الشكوى؟')) return;

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
        this.errorMessage.set(err?.error?.message || 'حدث خطأ');
      },
    });
  }

  getStatusLabel(status: string): string {
    const labels: Record<string, string> = {
      Pending: 'قيد الانتظار',
      Reviewed: 'تمت المراجعة',
      ResolvedRefunded: 'تم الرد (استرجاع)',
      ResolvedRejected: 'تم الرد (رفض)',
    };
    return labels[status] ?? status;
  }
}

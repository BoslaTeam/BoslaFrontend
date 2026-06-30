import { Component, inject, OnInit, signal, input } from '@angular/core';
import { Router } from '@angular/router';
import { DatePipe, SlicePipe } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { AdminService } from '../../services/admin.service';
import { AdminPaymentDetailDto } from '../../contracts/admin.contracts';

@Component({
  selector: 'app-admin-payment-detail',
  imports: [DatePipe, SlicePipe, FormsModule],
  templateUrl: './admin-payment-detail.html',
  styleUrl: './admin-payment-detail.css',
})
export class AdminPaymentDetail implements OnInit {
  private readonly adminService = inject(AdminService);
  private readonly router = inject(Router);

  readonly id = input.required<string>();

  readonly payment = signal<AdminPaymentDetailDto | null>(null);
  readonly isLoading = signal(true);
  readonly hasError = signal(false);
  readonly isRefunding = signal(false);
  readonly showRefundModal = signal(false);
  refundReason = '';

  ngOnInit(): void {
    this.loadPayment();
  }

  loadPayment(): void {
    this.isLoading.set(true);
    this.hasError.set(false);

    this.adminService.getPaymentDetail(this.id()).subscribe({
      next: (data) => {
        this.payment.set(data);
        this.isLoading.set(false);
      },
      error: () => {
        this.hasError.set(true);
        this.isLoading.set(false);
      },
    });
  }

  confirmRefund(): void {
    this.isRefunding.set(true);

    this.adminService.refundPayment(this.id(), this.refundReason || undefined).subscribe({
      next: () => {
        this.isRefunding.set(false);
        this.showRefundModal.set(false);
        this.refundReason = '';
        this.loadPayment();
      },
      error: () => {
        this.isRefunding.set(false);
      },
    });
  }

  getStatusLabel(status: string): string {
    const labels: Record<string, string> = {
      Pending: 'قيد الانتظار',
      Completed: 'مكتمل',
      Failed: 'فشل',
      Refunded: 'مسترجع',
    };
    return labels[status] ?? status;
  }

  getStatusClass(status: string): string {
    const classes: Record<string, string> = {
      Completed: 'status-completed',
      Pending: 'status-pending',
      Failed: 'status-failed',
      Refunded: 'status-refunded',
    };
    return classes[status] ?? 'status-pending';
  }

  getMethodLabel(method: string): string {
    const labels: Record<string, string> = {
      stripe: 'Stripe',
      card: 'بطاقة ائتمان',
      wallet: 'محفظة',
      bank: 'تحويل بنكي',
    };
    return labels[method.toLowerCase()] ?? method;
  }

  goBack(): void {
    this.router.navigate(['/admin/payments']);
  }
}

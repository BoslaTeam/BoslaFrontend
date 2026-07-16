import { Component, OnInit, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink } from '@angular/router';
import { PaymentService } from '../../services/payment.service';
import { PaymentResponseDto } from '../../contracts/payment.contracts';
import { UiButton } from '@shared/ui/button/button';
import { UiSpinner } from '@shared/ui/spinner/spinner';

@Component({
  selector: 'app-my-payments',
  standalone: true,
  imports: [CommonModule, RouterLink, UiSpinner],
  templateUrl: './my-payments.html',
})
export class MyPayments implements OnInit {
  private readonly paymentService = inject(PaymentService);

  readonly payments = signal<PaymentResponseDto[]>([]);
  readonly isLoading = signal(true);

  ngOnInit(): void {
    this.loadPayments();
  }

  loadPayments(): void {
    this.isLoading.set(true);
    this.paymentService.getMyPayments().subscribe({
      next: (res) => {
        this.payments.set(res.data ?? []);
        this.isLoading.set(false);
      },
      error: () => this.isLoading.set(false),
    });
  }

  getEscrowLabel(status: string): string {
    const labels: Record<string, string> = {
      Held: 'محجوز',
      Released: 'مفرج عنه',
      Disputed: 'في نزاع',
      Refunded: 'مسترجع',
    };
    return labels[status] ?? status;
  }

  getEscrowClass(status: string): string {
    const classes: Record<string, string> = {
      Held: 'bg-amber-50 text-amber-600 border-amber-200',
      Released: 'bg-emerald-50 text-emerald-600 border-emerald-200',
      Disputed: 'bg-red-50 text-red-600 border-red-200',
      Refunded: 'bg-slate-100 text-slate-500 border-slate-200',
    };
    return classes[status] ?? 'bg-slate-50 text-slate-500 border-slate-200';
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

  canFileDispute(payment: PaymentResponseDto): boolean {
    return payment.escrowStatus === 'Held';
  }
}

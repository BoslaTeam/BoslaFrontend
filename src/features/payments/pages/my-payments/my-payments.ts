import { Component, OnInit, computed, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink } from '@angular/router';
import { PaymentService } from '../../services/payment.service';
import { PaymentResponseDto } from '../../contracts/payment.contracts';
import { UiSpinner } from '@shared/ui/spinner/spinner';
import { TranslationService } from '@core/services/translation.service';

import { TranslatePipe } from '@shared/pipes/translate.pipe';
@Component({
  selector: 'app-my-payments',
  standalone: true,
  imports: [CommonModule, RouterLink, UiSpinner, TranslatePipe],
  templateUrl: './my-payments.html',
})
export class MyPayments implements OnInit {
  private readonly paymentService = inject(PaymentService);
  private readonly translationService = inject(TranslationService);

  readonly direction = computed(() => this.translationService.currentLang() === 'ar' ? 'rtl' : 'ltr');

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
      Held: this.translationService.translate('payments.escrowStatus.held'),
      Released: this.translationService.translate('payments.escrowStatus.released'),
      Disputed: this.translationService.translate('payments.escrowStatus.disputed'),
      Refunded: this.translationService.translate('payments.escrowStatus.refunded'),
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
      Pending: this.translationService.translate('payments.status.pending'),
      Completed: this.translationService.translate('payments.status.completed'),
      Failed: this.translationService.translate('payments.status.failed'),
      Refunded: this.translationService.translate('payments.status.refunded'),
    };
    return labels[status] ?? status;
  }

  canFileDispute(payment: PaymentResponseDto): boolean {
    return payment.escrowStatus === 'Held';
  }
}

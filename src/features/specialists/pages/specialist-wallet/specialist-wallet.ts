import { Component, inject, OnInit, signal } from '@angular/core';
import { DatePipe, DecimalPipe } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { WithdrawalService } from '@features/withdrawals/services/withdrawal.service';
import { WalletDto, WithdrawalDto, WithdrawRequestDto } from '@features/withdrawals/contracts/withdrawal.contracts';

@Component({
  selector: 'app-specialist-wallet',
  imports: [DatePipe, DecimalPipe, FormsModule],
  templateUrl: './specialist-wallet.html',
  styleUrl: './specialist-wallet.css',
})
export class SpecialistWallet implements OnInit {
  private readonly withdrawalService = inject(WithdrawalService);

  readonly wallet = signal<WalletDto | null>(null);
  readonly isLoading = signal(true);
  readonly showRequestForm = signal(false);
  readonly submitting = signal(false);
  readonly successMessage = signal<string | null>(null);
  readonly errorMessage = signal<string | null>(null);

  requestAmount = 0;
  requestMethod = 'bank';
  requestDetails = '';

  ngOnInit(): void {
    this.loadWallet();
  }

  loadWallet(): void {
    this.isLoading.set(true);
    this.withdrawalService.getWallet().subscribe({
      next: (w) => {
        this.wallet.set(w);
        this.isLoading.set(false);
      },
      error: () => this.isLoading.set(false),
    });
  }

  openRequestForm(): void {
    this.successMessage.set(null);
    this.errorMessage.set(null);
    this.requestAmount = 0;
    this.requestMethod = 'bank';
    this.requestDetails = '';
    this.showRequestForm.set(true);
  }

  closeRequestForm(): void {
    this.showRequestForm.set(false);
  }

  submitRequest(): void {
    const wallet = this.wallet();
    if (!wallet) return;

    if (this.requestAmount <= 0) {
      this.errorMessage.set('يرجى إدخال مبلغ صحيح.');
      return;
    }

    if (this.requestAmount > wallet.availableBalance) {
      this.errorMessage.set(`المبلغ المطلوب يتجاوز الرصيد المتاح (${wallet.availableBalance} ر.س).`);
      return;
    }

    this.submitting.set(true);
    this.errorMessage.set(null);

    const payload: WithdrawRequestDto = {
      amount: this.requestAmount,
      paymentMethod: this.requestMethod,
      paymentDetails: this.requestDetails || undefined,
    };

    this.withdrawalService.requestWithdrawal(payload).subscribe({
      next: () => {
        this.submitting.set(false);
        this.successMessage.set('تم تقديم طلب السحب بنجاح. سيتم مراجعته من قبل الإدارة.');
        this.showRequestForm.set(false);
        this.loadWallet();
      },
      error: (err) => {
        this.submitting.set(false);
        this.errorMessage.set(err?.error?.title || 'حدث خطأ أثناء تقديم الطلب.');
      },
    });
  }

  getStatusLabel(status: string): string {
    const labels: Record<string, string> = {
      Pending: 'قيد الانتظار',
      Processing: 'قيد المعالجة',
      Completed: 'مكتمل',
      Rejected: 'مرفوض',
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
      bank: 'تحويل بنكي',
      wallet: 'محفظة إلكترونية',
      paypal: 'PayPal',
      stripe: 'Stripe',
    };
    return labels[method.toLowerCase()] ?? method;
  }
}

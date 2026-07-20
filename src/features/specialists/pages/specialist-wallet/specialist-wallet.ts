import { Component, computed, inject, OnInit, signal } from '@angular/core';
import { DatePipe, DecimalPipe } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { WithdrawalService } from '@features/withdrawals/services/withdrawal.service';
import { WalletDto, WithdrawalDto, WithdrawRequestDto } from '@features/withdrawals/contracts/withdrawal.contracts';
import { TranslationService } from '@core/services/translation.service';

import { TranslatePipe } from '@shared/pipes/translate.pipe';
@Component({
  selector: 'app-specialist-wallet',
  imports: [DatePipe, DecimalPipe, FormsModule, TranslatePipe],
  templateUrl: './specialist-wallet.html',
})
export class SpecialistWallet implements OnInit {
  private readonly withdrawalService = inject(WithdrawalService);
  private readonly translationService = inject(TranslationService);

  readonly direction = computed(() => this.translationService.currentLang() === 'ar' ? 'rtl' : 'ltr');
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
      this.errorMessage.set(this.translationService.translate('specialist.wallet.enterValidAmount'));
      return;
    }

    if (this.requestAmount > wallet.availableBalance) {
      this.errorMessage.set(`${this.translationService.translate('specialist.wallet.amountExceedsBalance')} (${wallet.availableBalance} ${this.translationService.translate('home.specialists.currency')}).`);
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
        this.successMessage.set(this.translationService.translate('specialist.wallet.withdrawalSuccess'));
        this.showRequestForm.set(false);
        this.loadWallet();
      },
      error: (err) => {
        this.submitting.set(false);
        this.errorMessage.set(err?.error?.title || this.translationService.translate('specialist.wallet.withdrawalError'));
      },
    });
  }

  getStatusLabel(status: string): string {
    const key = `specialist.wallet.status${status}`;
    const t = this.translationService.translate(key);
    return t === key ? status : t;
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
    const key = `specialist.wallet.method${method.charAt(0).toUpperCase() + method.slice(1).toLowerCase()}`;
    return this.translationService.translate(key);
  }
}

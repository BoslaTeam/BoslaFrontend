import { Component, inject, OnInit, signal } from '@angular/core';
import { DatePipe, DecimalPipe } from '@angular/common';
import { WalletApiService } from '../../services/wallet-api.service';
import { AdminWalletStatsDto, WalletResponseDto, TransactionDto } from '../../contracts/wallet.contracts';

@Component({
  selector: 'app-admin-wallet',
  imports: [DatePipe],
  templateUrl: './admin-wallet.html',
})
export class AdminWallet implements OnInit {
  private readonly walletApi = inject(WalletApiService);

  readonly stats = signal<AdminWalletStatsDto | null>(null);
  readonly wallet = signal<WalletResponseDto | null>(null);
  readonly transactions = signal<TransactionDto[]>([]);
  readonly loading = signal(true);

  ngOnInit(): void {
    this.loadData();
  }

  private loadData(): void {
    this.loading.set(true);
    this.walletApi.getAdminWalletStats().subscribe(s => this.stats.set(s));
    this.walletApi.getAdminWallet().subscribe(w => this.wallet.set(w));
    this.walletApi.getAllTransactions(1, 50).subscribe(t => {
      this.transactions.set(t);
      this.loading.set(false);
    });
  }

  formatAmount(amount: number): string {
    return amount.toLocaleString('ar-EG', { minimumFractionDigits: 2, maximumFractionDigits: 2 });
  }

  getTypeClass(type: string): string {
    const map: Record<string, string> = {
      Credit: 'bg-green-50 text-green-600 border-green-200',
      Debit: 'bg-red-50 text-red-600 border-red-200',
      Hold: 'bg-amber-50 text-amber-600 border-amber-200',
      Release: 'bg-blue-50 text-blue-600 border-blue-200',
    };
    return map[type] ?? 'bg-slate-50 text-slate-600 border-slate-200';
  }

  getTypeIcon(type: string): string {
    const map: Record<string, string> = {
      Credit: 'fa-arrow-down',
      Debit: 'fa-arrow-up',
      Hold: 'fa-lock',
      Release: 'fa-unlock',
    };
    return map[type] ?? 'fa-circle';
  }

  getTypeLabel(type: string): string {
    const map: Record<string, string> = {
      Credit: 'إيداع',
      Debit: 'خصم',
      Hold: 'تجميد',
      Release: 'إلغاء التجميد',
    };
    return map[type] ?? type;
  }
}

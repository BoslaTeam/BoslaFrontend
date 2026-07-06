export interface WalletResponseDto {
  id: string;
  balance: number;
  holdBalance: number;
  currency: string;
  recentTransactions: TransactionDto[];
}

export interface TransactionDto {
  id: string;
  amount: number;
  type: 'Credit' | 'Debit' | 'Hold' | 'Release';
  description: string;
  referenceType?: string;
  referenceId?: string;
  createdAtUtc: string;
}

export interface AdminWalletStatsDto {
  totalPlatformFees: number;
  totalTaxes: number;
  totalPaidToSpecialists: number;
  totalRefunded: number;
  availableBalance: number;
  totalCompletedPayments: number;
  totalRefundedPayments: number;
}

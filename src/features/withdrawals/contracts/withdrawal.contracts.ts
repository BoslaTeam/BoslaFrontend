export interface WalletDto {
  totalEarnings: number;
  availableBalance: number;
  pendingBalance: number;
  totalWithdrawn: number;
  recentWithdrawals: WithdrawalDto[];
}

export interface WithdrawalDto {
  id: string;
  amount: number;
  status: string;
  paymentMethod: string;
  paymentDetails?: string;
  requestedAt: string;
  processedAt?: string;
  adminNotes?: string;
}

export interface WithdrawRequestDto {
  amount: number;
  paymentMethod: string;
  paymentDetails?: string;
}

export interface AdminWithdrawalListDto {
  id: string;
  amount: number;
  status: string;
  paymentMethod: string;
  requestedAt: string;
  processedAt?: string;
  specialistId: string;
  specialistName: string;
  specialistImage?: string;
  specialistTitle?: string;
}

export interface AdminWithdrawalDetailDto {
  id: string;
  amount: number;
  status: string;
  paymentMethod: string;
  paymentDetails?: string;
  requestedAt: string;
  processedAt?: string;
  reviewedBy?: string;
  adminNotes?: string;
  specialistId: string;
  specialistName: string;
  specialistAvatar?: string;
}

export interface AdminWithdrawActionDto {
  adminNotes?: string;
}

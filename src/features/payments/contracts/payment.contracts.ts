export interface PaymentResponseDto {
  id: string;
  appointmentId: string;
  amount: number;
  currency: string;
  status: 'Pending' | 'Completed' | 'Failed' | 'Refunded';
  escrowStatus: 'Held' | 'Released' | 'Disputed' | 'Refunded';
  heldUntil?: string;
  disputeReason?: string;
  disputedAt?: string;
  paymentMethod: string;
  externalPaymentId?: string;
  paidAt?: string;
  platformFeeAmount: number;
  specialistAmount: number;
  taxAmount: number;
  clientSecret: string | null;
  successUrl?: string;
  cancelUrl?: string;
}

export interface InitiatePaymentRequest {
  appointmentId: string;
  currency: string;
}

export interface FileDisputeRequest {
  paymentId: string;
  reason: string;
  description?: string;
}

export interface ComplaintDto {
  id: string;
  paymentId: string;
  reason: string;
  description?: string;
  status: 'Pending' | 'Reviewed' | 'ResolvedRefunded' | 'ResolvedRejected';
  createdAtUtc: string;
  adminNotes?: string;
  resolvedAt?: string;
}

export interface ComplaintDetailDto {
  id: string;
  paymentId: string;
  appointmentId: string;
  userId: string;
  userName: string;
  userAvatarUrl?: string;
  reason: string;
  description?: string;
  status: 'Pending' | 'Reviewed' | 'ResolvedRefunded' | 'ResolvedRejected';
  amount: number;
  currency: string;
  specialistName?: string;
  createdAtUtc: string;
  adminNotes?: string;
  resolvedAt?: string;
}

export interface ComplaintListItemDto {
  id: string;
  paymentId: string;
  appointmentId: string;
  reason: string;
  description?: string;
  status: 'Pending' | 'Reviewed' | 'ResolvedRefunded' | 'ResolvedRejected';
  createdAtUtc: string;
  adminNotes?: string;
  resolvedAt?: string;
  userName: string;
  userAvatarUrl?: string;
  amount: number;
  currency: string;
}

export interface ResolveDisputeRequest {
  approveRefund: boolean;
  adminNotes?: string;
}

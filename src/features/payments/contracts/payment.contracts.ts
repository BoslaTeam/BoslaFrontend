export interface PaymentResponseDto {
  id: string;
  appointmentId: string;
  amount: number;
  currency: string;
  status: 'Pending' | 'Completed' | 'Failed' | 'Refunded';
  paymentMethod: string;
  externalPaymentId?: string;
  paidAt?: string;
  platformFeeAmount: number;
  specialistAmount: number;
  taxAmount: number;
  clientSecret?: string;
  successUrl?: string;
  cancelUrl?: string;
}

export interface InitiatePaymentRequest {
  appointmentId: string;
  currency: string;
}

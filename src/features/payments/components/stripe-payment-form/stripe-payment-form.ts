import { Component, input, output, inject, signal, OnInit, OnDestroy, ElementRef, viewChild } from '@angular/core';
import { CommonModule } from '@angular/common';
import { PaymentService } from '../../services/payment.service';
import { loadStripe, Stripe, StripeElements, StripeCardNumberElement } from '@stripe/stripe-js';
import { environment } from '../../../../environments/environment';
import { ToastService } from '@core/services/toast.service';

@Component({
  selector: 'app-stripe-payment-form',
  standalone: true,
  imports: [CommonModule],
  template: `
    @if (!clientSecret()) {
      <div class="flex flex-col items-center justify-center py-6">
        <div class="w-8 h-8 border-[3px] border-bosla-primary/20 border-t-bosla-primary rounded-full animate-spin"></div>
        <p class="text-sm text-bosla-grey mt-3">جاري تجهيز عملية الدفع...</p>
      </div>
    } @else {
      <div class="space-y-4">
        <div #cardElement
          class="w-full p-4 bg-white border border-slate-200 rounded-xl text-right transition-colors focus-within:border-bosla-primary"></div>

        @if (errorMessage()) {
          <div class="text-red-500 text-sm font-medium">{{ errorMessage() }}</div>
        }

        <button (click)="pay()" [disabled]="processing()"
          class="w-full py-3.5 px-6 rounded-xl bg-gradient-to-r from-bosla-primary to-bosla-blue text-white font-bold text-sm transition-all duration-300 flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed hover:shadow-lg hover:-translate-y-0.5">
          @if (processing()) {
            <svg class="animate-spin w-5 h-5" fill="none" viewBox="0 0 24 24">
              <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"></circle>
              <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z"></path>
            </svg>
            جاري معالجة الدفع...
          } @else {
            إتمام الدفع الآن
          }
        </button>
      </div>
    }
  `,
})
export class StripePaymentForm implements OnInit, OnDestroy {
  readonly appointmentId = input.required<string>();
  readonly amount = input.required<number>();
  readonly currency = input('usd');

  readonly paymentSuccess = output<string>();
  readonly paymentError = output<string>();

  private paymentService = inject(PaymentService);
  private toast = inject(ToastService);

  readonly cardElement = viewChild<ElementRef<HTMLDivElement>>('cardElement');

  clientSecret = signal<string | null>(null);
  processing = signal(false);
  errorMessage = signal('');

  private stripe: Stripe | null = null;
  private elements: StripeElements | null = null;
  private card: StripeCardNumberElement | null = null;

  async ngOnInit() {
    this.paymentService.initiate(this.appointmentId(), this.currency()).subscribe({
      next: async (res) => {
        const data = res.data;
        if (!data?.clientSecret) {
          this.errorMessage.set('فشل في الحصول على معلومات الدفع');
          return;
        }
        this.clientSecret.set(data.clientSecret);
        await this.mountStripe(data.clientSecret);
      },
      error: () => {
        this.errorMessage.set('فشل في بدء عملية الدفع. يرجى المحاولة لاحقاً.');
        this.paymentError.emit('init_failed');
      }
    });
  }

  ngOnDestroy() {
    this.card?.destroy();
  }

  private async mountStripe(clientSecret: string) {
    const stripe = await loadStripe(environment.stripePublishableKey);
    if (!stripe) {
      this.errorMessage.set('فشل في تحميل بوابة الدفع');
      return;
    }
    this.stripe = stripe;

    const elements = stripe.elements({ clientSecret, appearance: { theme: 'stripe', variables: { colorPrimary: '#1B4F72', borderRadius: '12px' } } });
    this.elements = elements;

    const card = elements.create('cardNumber', {
      placeholder: 'رقم البطاقة',
      style: {
        base: { fontSize: '16px', color: '#1e293b', fontFamily: 'Cairo, sans-serif', '::placeholder': { color: '#94a3b8' } },
      }
    });
    this.card = card;

    const el = this.cardElement();
    if (el) {
      card.mount(el.nativeElement);
    }
  }

  async pay() {
    if (!this.stripe || !this.elements || !this.clientSecret()) return;
    this.processing.set(true);
    this.errorMessage.set('');

    try {
      const { error, paymentIntent } = await this.stripe.confirmCardPayment(this.clientSecret()!, {
        payment_method: { card: this.elements!.getElement('cardNumber')! },
      });

      if (error) {
        this.errorMessage.set(error.message ?? 'حدث خطأ في عملية الدفع');
        this.processing.set(false);
        return;
      }

      if (paymentIntent?.status === 'succeeded') {
        this.toast.success('تم الدفع بنجاح!');
        this.paymentSuccess.emit(paymentIntent.id);
      }
    } catch {
      this.errorMessage.set('حدث خطأ غير متوقع. يرجى المحاولة مرة أخرى.');
    }
    this.processing.set(false);
  }
}

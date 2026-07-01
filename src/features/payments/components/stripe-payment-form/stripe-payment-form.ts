import { Component, input, output, inject, signal, computed, effect, OnDestroy, ElementRef, viewChild } from '@angular/core';
import { CommonModule } from '@angular/common';
import { loadStripe, Stripe, StripeElements, StripeCardNumberElement, StripeCardExpiryElement, StripeCardCvcElement } from '@stripe/stripe-js';
import { environment } from '@environments/environment';
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

        <div class="bg-gradient-to-br from-bosla-primary to-bosla-blue rounded-2xl p-5 text-white shadow-xl relative overflow-hidden">
          <div class="absolute -top-8 -right-8 w-28 h-28 bg-white/5 rounded-full"></div>
          <div class="absolute -bottom-6 -left-6 w-20 h-20 bg-white/5 rounded-full"></div>

          <div class="flex items-center justify-between mb-6">
            <span class="text-[11px] font-semibold text-white/60 tracking-wider uppercase">مدفوعات آمنة</span>
            <div class="flex items-center gap-2">
              <svg class="w-7 h-7 text-white/80" viewBox="0 0 24 24" fill="currentColor">
                <path d="M3 10h18M7 15h1m4 0h1m-7 4h12a3 3 0 003-3V8a3 3 0 00-3-3H6a3 3 0 00-3 3v8a3 3 0 003 3z"/>
              </svg>
            </div>
          </div>

          <div class="mb-5">
            <label class="block text-[11px] font-semibold text-white/70 mb-1.5 tracking-wide">رقم البطاقة</label>
            <div #cardNumberContainer
              class="w-full bg-white/10 backdrop-blur-sm border border-white/20 rounded-xl p-3 h-11 transition-all duration-200 [&_.StripeElement]:h-full [&_.StripeElement]:flex [&_.StripeElement]:items-center"></div>
          </div>

          <div class="grid grid-cols-2 gap-3">
            <div>
              <label class="block text-[11px] font-semibold text-white/70 mb-1.5 tracking-wide">تاريخ الانتهاء</label>
              <div #cardExpiryContainer
                class="bg-white/10 backdrop-blur-sm border border-white/20 rounded-xl p-3 h-11 transition-all duration-200 [&_.StripeElement]:h-full [&_.StripeElement]:flex [&_.StripeElement]:items-center"></div>
            </div>
            <div>
              <label class="block text-[11px] font-semibold text-white/70 mb-1.5 tracking-wide">رمز CVV</label>
              <div #cardCvcContainer
                class="bg-white/10 backdrop-blur-sm border border-white/20 rounded-xl p-3 h-11 transition-all duration-200 [&_.StripeElement]:h-full [&_.StripeElement]:flex [&_.StripeElement]:items-center"></div>
            </div>
          </div>
        </div>

        <div class="flex items-center justify-center gap-1.5 text-[11px] text-bosla-grey">
          <svg class="w-3.5 h-3.5" fill="currentColor" viewBox="0 0 20 20">
            <path fill-rule="evenodd" d="M5 9V7a5 5 0 0110 0v2a2 2 0 012 2v5a2 2 0 01-2 2H5a2 2 0 01-2-2v-5a2 2 0 012-2zm8-2v2H7V7a3 3 0 016 0z" clip-rule="evenodd"/>
          </svg>
          مشفرة وآمنة SSL
          <span class="w-1 h-1 rounded-full bg-bosla-grey/30"></span>
          <svg class="w-8 h-3" viewBox="0 0 32 12" fill="none">
            <rect width="32" height="12" rx="2" fill="#E2E8F0"/>
            <circle cx="8" cy="6" r="3" fill="#1B4F72"/>
            <circle cx="16" cy="6" r="3" fill="#F39C12"/>
            <circle cx="24" cy="6" r="3" fill="#2E86AB"/>
          </svg>
        </div>

        @if (errorMessage()) {
          <div class="text-red-500 text-xs font-medium p-3 bg-red-50 rounded-xl border border-red-100">{{ errorMessage() }}</div>
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
export class StripePaymentForm implements OnDestroy {
  readonly clientSecret = input.required<string>();
  readonly appointmentId = input.required<string>();
  readonly amount = input.required<number>();
  readonly currency = input('usd');

  readonly paymentSuccess = output<string>();
  readonly paymentError = output<string>();

  private toast = inject(ToastService);

  readonly cardNumberContainer = viewChild<ElementRef<HTMLDivElement>>('cardNumberContainer');
  readonly cardExpiryContainer = viewChild<ElementRef<HTMLDivElement>>('cardExpiryContainer');
  readonly cardCvcContainer = viewChild<ElementRef<HTMLDivElement>>('cardCvcContainer');

  private clientSecretValue = computed(() => this.clientSecret());
  processing = signal(false);
  errorMessage = signal('');

  private stripe: Stripe | null = null;
  private elements: StripeElements | null = null;
  private cardNumber: StripeCardNumberElement | null = null;
  private cardExpiry: StripeCardExpiryElement | null = null;
  private cardCvc: StripeCardCvcElement | null = null;

  private isMounted = signal(false);

  constructor() {
    effect(() => {
      const cs = this.clientSecretValue();
      if (cs && !this.isMounted()) {
        this.isMounted.set(true);
        this.mountStripe(cs);
      }
    });
  }

  ngOnDestroy() {
    this.cardNumber?.destroy();
    this.cardExpiry?.destroy();
    this.cardCvc?.destroy();
  }

  private async mountStripe(clientSecret: string) {
    const stripe = await loadStripe(environment.stripePublishableKey);
    if (!stripe) {
      this.errorMessage.set('فشل في تحميل بوابة الدفع');
      return;
    }
    this.stripe = stripe;

    const elements = stripe.elements({ appearance: { theme: 'stripe', variables: { colorPrimary: '#1B4F72', borderRadius: '12px' } } });
    this.elements = elements;

    this.cardNumber = elements.create('cardNumber', {
      placeholder: '',
      style: {
        base: { fontSize: '15px', color: '#ffffff', fontFamily: 'Inter, Cairo, sans-serif', '::placeholder': { color: 'rgba(255,255,255,0.45)' }, fontWeight: '500' },
        invalid: { color: '#f87171' },
      }
    });
    this.cardExpiry = elements.create('cardExpiry', {
      style: {
        base: { fontSize: '15px', color: '#ffffff', fontFamily: 'Inter, Cairo, sans-serif', '::placeholder': { color: 'rgba(255,255,255,0.45)' }, fontWeight: '500' },
        invalid: { color: '#f87171' },
      }
    });
    this.cardCvc = elements.create('cardCvc', {
      style: {
        base: { fontSize: '15px', color: '#ffffff', fontFamily: 'Inter, Cairo, sans-serif', '::placeholder': { color: 'rgba(255,255,255,0.45)' }, fontWeight: '500' },
        invalid: { color: '#f87171' },
      }
    });

    this.cardNumber.mount(this.cardNumberContainer()!.nativeElement);
    this.cardExpiry.mount(this.cardExpiryContainer()!.nativeElement);
    this.cardCvc.mount(this.cardCvcContainer()!.nativeElement);
  }

  async pay() {
    if (!this.stripe || !this.elements || !this.clientSecret()) return;
    this.processing.set(true);
    this.errorMessage.set('');

    try {
      const { error, paymentIntent } = await this.stripe.confirmCardPayment(this.clientSecret()!, {
        payment_method: { card: this.elements.getElement('cardNumber')! },
      });

      if (error) {
        this.errorMessage.set(error.message ?? 'حدث خطأ في عملية الدفع');
        this.processing.set(false);
        return;
      }

      if (paymentIntent?.status === 'succeeded') {
        this.toast.success('تم الدفع بنجاح!');
        this.paymentSuccess.emit(paymentIntent.id);
      } else if (paymentIntent?.status === 'processing') {
        this.toast.success('جاري معالجة الدفع... سيتم تحديث الحالة تلقائياً.');
        this.paymentSuccess.emit(paymentIntent.id);
      } else if (paymentIntent?.status === 'requires_capture') {
        this.toast.success('تم تأكيد الدفع. قيد الانتظار للخصم.');
        this.paymentSuccess.emit(paymentIntent.id);
      } else {
        this.errorMessage.set('حالة الدفع غير متوقعة: ' + (paymentIntent?.status ?? 'unknown'));
      }
    } catch {
      this.errorMessage.set('حدث خطأ غير متوقع. يرجى المحاولة مرة أخرى.');
    }
    this.processing.set(false);
  }
}

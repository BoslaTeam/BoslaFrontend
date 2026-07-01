import { Component } from '@angular/core';
import { RouterLink } from '@angular/router';

@Component({
  selector: 'app-payment-cancel',
  standalone: true,
  imports: [RouterLink],
  template: `
    <div class="min-h-screen bg-bosla-offwhite flex items-center justify-center px-4" dir="rtl">
      <div class="bg-white rounded-2xl shadow-sm border border-slate-200 p-8 md:p-12 text-center max-w-md w-full">
        <div class="w-20 h-20 mx-auto bg-amber-50 text-amber-500 rounded-full flex items-center justify-center mb-6">
          <svg class="w-10 h-10" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12" />
          </svg>
        </div>
        <h1 class="text-2xl font-black text-bosla-primary mb-2">تم إلغاء عملية الدفع</h1>
        <p class="text-sm text-bosla-grey mb-8">لم يتم خصم أي مبلغ. يمكنك إعادة محاولة الدفع لاحقاً من صفحة المواعيد.</p>
        <a [routerLink]="['/appointments']"
          class="inline-flex items-center gap-2 px-6 py-3 rounded-xl bg-bosla-primary text-white font-bold text-sm hover:bg-bosla-primary/90 transition-all">
          العودة إلى المواعيد
        </a>
      </div>
    </div>
  `,
})
export class PaymentCancel {}

# خطة تفعيل نظام الدفع (Payment System)

## الوضع الحالي

### الموجود فعلياً في المشروع

| المكون | Backend | Frontend |
|--------|---------|----------|
| **Stripe Gateway** | `StripePaymentGateway` يعمل — ينشيء PaymentIntent ويعيد ClientSecret | ❌ مفقود — `@stripe/stripe-js` غير موجود، ولا مفتاح publishable |
| **PaymentService** | `IPaymentService` كامل (Initiate, GetById, GetByAppointment, GetMyPayments) | ❌ مفقود — لا يوجد service في الفرونت |
| **PaymentsController** | 5 endpoints (POST initiate, GET by id, GET by appointment, GET my, POST webhook) | ⚠️ الـ endpoints معرفين في `api-endpoints.ts` بس مش مستخدمين |
| **Admin Payments** | `AdminController` (list, detail, refund) كاملة | ✅ Admin payment list + detail + refund شغالة |
| **Appointment Payment** | `MarkAsPaidAsync` + `AppointmentStatusChangedEventHandler` | ⚠️ موجود UI payment step بس بيستخدم `confirmAppointment` (mark-as-paid مباشر) بدون Stripe |
| **Earnings System** | `SpecialistService.GetEarningsAsync` + monthly revenue | ✅ موجود earnings display + revenue chart |
| **Stripe Webhook** | `PaymentsController.ConfirmWebhook` يتعامل مع `PaymentIntentSucceeded`/`PaymentIntentPaymentFailed` | ❌ مفقود — need stripe CLI testing |
| **Payment Pages** | — | ⚠️ `my-payments` يستخدم mock data، `success/cancel` صفحات غير موجودة |
| **Stripe Config** | `appsettings.json` فيه SecretKey, PublishableKey, WebhookSecret, SuccessUrl, CancelUrl | ❌ البيئة (environment) مافيها publishable key |
| **Fee Structure** | Platform 10%, Tax 5%, Specialist 85% — محسوب في `Payment.Initiate` | — |

---

## الخطة — 3 Phases

## Phase 1: Frontend Stripe Integration

### 1.1 إضافة Stripe SDK

**Files:**
- `package.json` — أضف `"@stripe/stripe-js": "^5.0.0"`
- `src/environments/environment.ts` — أضف `stripePublishableKey: 'pk_test_...'`
- `src/environments/environment.prod.ts` — أضف `stripePublishableKey: 'pk_live_...'`

**التفاصيل:**
```
npm install @stripe/stripe-js
```

```typescript
// environment.ts
export const environment = {
  // ... existing
  stripePublishableKey: 'pk_test_51TkOLj05d5HmC2JPeXjUoGecsh3nv5vqPOqbCK5cDPcyM5VEzuoOxHfjAenQ7iKJiBhQsXH3RrwouMnfJ9wkWK4700ia1UKSfl',
};
```

---

### 1.2 إنشاء Payment Frontend Service

**New file:** `src/features/payments/services/payment.service.ts`

```typescript
@Injectable({ providedIn: 'root' })
export class PaymentService {
  constructor(private http: HttpClient) {}

  initiate(appointmentId: string, currency = 'usd'): Observable<ApiResponse<PaymentResponseDto>> {
    return this.http.post<ApiResponse<PaymentResponseDto>>(API_ENDPOINTS.payments.base, { appointmentId, currency });
  }

  getById(id: string): Observable<ApiResponse<PaymentResponseDto>> {
    return this.http.get<ApiResponse<PaymentResponseDto>>(API_ENDPOINTS.payments.byId(id));
  }

  getByAppointment(appointmentId: string): Observable<ApiResponse<PaymentResponseDto>> {
    return this.http.get<ApiResponse<PaymentResponseDto>>(`${API_ENDPOINTS.payments.base}/appointments/${appointmentId}/payment`);
  }

  getMyPayments(): Observable<ApiResponse<PaymentResponseDto[]>> {
    return this.http.get<ApiResponse<PaymentResponseDto[]>>(`${API_ENDPOINTS.payments.base}/me`);
  }
}
```

**New interface file:** `src/features/payments/contracts/payment.contracts.ts`

```typescript
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
```

---

### 1.3 إنشاء Payment Form Component (Stripe Elements)

**New folder:** `src/features/payments/components/stripe-payment-form/`

**Component:** `StripePaymentForm`
- Inputs: `appointmentId: string`, `amount: number`, `currency: string`
- Outputs: `paymentSuccess: EventEmitter<string>`, `paymentError: EventEmitter<string>`

**Logic:**
1. OnInit: Call `PaymentService.initiate(appointmentId)` → يحصل على `clientSecret`
2. Load Stripe.js مع publishable key من environment
3. اعرض Stripe Elements (بطاقة الائتمان)
4. Handle submit: `stripe.confirmCardPayment(clientSecret, { payment_method: { card: elements.getElement(CardNumberElement) } })`
5. على success: emit `paymentSuccess` مع الـ payment ID
6. على error: emit `paymentError`

**HTML:**
```
@if (!clientSecret) {
  <div class="flex justify-center py-8"><div class="spinner"></div></div>
} @else {
  <div id="card-element" #cardElement></div>
  <div class="text-red-500 text-sm mt-2">{{ errorMessage }}</div>
  <button (click)="pay()" [disabled]="processing"
    class="w-full py-3 px-6 rounded-xl bg-bosla-orange text-white font-bold">
    {{ processing ? 'جاري المعالجة...' : 'إتمام الدفع' }}
  </button>
}
```

---

### 1.4 دمج Stripe مع صفحة الحجز

**File:** `src/features/appointments/pages/book-appointment/book-appointment.ts`

**تحديث `processPayment()`:**

```typescript
async processPayment(): Promise<void> {
  const id = this.store.bookingAppointmentId();
  if (!id) return;
  
  this.isProcessing.set(true);
  this.paymentService.initiate(id).subscribe({
    next: (res) => {
      if (res.data?.clientSecret) {
        this.clientSecret = res.data.clientSecret;
        this.showStripeForm.set(true); // يُظهر StripePaymentForm
      } else {
        // Fallback: mark as paid directly (demo mode)
        this.store.confirmAppointment(id);
      }
    },
    error: () => this.toast.danger('فشل في بدء عملية الدفع'),
    complete: () => this.isProcessing.set(false),
  });
}
```

**File:** `src/features/appointments/pages/book-appointment/book-appointment.html`

**تحديث قسم الدفع:** استبدال الـ button الحالي بـ StripePaymentForm:

```html
@if (showStripeForm()) {
  <app-stripe-payment-form
    [appointmentId]="store.bookingAppointmentId()!"
    [amount]="totalAmount"
    currency="usd"
    (paymentSuccess)="onPaymentSuccess($event)"
    (paymentError)="onPaymentError($event)" />
} @else {
  <button (click)="processPayment()" class="...">
    {{ isProcessing() ? 'جاري التحميل...' : 'إتمام الدفع الآن' }}
  </button>
}
```

---

### 1.5 معالجة نجاح الدفع + Webhook

عند نجاح الدفع من Stripe، الـ webhook (`PaymentsController.ConfirmWebhook`) يتولى:
1. `PaymentIntentSucceeded` → `payment.Complete(externalPaymentId, "stripe")` → `appointment.MarkAsPaid()`
2. `PaymentIntentPaymentFailed` → `payment.MarkAsFailed(reason)`

الفرونت يحتاج فقط:
- بعد `paymentSuccess` من StripePaymentForm → انتظر شوي (2-3 ثواني) لحد ما الـ webhook يشتغل
- ثم استدعي `PaymentService.getByAppointment(appointmentId)` للتأكد إن الحالة `Completed`
- إذا completed → `router.navigate(['/payments/success', paymentId])`
- إذا فشل → اعرض رسالة خطأ



## Phase 2: Payment Pages

### 2.1 ربط My Payments بالـ API

**File:** `src/features/payments/pages/my-payments/my-payments.ts`

**تحديث:**
- استبدال mock data بـ `PaymentService.getMyPayments()`
- أضف isLoading, error handling
- استخدم `@for` بدل `*ngFor`

```typescript
export class MyPayments implements OnInit {
  private paymentService = inject(PaymentService);
  payments = signal<PaymentResponseDto[]>([]);
  isLoading = signal(true);
  
  ngOnInit() {
    this.paymentService.getMyPayments().subscribe({
      next: (res) => this.payments.set(res.data || []),
      error: () => this.toast.danger('فشل في تحميل المدفوعات'),
      complete: () => this.isLoading.set(false),
    });
  }
}
```

---

### 2.2 إنشاء صفحتي Success / Cancel

**New files:**
- `src/features/payments/pages/payment-success/payment-success.ts`
- `src/features/payments/pages/payment-success/payment-success.html`
- `src/features/payments/pages/payment-cancel/payment-cancel.ts`
- `src/features/payments/pages/payment-cancel/payment-cancel.html`

**Payment Success:**
- خذ payment ID من الـ URL
- اعرض أيقونة نجاح ومعلومات الدفع
- زر "العودة للحجوزات" → `/appointments`

**Payment Cancel:**
- رسالة "تم إلغاء عملية الدفع"
- زر "إعادة المحاولة" → يعود لصفحة الحجز

**Routes:**
```typescript
// payments/routes.ts
{ path: 'success', component: PaymentSuccess },
{ path: 'cancel', component: PaymentCancel },
// path: '' -> MyPayments (موجود)
```

---

### 2.3 تحديث Stripe URLs في الإعدادات

**File:** `appsettings.json` — الـ SuccessUrl و CancelUrl لازم تشير للصفحات الجديدة:

```json
"StripeSettings": {
  "SuccessUrl": "http://localhost:4200/payments/success?session_id={CHECKOUT_SESSION_ID}",
  "CancelUrl": "http://localhost:4200/payments/cancel"
}
```

> ملاحظة: الـ `{CHECKOUT_SESSION_ID}` يستبدل في `StripePaymentGateway` (موجود فعلاً في الكود).



## Phase 3: اختبار النظام

### 3.1 اختبار Webhook محلياً

1. شغّل stripe CLI:
```bash
stripe.exe listen --forward-to https://localhost:44397/api/v1/payments/webhook
```
2. الـ CLI يطبع webhook signing secret — حطه في `appsettings.json` → `StripeSettings.WebhookSecret`
3. من Stripe Dashboard أو CLI، اعمل test event:
```bash
stripe.exe trigger payment_intent.succeeded
```

### 3.2 اختبار تدفق الدفع الكامل

1. سجل دخول كمستخدم
2. احجز موعد مع مختص
3. املأ بيانات البطاقة في Stripe Elements (رقم: `4242 4242 4242 4242`, أي تاريخ وأي CVV)
4. اضغط "إتمام الدفع"
5. تأكد من:
   - إنشاء الـ Payment في قاعدة البيانات
   - تحول AppointmentStatus إلى Paid
   - وصول إشعار للمختص "تم إتمام عملية الدفع"
   - ظهور الدفع في صفحة "المعاملات المالية"
   - ظهور الإيرادات في Dashboard المختص

### 3.3 اختبار الاسترداد (Refund)

1. كمسؤول (Admin)، اذهب إلى `/admin/payments`
2. اختر دفع مكتمل
3. اضغط "استرداد" مع سبب
4. تأكد من:
   - تحول PaymentStatus إلى Refunded
   - وصول إشعار "تم إلغاء الموعد واسترداد المبلغ"

---

## ملخص الملفات الجديدة والمعدلة

### ملفات جديدة:
| المسار | الوصف |
|--------|-------|
| `src/features/payments/services/payment.service.ts` | Frontend Payment Service (HTTP) |
| `src/features/payments/contracts/payment.contracts.ts` | Payment DTOs |
| `src/features/payments/components/stripe-payment-form/stripe-payment-form.ts` | Stripe Elements form |
| `src/features/payments/components/stripe-payment-form/stripe-payment-form.html` | Stripe form UI |
| `src/features/payments/pages/payment-success/payment-success.ts` | نجاح الدفع |
| `src/features/payments/pages/payment-success/payment-success.html` | صفحة النجاح |
| `src/features/payments/pages/payment-cancel/payment-cancel.ts` | إلغاء الدفع |
| `src/features/payments/pages/payment-cancel/payment-cancel.html` | صفحة الإلغاء |

### ملفات معدلة:
| المسار | التعديل |
|--------|---------|
| `package.json` | إضافة `@stripe/stripe-js` |
| `src/environments/environment.ts` | إضافة `stripePublishableKey` |
| `src/environments/environment.prod.ts` | إضافة `stripePublishableKey` |
| `src/features/payments/routes.ts` | إضافة routes للـ success/cancel |
| `src/features/payments/pages/my-payments/my-payments.ts` | ربط بالـ API بدل mock |
| `src/features/payments/pages/my-payments/my-payments.html` | تحديث للـ signals |
| `src/features/appointments/pages/book-appointment/book-appointment.ts` | دمج Stripe flow |
| `src/features/appointments/pages/book-appointment/book-appointment.html` | إضافة StripePaymentForm |
| `src/features/appointments/store/appointments.store.ts` | إضافة حالة clientSecret |
| `src/core/constants/api-endpoints.ts` | (موجود بالفعل — لا يحتاج تعديل) |

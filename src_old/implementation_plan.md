# خطة تنفيذ مشروع Frontend (Angular 21) لـ Bosla Platform

## مراجعة الهيكلة المقترحة

الهيكلة المقترحة ممتازة جداً وتتبع أفضل ممارسات **Domain-Driven Design (DDD)** في Angular 21 الحديث، مع الاعتماد الكلي على الـ Standalone Components وتقسيم التطبيق إلى `core`, `shared`, `features`.

### 💡 قرارات تقنية للمشروع (بناءً على المعايير الحديثة):
1. **النسخة (Version)**: سيتم استخدام **Angular 21** بناءً على طلبك.
2. **State Management**: سنعتمد على **Angular Signals الأصلية** (Native Signals) المدمجة لإنشاء Service-based stores خفيفة وسريعة بدلاً من إقحام مكتبات خارجية، نظراً لقوة الـ Signals في الإصدارات الحديثة.
3. **الـ Mappers**: في مجلد الـ `data-access`، سنستخدم دوال Mapper لتحويل الـ `Contracts` (الـ DTOs القادمة من الباك إند) إلى `Models` نظيفة تُستخدم في الواجهات.
4. **الـ Styling**: سنعتمد على **Vanilla CSS** مع نظام Design Tokens قوي (CSS Variables) في `styles.css` لضمان الحصول على هوية بصرية مذهلة ومخصصة بالكامل لـ Bosla (لن نستخدم إطار عمل جاهز للـ CSS لتوفير أقصى قدر من المرونة إلا إذا طلبت ذلك).
5. **النماذج (Forms)**: سنستخدم Typed Reactive Forms الحديثة.

---

> [!IMPORTANT]
> **مطلوب موافقتك للبدء (User Approval Required)**
> هل أنت موافق على هذه القرارات التقنية (Angular 21، Vanilla CSS، Native Signals) لنبدأ فوراً في تنفيذ **المرحلة الأولى** بإنشاء المشروع وبناء الهيكلة الأساسية للمجلدات؟

---

## 🛠️ خطة التنفيذ (Implementation Plan)

سيتم تنفيذ المشروع على مراحل:

### المرحلة الأولى: التأسيس والهيكلة (Foundation & Architecture)
1. إنشاء مشروع Angular 21 جديد (Standalone).
2. بناء الهيكل الأساسي للمجلدات (`core`, `shared`, `features`, `layouts`).
3. إعداد الـ Environments وتجهيز مسارات الـ API للباك إند الحالي (`https://localhost:44397/api/v1`).
4. بناء نظام الـ Design System في CSS (الألوان، الخطوط من Google Fonts، المتغيرات، الـ Animations) ليكون مذهلاً (Rich Aesthetics).
5. إنشاء المكونات الأساسية في `shared/ui` (Buttons, Inputs, Cards).

### المرحلة الثانية: طبقة الـ Core والـ Authentication (الأمان والمصادقة)
1. إنشاء نماذج `ApiResponse`.
2. بناء الـ Interceptors:
   - `auth.interceptor.ts` (لإضافة توكن JWT).
   - `refresh-token.interceptor.ts` (لتجديد الـ Token تلقائياً باستخدام `/auth/refresh`).
   - `error.interceptor.ts` (التعامل مع الأخطاء وتوجيه المستخدم).
3. بناء `auth.service.ts` و `token.service.ts`.
4. إنشاء الـ Guards لمنع الدخول غير المصرح.

### المرحلة الثالثة: ميزة الـ Auth والتخطيطات (Auth Feature & Layouts)
1. بناء الـ Layouts الأساسية (PublicLayout وغيرها).
2. تنفيذ واجهات الـ Auth (Login, Register, Forgot Password, Reset Password, Confirm Email).
3. ربط هذه الشاشات مع الـ Backend وتجربة الـ Flow كاملاً (مع دعم Google Login).

### المرحلة الخامسة: إعادة تصميم الصفحة الرئيسية (Home Page Redesign)

# [الهدف الحالي]
إعادة تصميم الصفحة الرئيسية بالكامل لتتطابق مع هوية وألوان التصميم المرجعي (صورة "نور المملكة") الذي أرسله المستخدم، مع إضافة الأقسام (Sections) المتعددة المطلوبة. بالإضافة إلى توضيح حل مشكلة تسجيل الدخول بواسطة Google.

## User Review Required
> [!IMPORTANT]
> يرجى مراجعة تفاصيل الأقسام والألوان المقتبسة أدناه. هل توافق على هذه الهيكلة لنبدأ في بناء الصفحة؟

## الألوان المستخرجة من التصميم (Color Palette)
بناءً على الصورة، سنقوم بتحديث الألوان في ملف `styles.css` لتكون:
- **الأحمر الداكن (Burgundy/Terracotta)**: كلون أساسي للأزرار والخلفيات البارزة.
- **البيج الرملي (Cream/Beige)**: كلون للخلفية العامة ليعطي طابعاً عربياً وأصيلاً.
- **الأخضر الزيتوني (Olive Green)**: لون ثانوي لبعض البطاقات.
- **البني الذهبي (Warm Gold/Brown)**: لون ثانوي آخر للبطاقات والتفاصيل.
- **البني الداكن جداً (Charcoal/Dark Brown)**: للنصوص والـ Footer.

## الأقسام المقترحة للصفحة الرئيسية (Home Page Sections)
1. **Hero Section**: الاحتفاظ بخلفية الفيديو مع تحديث التدرج اللوني (Gradient Overlay) ليكون دافئاً (Warm)، وتغيير النصوص لتتماشى مع التصميم الجديد.
2. **قسم القصة/الرؤية (About/Story)**: صورة على اليمين (أو اليسار) مع نص وعنوان باللون الأحمر الداكن (مثال: قصة وطن عريق).
3. **نموذج العمل الاستراتيجي**: قسم بنص وسطي بارز.
4. **البطاقات الثلاثية الملونة**: 3 أعمدة بخلفيات صلبة (أحمر داكن، ذهبي، أخضر زيتوني) تحتوي على نصوص بيضاء.
5. **أهداف المشروع الرئيسية**: شبكة (Grid) تحتوي على 4 بطاقات، كل بطاقة بها صورة وعنوان.
6. **شركاء النجاح والإحصائيات**: قسم يعرض أرقاماً وإحصائيات وشعارات للشركاء.
7. **دعوة لاتخاذ إجراء (Call to Action - CTA)**: شريط عريض باللون الأحمر الداكن مع زر "سجل اشتراكك".

---

## 🛠️ حل مشكلة تسجيل الدخول بـ Google (Error 401: invalid_client)
لقد رأيت أنك قمت بإضافة الـ Client ID في الكود، ولكن الخطأ `invalid_client` يظهر لأن إعدادات الـ Client ID في **Google Cloud Console** تفتقد لشيء مهم جداً:
يجب عليك الذهاب إلى لوحة تحكم Google Cloud (حيث أنشأت الـ Client ID) وإضافة الرابط `http://localhost:4200` إلى حقل **Authorized JavaScript origins** (أصول JavaScript المعتمدة). 
*بدون هذه الخطوة، سترفض Google أي طلب تسجيل دخول قادم من الـ Localhost الخاص بك لأسباب أمنية.*

#### التعديلات المطلوبة في الكود للتصميم الجديد:
#### [MODIFY] [styles.css](file:///q:/.Net_task/BosaFrontend/src/styles.css) (لتحديث الألوان)
#### [MODIFY] [home.html](file:///q:/.Net_task/BosaFrontend/src/app/features/home/pages/home/home.html) (لبناء الأقسام الجديدة)
#### [MODIFY] [main-layout.html](file:///q:/.Net_task/BosaFrontend/src/app/layouts/main-layout/main-layout.html) (لتحديث ألوان شريط التنقل)

# 🚀 Bosla API Reference Guide

هذا الملف يحتوي على مرجع شامل لجميع الـ Endpoints الموجودة في الـ Backend (نسخة `v1`). يمكنك استخدامه كمرجع أثناء العمل على الـ Frontend دون الحاجة للعودة لملفات الـ Backend.

جميع المسارات (Routes) تبدأ بـ: `https://localhost:7082/api/v1` (أو حسب بورت السيرفر الخاص بك).

---

## 🔑 1. المصادقة (Authentication) - `AuthController`
المسؤول عن تسجيل الدخول، إنشاء الحسابات، وإدارة الجلسات وكلمات المرور.

| المسار (Endpoint) | الطريقة (Method) | الوظيفة | الملاحظات (Body/Params) |
|---|---|---|---|
| `/auth/register` | `POST` | إنشاء حساب جديد (مستخدم أو متخصص) | يرسل `RegisterRequest` (الاسم، الإيميل، الباسورد، الدور...) |
| `/auth/login` | `POST` | تسجيل الدخول | يرسل `LoginRequest` (الإيميل، الباسورد)، يستقبل Token |
| `/auth/refresh` | `POST` | تجديد التوكن | يرسل `RefreshTokenRequest` |
| `/auth/logout` | `POST` | تسجيل الخروج | يرسل طلب خروج لإنهاء الجلسة |
| `/auth/forgot-password` | `POST` | طلب استعادة كلمة المرور | يرسل الإيميل |
| `/auth/reset-password` | `POST` | إعادة تعيين كلمة المرور | يرسل الباسورد الجديد مع الكود |

---

## 👤 2. المستخدمون والملف الشخصي (Users) - `UsersController`
إدارة بيانات المستخدم العادي (العميل/المستفيد) وتعديل ملفه الشخصي. (يحتاج Authentication Token).

| المسار (Endpoint) | الطريقة (Method) | الوظيفة |
|---|---|---|
| `/users/me` | `GET` | عرض بيانات الملف الشخصي الخاص بي |
| `/users/me` | `PUT` | تحديث بيانات الملف الشخصي الأساسية |
| `/users/me/password` | `PUT` | تغيير كلمة المرور |
| `/users/me/profile-picture` | `POST` | رفع/تحديث الصورة الشخصية (يستقبل `IFormFile`) |
| `/users/me/education` | `GET` | عرض بيانات التعليم (الجامعات/الدرجات العلمية) |
| `/users/me/education` | `POST` | إضافة سجل تعليمي جديد |
| `/users/me/education/{id}` | `PUT` | تعديل سجل تعليمي محدد |
| `/users/me/education/{id}` | `DELETE` | حذف سجل تعليمي |
| `/users/me/social-links` | `GET` | عرض روابط السوشيال ميديا الخاصة بي |
| `/users/me/social-links` | `POST` | إضافة رابط سوشيال ميديا (LinkedIn, Twitter, الخ) |
| `/users/me/social-links/{id}` | `DELETE` | حذف رابط سوشيال ميديا |
| `/users/{id}` | `GET` | جلب الملف الشخصي لمستخدم معين (متاح للجميع) |

---

## 🌟 3. المتخصصون (Specialists) - `SpecialistsController`
لإدارة حساب المتخصص (Expert)، إعدادات الحجز، التقييمات، والأرباح.

| المسار (Endpoint) | الطريقة (Method) | الوظيفة |
|---|---|---|
| `/specialists/onboard` | `POST` | استكمال بيانات المتخصص (Onboarding) |
| `/specialists/me` | `GET` | جلب ملف المتخصص الخاص بي |
| `/specialists/me` | `PUT` | تعديل ملف المتخصص |
| `/specialists/me/availability` | `GET` | عرض مواعيد العمل المتاحة لي |
| `/specialists/me/availability` | `POST` | إضافة ميعاد متاح (Time Slot) |
| `/specialists/me/availability/{id}` | `DELETE` | حذف ميعاد |
| `/specialists/me/expertise` | `POST` | إضافة مجال خبرة |
| `/specialists/me/expertise/{id}` | `DELETE` | حذف مجال خبرة |
| `/specialists/me/skills` | `POST` | إضافة مهارة (Skill) |
| `/specialists/me/skills/{id}` | `DELETE` | حذف مهارة |
| `/specialists/me/tools` | `POST` | إضافة أداة (Tool) |
| `/specialists/me/tools/{id}` | `DELETE` | حذف أداة |
| `/specialists/me/experience` | `POST` | إضافة خبرة عمل (Experience) |
| `/specialists/me/experience/{id}` | `PUT` | تعديل خبرة عمل |
| `/specialists/me/experience/{id}` | `DELETE` | حذف خبرة عمل |
| `/specialists/me/earnings` | `GET` | جلب تفاصيل الأرباح والمحفظة |
| `/specialists/me/booking-policy` | `PUT` | تعديل سياسة الحجز |
| `/specialists/me/cancellation-policy` | `PUT` | تعديل سياسة الإلغاء |
| `/specialists` | `GET` | تصفح وبحث في قائمة المتخصصين (مع فلاتر البحث) |
| `/specialists/{id}` | `GET` | جلب بروفايل متخصص معين للزوار (Public Profile) |
| `/specialists/{id}/availability` | `GET` | عرض مواعيد المتخصص المتاحة للحجز للزوار |
| `/specialists/{id}/reviews` | `GET` | جلب التقييمات والمراجعات لمتخصص معين |

---

## 📅 4. الحجوزات والمواعيد (Appointments) - `AppointmentsController`
لإدارة الجلسات الاستشارية (للمستخدم والمتخصص).

| المسار (Endpoint) | الطريقة (Method) | الوظيفة |
|---|---|---|
| `/appointments/me` | `GET` | جلب كل الحجوزات الخاصة بي (كمستخدم أو كمتخصص) |
| `/appointments/{id}` | `GET` | تفاصيل حجز معين |
| `/appointments` | `POST` | طلب حجز جديد (من قبل العميل) |
| `/appointments/{id}/cancel` | `POST` | إلغاء حجز |
| `/appointments/{id}/accept` | `POST` | قبول الحجز (من قبل المتخصص) |
| `/appointments/{id}/reject` | `POST` | رفض الحجز (من قبل المتخصص) |
| `/appointments/{id}/complete`| `POST` | تحديد الحجز كـ "مكتمل" |
| `/appointments/{id}/review` | `POST` | إضافة تقييم ومراجعة للحجز بعد الانتهاء |

---

## 💬 5. المحادثات والرسائل (Conversations & Messages)
المحادثات النصية بين العميل والمتخصص.

| المسار (Endpoint) | الطريقة (Method) | الوظيفة |
|---|---|---|
| `/conversations` | `POST` | بدء محادثة جديدة |
| `/conversations` | `GET` | جلب قائمة المحادثات الخاصة بي |
| `/conversations/{id}` | `GET` | جلب تفاصيل محادثة محددة |
| `/conversations/{id}/messages` | `GET` | جلب جميع رسائل المحادثة (History) |
| `/conversations/{id}/messages` | `POST` | إرسال رسالة جديدة (نص أو ملف) |
| `/conversations/{id}/messages/{msgId}`| `PUT` | تعديل رسالة مرسلة |
| `/conversations/{id}/messages/{msgId}`| `DELETE`| حذف رسالة مرسلة |

---

## 📹 6. جلسات الفيديو (Video Sessions) - `VideoSessionsController`
لإدارة مكالمات الفيديو عبر منصة (Agora).

| المسار (Endpoint) | الطريقة (Method) | الوظيفة |
|---|---|---|
| `/video-sessions/{id}` | `GET` | جلب تفاصيل جلسة الفيديو |
| `/video-sessions/generate-token`| `POST` | توليد Token للدخول لغرفة الفيديو |
| `/video-sessions/{id}/join` | `POST` | تسجيل دخول/انضمام للغرفة |
| `/video-sessions/{id}/start` | `POST` | بدء الجلسة (من المتخصص) |
| `/video-sessions/{id}/end` | `POST` | إنهاء جلسة الفيديو |

---

## 💳 7. المدفوعات (Payments) - `PaymentsController`
معالجة الدفع عبر Stripe.

| المسار (Endpoint) | الطريقة (Method) | الوظيفة |
|---|---|---|
| `/payments` | `POST` | إنشاء جلسة دفع (Checkout Session) لحجز معين |
| `/payments/{id}` | `GET` | التحقق من حالة الدفع |
| `/payments/appointments/{id}/payment` | `GET` | جلب بيانات فاتورة أو تفاصيل دفع لحجز |
| `/payments/webhook` | `POST` | Webhook مخصص لـ Stripe لتأكيد الدفع بالخلفية |

---

## 🔔 8. الإشعارات (Notifications) - `NotificationsController`
التنبيهات (Real-time).

| المسار (Endpoint) | الطريقة (Method) | الوظيفة |
|---|---|---|
| `/notifications` | `GET` | جلب الإشعارات الخاصة بي |
| `/notifications/{id}/read` | `PUT` | تعليم إشعار معين كمقروء |
| `/notifications/read` | `PUT` | تعليم كل الإشعارات كمقروءة (Mark all as read) |

---

## 📚 9. القوائم المرجعية (Lookup) - `LookupController`
لجلب البيانات الثابتة للقوائم المنسدلة (Dropdowns) والمقترحات أثناء تعبئة الفورمز.

| المسار (Endpoint) | الطريقة (Method) | الوظيفة |
|---|---|---|
| `/lookup/expertise` | `GET` | جلب قائمة مجالات الخبرة (للـ Select) |
| `/lookup/industries` | `GET` | جلب قائمة الصناعات (Industries) |
| `/lookup/skills` | `GET` | جلب قائمة المهارات (Skills) |
| `/lookup/tools` | `GET` | جلب قائمة الأدوات (Tools/Software) |

---

## 🤖 10. البحث بالذكاء الاصطناعي (AI) - `AiController`
للبحث الدلالي المتقدم والمطابقة (Matching).

| المسار (Endpoint) | الطريقة (Method) | الوظيفة |
|---|---|---|
| `/ai/search` | `GET` | بحث متقدم عن متخصصين باستخدام الذكاء الاصطناعي (أوصاف طبيعية) |
| `/ai/match` | `POST` | إيجاد متخصصين مطابقين لمتطلبات مشروع أو طلب محدد |

---

> **ملاحظات هامة للـ Frontend:**
> 1. أي مسار يحتوي على `{id}` معناه أنك تحتاج لتمرير الـ Guid الخاص بالعنصر في الـ URL.
> 2. جميع مسارات `POST` و `PUT` تتطلب تمرير البيانات بصيغة JSON داخل الـ Body، ما عدا `/users/me/profile-picture` يحتاج إلى `FormData` (لأنه ملف).
> 3. لرفع صورة البروفايل، المتغير في الـ FormData يجب أن يكون اسمه `file`.
> 4. مسارات `me` تقوم بجلب البيانات بناءً على الـ Token الخاص بالمستخدم المسجل حالياً (لا تحتاج لـ UserId).

# Bosla Frontend - Complete Application Map

> **Framework:** Angular (Zoneless Change Detection)
> **Base API URL:** `https://localhost:44397/api/v1`
> **SignalR Hub URL:** `https://10.189.240.81:7275`

---

## 1. Application Routes

### 1.1 Public Layout — `/` (guest + authenticated)

| Path | Component | Guards |
|------|-----------|--------|
| `/` | `Home` | - |
| `/test` | `TestComponents` | - |
| `/specialists` | `SpecialistListPage` | - |
| `/specialists/:id` | `SpecialistDetailsPage` | - |
| `/auth/login` | `Login` | `guestGuard` |
| `/auth/register` | `Register` | `guestGuard` |
| `/auth/forgot-password` | `ForgotPassword` | `guestGuard` |
| `/auth/reset-password` | `ResetPassword` | `guestGuard` |
| `/auth/verify-email` | `VerifyEmail` | - |
| `/auth/check-email` | `CheckEmail` | - |
| `/profile` | `ProfilePage` | `authGuard` |
| `/appointments` | `AppointmentList` | `authGuard` |
| `/appointments/book` | `BookAppointment` | `authGuard` |
| `/appointments/:id` | `AppointmentDetail` | `authGuard` |
| `/payments` | `MyPayments` | `authGuard` |
| `/chat` | `MessagingPage` | `authGuard` |
| `/chat/:id` | `MessagingPage` | `authGuard` |
| `/video/:id` | `VideoRoom` | `authGuard` |
| `/notifications` | `NotificationsList` | `authGuard` |
| `/about` | `AboutPage` | - |
| `/contact` | `ContactPage` | - |
| `/become-specialist` | `SpecialistOnboardingPage` | `authGuard`, `nonSpecialistGuard` |
| `/unauthorized` | `Unauthorized` | - |
| `/**` | `NotFound` | - |

### 1.2 Specialist Layout — `/specialist` [authGuard, specialistGuard]

| Path | Component |
|------|-----------|
| `/specialist` | → redirect to `/specialist/dashboard` |
| `/specialist/dashboard` | `SpecialistDashboard` |
| `/specialist/profile` | `ProfilePage` |
| `/specialist/onboarding` | `SpecialistOnboardingPage` |
| `/specialist/appointments` | `SpecialistAppointments` |
| `/specialist/availability` | `SpecialistAvailability` |
| `/specialist/chat` | `MessagingPage` |
| `/specialist/chat/:id` | `MessagingPage` |
| `/specialist/video/:id` | `VideoRoom` |

### 1.3 Admin Layout — `/admin` [authGuard, adminGuard]

| Path | Component | Title |
|------|-----------|-------|
| `/admin` | → redirect to `/admin/dashboard` | - |
| `/admin/dashboard` | `AdminDashboard` | - |
| `/admin/users` | `AdminUsersList` | إدارة المستخدمين |
| `/admin/users/create` | `AdminUserCreate` | إضافة مستخدم |
| `/admin/users/:id` | `AdminUserDetail` | تفاصيل المستخدم |
| `/admin/users/:id/edit` | `AdminUserEdit` | تعديل المستخدم |
| `/admin/specialists` | `AdminSpecialistsList` | إدارة المتخصصين |
| `/admin/specialists/:id` | `AdminSpecialistDetail` | تفاصيل المتخصص |
| `/admin/appointments` | `AdminAppointmentsList` | إدارة الحجوزات |
| `/admin/appointments/:id` | `AdminAppointmentDetail` | تفاصيل الحجز |
| `/admin/lookups` | `AdminLookups` | إدارة البيانات الأساسية |

---

## 2. Guards

| Guard | Logic |
|-------|-------|
| `authGuard` | Redirects unauthenticated → `/auth/login?returnUrl=...` |
| `guestGuard` | Redirects authenticated → role-based default (`/`, `/specialist/dashboard`, `/admin/dashboard`) |
| `adminGuard` | Allows only `Admin` role, else → `/unauthorized` |
| `specialistGuard` | Allows only `Specialist` role, else → `/unauthorized` |
| `nonSpecialistGuard` | Blocks specialists (redirects to `/specialist/dashboard`) |

---

## 3. Interceptors (order: auth → error → refreshToken → loading)

| Interceptor | Behavior |
|-------------|----------|
| `authInterceptor` | Attaches `Authorization: Bearer <token>` to all requests except public paths |
| `errorInterceptor` | Catches errors; on 403 → `/unauthorized`; normalizes to `ApiError` format |
| `refreshTokenInterceptor` | On 401 → attempts token refresh; queues concurrent 401s; on fail → clear session |
| `loadingInterceptor` | Tracks active requests count for loading state; skips with `X-Skip-Loading` header |

---

## 4. Services & API Endpoints

### 4.1 AuthService

| Method | HTTP | Endpoint |
|--------|------|----------|
| `login(payload)` | POST | `/auth/login` |
| `register(payload)` | POST | `/auth/register` |
| `googleLogin(payload)` | POST | `/auth/google-login` |
| `forgotPassword(payload)` | POST | `/auth/forgot-password` |
| `resetPassword(payload)` | POST | `/auth/reset-password` |
| `confirmEmail(payload)` | POST | `/auth/confirm-email` |
| `resendConfirmationEmail(payload)` | POST | `/auth/resend-confirmation-email` |
| `refreshToken()` | POST | `/auth/refresh` |
| `logout()` | POST | `/auth/logout` |

### 4.2 UserProfileService

| Method | HTTP | Endpoint |
|--------|------|----------|
| `getProfile()` | GET | `/users/me` |
| `updateProfile(request)` | PUT | `/users/me` |
| `changePassword(request)` | PUT | `/users/me/password` |
| `setPassword(request)` | POST | `/users/me/set-password` |
| `getEducation()` | GET | `/users/me/education` |
| `addEducation(request)` | POST | `/users/me/education` |
| `updateEducation(id, request)` | PUT | `/users/me/education/{id}` |
| `deleteEducation(id)` | DELETE | `/users/me/education/{id}` |
| `getSocialLinks()` | GET | `/users/me/social-links` |
| `addSocialLink(request)` | POST | `/users/me/social-links` |
| `deleteSocialLink(id)` | DELETE | `/users/me/social-links/{id}` |
| `uploadProfileImage(file)` | POST | `/users/me/profile-picture` |

### 4.3 AppointmentService

| Method | HTTP | Endpoint |
|--------|------|----------|
| `create(request)` | POST | `/Appointments` |
| `getById(id)` | GET | `/Appointments/{id}` |
| `getMyAppointments()` | GET | `/Appointments/my-appointments` |
| `getAppointmentsBySpecialist(specialistId)` | GET | `/appointments/specialist/{specialistId}` |
| `getUpcomingAppointments()` | GET | `/appointments/upcoming` |
| `getStatusHistory(id)` | GET | `/appointments/{id}/history` |
| `confirm(id)` | PUT | `/appointments/{id}/confirm` |
| `cancel(id, request)` | PUT | `/appointments/{id}/cancel` |
| `reschedule(id, request)` | PUT | `/appointments/{id}/reschedule` |
| `complete(id)` | PUT | `/appointments/{id}/complete` |
| `reject(id, request)` | PUT | `/appointments/{id}/reject` |
| `updateNotes(id, request)` | PATCH | `/appointments/{id}/notes` |
| `addReview(id, request)` | POST | `/appointments/{id}/reviews` |
| `getReminders(id)` | GET | `/appointments/{id}/reminders` |
| `addReminder(id, request)` | POST | `/appointments/{id}/reminders` |
| `deleteReminder(id, reminderId)` | DELETE | `/appointments/{id}/reminders/{reminderId}` |

### 4.4 SpecialistService (public)

| Method | HTTP | Endpoint |
|--------|------|----------|
| `getSpecialists(filters)` | GET | `/specialists` |
| `getSpecialistById(id)` | GET | `/specialists/{id}` |
| `getReviews(id, page, pageSize)` | GET | `/specialists/{id}/reviews` |
| `getAvailability(id)` | GET | `/specialists/{id}/availability` |

### 4.5 SpecialistsApiService (own/specialist panel)

| Method | HTTP | Endpoint |
|--------|------|----------|
| `getMyProfile()` | GET | `/specialists/me` |
| `getDashboard()` | GET | `/specialists/me/dashboard` |
| `getMyEarnings()` | GET | `/specialists/me/earnings` |
| `getMyReviews(page, pageSize)` | GET | `/specialists/me/reviews` |
| `onboard(request)` | POST | `/specialists/onboard` |
| `addAvailabilities(request)` | POST | `/specialists/me/availability` |
| `deleteAvailability(id)` | DELETE | `/specialists/me/availability/{id}` |
| `addExpertise(expertiseId)` | POST | `/specialists/me/expertise` |
| `addSkills(request)` | POST | `/specialists/me/skills` |
| `removeSkill(id)` | DELETE | `/specialists/me/skills/{id}` |
| `addTools(request)` | POST | `/specialists/me/tools` |
| `removeTool(id)` | DELETE | `/specialists/me/tools/{id}` |
| `addExperiences(request)` | POST | `/specialists/me/experience` |
| `removeExperience(id)` | DELETE | `/specialists/me/experience/{id}` |
| `getMyExperience()` | GET | `/specialists/me/experience` |
| `getMyAvailability()` | GET | `/specialists/me/availability` |
| `getMySkills()` | GET | `/specialists/me/skills` |
| `getMyTools()` | GET | `/specialists/me/tools` |

### 4.6 ConversationService

| Method | HTTP | Endpoint |
|--------|------|----------|
| `getConversations(page, pageSize)` | GET | `/conversations` |
| `getConversationById(conversationId)` | GET | `/conversations/{id}` |
| `createConversation(appointmentId)` | POST | `/conversations` |

### 4.7 MessageService

| Method | HTTP | Endpoint |
|--------|------|----------|
| `getMessages(conversationId, page, pageSize)` | GET | `/conversations/{id}/messages` |
| `sendMessage(conversationId, messageText)` | POST | `/conversations/{id}/messages` |
| `editMessage(conversationId, messageId, messageText)` | PUT | `/conversations/{id}/messages/{mid}` |
| `deleteMessage(conversationId, messageId)` | DELETE | `/conversations/{id}/messages/{mid}` |

### 4.8 VideoSessionService

| Method | HTTP | Endpoint |
|--------|------|----------|
| `getSession(sessionId)` | GET | `/video-sessions/{id}` |
| `generateToken(appointmentId)` | POST | `/video-sessions/generate-token` |
| `startSession(sessionId)` | POST | `/video-sessions/{id}/start` |
| `endSession(sessionId)` | POST | `/video-sessions/{id}/end` |

### 4.9 NotificationsService

| Method | HTTP | Endpoint |
|--------|------|----------|
| `getNotifications()` | GET | `/notifications` |
| `getUnreadCount()` | GET | `/notifications/unread-count` |
| `markAsRead(id)` | PUT | `/notifications/{id}/read` |
| `markAllAsRead()` | PUT | `/notifications/read` |

### 4.10 LookupService

| Method | HTTP | Endpoint |
|--------|------|----------|
| `getExpertise()` | GET | `/lookup/expertise` |
| `getIndustries()` | GET | `/lookup/industries` |
| `getSkills()` | GET | `/lookup/skills` |
| `getTools()` | GET | `/lookup/tools` |

### 4.11 ContactService

| Method | HTTP | Endpoint |
|--------|------|----------|
| `sendMessage(data)` | POST | `/contact` |

### 4.12 AdminService

| Method | HTTP | Endpoint |
|--------|------|----------|
| `getDashboardStats()` | GET | `/admin/dashboard` |
| `getUsers(params)` | GET | `/admin/users` |
| `getUserDetail(id)` | GET | `/admin/users/{id}` |
| `createUser(payload)` | POST | `/admin/users` |
| `updateUser(id, payload)` | PUT | `/admin/users/{id}` |
| `deactivateUser(id)` | POST | `/admin/users/{id}/deactivate` |
| `reactivateUser(id)` | POST | `/admin/users/{id}/reactivate` |
| `updateUserRoles(id, roles)` | PUT | `/admin/users/{id}/roles` |
| `getAllSpecialists(params)` | GET | `/admin/specialists` |
| `getPendingSpecialists(params)` | GET | `/admin/specialists/pending` |
| `getSpecialistDetail(id)` | GET | `/admin/specialists/{id}` |
| `verifySpecialist(id, payload)` | POST | `/admin/specialists/{id}/verify` |
| `updateSpecialistStatus(id, status)` | PUT | `/admin/specialists/{id}/status` |
| `getAppointments(params)` | GET | `/admin/appointments` |
| `getAppointmentDetail(id)` | GET | `/admin/appointments/{id}` |
| `cancelAppointment(id, reason)` | POST | `/admin/appointments/{id}/cancel` |
| `confirmAppointment(id)` | POST | `/admin/appointments/{id}/confirm` |
| `completeAppointment(id)` | POST | `/admin/appointments/{id}/complete` |
| `getExpertiseList()` | GET | `/admin/expertise` |
| `createExpertise(name)` | POST | `/admin/expertise` |
| `updateExpertise(id, name)` | PUT | `/admin/expertise/{id}` |
| `deleteExpertise(id)` | DELETE | `/admin/expertise/{id}` |
| `getSkillList()` | GET | `/admin/skills` |
| `createSkill(name)` | POST | `/admin/skills` |
| `updateSkill(id, name)` | PUT | `/admin/skills/{id}` |
| `deleteSkill(id)` | DELETE | `/admin/skills/{id}` |
| `getToolList()` | GET | `/admin/tools` |
| `createTool(name)` | POST | `/admin/tools` |
| `updateTool(id, name)` | PUT | `/admin/tools/{id}` |
| `deleteTool(id)` | DELETE | `/admin/tools/{id}` |
| `getAuditLogs(params)` | GET | `/admin/audit-logs` |
| `getEmbeddingsStatus()` | GET | `/admin/ai/embeddings` |
| `rebuildEmbeddings()` | POST | `/admin/ai/embeddings/rebuild` |

---

## 5. SignalR Services

| Service | Hub | Methods |
|---------|-----|---------|
| `SignalrService` | `/hubs/notifications`, `/hubs/chat` | Connect/disconnect, join/leave groups |
| `ChatSignalrService` | `/hubs/chat` | Send/receive messages, typing indicators |

---

## 6. Stores (State Management)

| Store | Source File |
|-------|-------------|
| `auth.store.ts` | Auth state (current user, tokens) |
| `appointments.store.ts` | Appointments CRUD state |
| `chat.store.ts` | Chat messages & conversations |
| `specialists.store.ts` | Specialist list & filters |
| `specialist-onboarding.store.ts` | Onboarding wizard state |
| `specialist-list.store.ts` | Specialist list filters/pagination |
| `specialist-details.store.ts` | Specialist detail page state |

---

## 7. Core Infrastructure

### Constants

| File | Contents |
|------|----------|
| `api-endpoints.ts` | All endpoint URL templates by domain |
| `permissions.ts` | `manage:specialists`, `manage:users`, `manage:appointments`, `manage:payments`, `view:audit-logs`, `manage:ai-settings` |
| `roles.ts` | `User`, `Specialist`, `Admin` |
| `storage-keys.ts` | `bosla_access_token`, `bosla_refresh_token`, `bosla_current_user`, `bosla_theme`, `bosla_language` |

### Enums

| Enum | Values |
|------|--------|
| `UserRole` | `User=0`, `Specialist=1`, `Admin=2` |
| `AppointmentStatus` | `Pending=0`, `Confirmed=1`, `Completed=2`, `Cancelled=3`, `Rescheduled=4` |
| `NotificationType` | `Message=0`, `Booking=1`, `Reminder=2`, `SpecialistVerification=3` |
| `PaymentStatus` | `Pending=0`, `Completed=1`, `Failed=2`, `Refunded=3` |

### App Config

| Property | Value |
|----------|-------|
| `defaultPageSize` | 10 |
| `maxPageSize` | 50 |
| `searchDebounceMs` | 400ms |
| `toastDurationMs` | 4000ms |
| `maxFileUploadSizeMb` | 10MB |
| `accessTokenExpiryMinutes` | 15 |
| `refreshTokenExpiryDays` | 7 |

### Default Redirect by Role

| Role | Redirect To |
|------|-------------|
| `User` | `/` |
| `Specialist` | `/specialist/dashboard` |
| `Admin` | `/admin/dashboard` |

---

## 8. Feature Modules (14 total)

| Feature | Key Pages | Services |
|---------|-----------|----------|
| **auth** | Login, Register, Forgot/Reset Password, Verify/Check Email | `AuthService` |
| **users/profile** | Profile Page | `UserProfileService` |
| **specialists** | Specialist List, Details, Dashboard, Onboarding, Availability | `SpecialistService`, `SpecialistsApiService` |
| **appointments** | Appointment List, Book, Detail | `AppointmentService` |
| **payments** | My Payments | (inline) |
| **communications** | Messaging (Chat) | `ConversationService`, `MessageService` |
| **video** | Video Room | `VideoSessionService` |
| **notifications** | Notifications List | `NotificationsService` |
| **lookup** | (used across onboarding/filters) | `LookupService` |
| **admin** | Dashboard, Users, Specialists, Appointments, Lookups | `AdminService` |
| **contact** | Contact Page | `ContactService` |
| **about** | About Page | - |
| **home** | Home, Test Components | - |
| **ai** | (API only, no pages yet) | (API endpoints exist) |

---

## 9. Shared UI Components (34)

`avatar`, `badge`, `breadcrumbs`, `button`, `checkbox`, `dashboard-activity-card`, `dashboard-stat-card`, `domain-icon`, `drawer`, `dropdown`, `empty-state`, `empty-state-card`, `expert-card`, `global-loader`, `input`, `interactive-rating`, `kpi-card-skeleton`, `loading-skeleton`, `logo`, `modal`, `multi-select-filter`, `pagination`, `rating-summary`, `review-card`, `select`, `spinner`, `stat-card`, `status-badge`, `table-row-skeleton`, `tabs`, `textarea`, `time-slot`, `time-slots-picker`, `toast`

---

**Total: ~130 API endpoints consumed, ~25 frontend routes, 14 feature modules, 12 services, 4 interceptors.**

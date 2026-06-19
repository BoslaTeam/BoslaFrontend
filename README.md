# Bosla Frontend

Bosla is a professional consultation platform that connects users with verified specialists across multiple fields such as technology, business, engineering, healthcare, and career development. The platform enables users to discover experts, schedule consultations, communicate through real-time chat, attend video sessions, and receive AI-powered specialist recommendations.

---

## Features

### Authentication & User Management
- User registration and login
- JWT-based authentication
- Role-based authorization
- Profile management
- Education management
- Social links management

### Specialist Management
- Specialist onboarding
- Professional profile management
- Experience management
- Skills, tools, and expertise management
- Availability scheduling
- Booking and cancellation policies

### Appointment System
- Create appointments
- Reschedule appointments
- Cancel appointments
- Appointment status tracking
- Session reminders

### Communication
- Real-time chat
- Conversation management
- Message history
- Video consultation sessions

### Payments
- Session payment processing
- Payment status tracking
- Earnings management for specialists

### Reviews & Ratings
- Specialist reviews
- Session ratings
- Feedback management

### Notifications
- Real-time notifications
- Booking updates
- Message alerts
- Session reminders

### AI Features
- Smart specialist recommendations
- AI-powered search
- Consultation summaries
- Search history

---

## Technology Stack

### Core
- Angular 20+
- TypeScript
- RxJS
- Angular Router
- Angular Forms

### UI & Styling
- Tailwind CSS
- Angular CDK

### State Management
- Signals
- RxJS Stores

### Networking
- HttpClient
- Functional Interceptors

### Development Tools
- ESLint
- Prettier
- Angular CLI

---

## Project Architecture

The frontend follows a **Feature-Based Modular Architecture** designed for scalability, maintainability, and clear separation of concerns.

```text
src/
│
├── app/
│   ├── app.config.ts                      # Providers, Interceptors, Hydration, Global Configuration
│   ├── app.routes.ts                      # Root Routes + Lazy Loading
│   └── app.component.ts                   # Root Component
│
├── core/                                  # Application-wide infrastructure
│   │
│   ├── config/
│   │   ├── api.config.ts                  # API base urls and endpoints configuration
│   │   ├── auth.config.ts                 # Authentication settings
│   │   └── app.config.ts                  # General application constants
│   │
│   ├── constants/
│   │   ├── api-endpoints.ts               # Centralized API routes
│   │   ├── storage-keys.ts                # LocalStorage/SessionStorage keys
│   │   ├── roles.ts                       # User roles
│   │   └── permissions.ts                 # Permissions constants
│   │
│   ├── enums/
│   │   ├── user-role.enum.ts              # User roles enum
│   │   ├── appointment-status.enum.ts     # Appointment statuses
│   │   ├── payment-status.enum.ts         # Payment statuses
│   │   └── notification-type.enum.ts      # Notification types
│   │
│   ├── guards/
│   │   ├── auth.guard.ts                  # Protected routes
│   │   ├── guest.guard.ts                 # Prevent authenticated users
│   │   ├── admin.guard.ts                 # Admin-only routes
│   │   └── specialist.guard.ts            # Specialist-only routes
│   │
│   ├── interceptors/
│   │   ├── auth.interceptor.ts            # JWT injection
│   │   ├── error.interceptor.ts           # Global API error handling
│   │   ├── loading.interceptor.ts         # Global loading state
│   │   └── refresh-token.interceptor.ts   # Token refresh flow
│   │
│   ├── services/
│   │   ├── auth.service.ts                # Authentication state management
│   │   ├── token.service.ts               # Access/Refresh token handling
│   │   ├── storage.service.ts             # Browser storage wrapper
│   │   ├── notification.service.ts        # Background notifications
│   │   ├── signalr.service.ts             # SignalR connection wrapper
│   │   ├── agora.service.ts               # Agora SDK wrapper
│   │   └── theme.service.ts               # Theme switching (future)
│   │
│   ├── tokens/
│   │   ├── api.token.ts                   # Injection Tokens
│   │   └── storage.token.ts               # Storage Injection Tokens
│   │
│   ├── models/
│   │   ├── api-response.model.ts          # Generic API response
│   │   ├── paginated-response.model.ts    # Pagination response
│   │   └── pagination.model.ts            # Pagination request
│   │
│   └── utils/
│       ├── date.util.ts                   # Date helpers
│       ├── validation.util.ts             # Common validators
│       ├── file.util.ts                   # File helpers
│       └── string.util.ts                 # String helpers
│
├── shared/                                # Reusable presentation layer
│   │
│   ├── components/
│   │   ├── page-header/                   # Shared page header
│   │   ├── search-box/                    # Search input component
│   │   ├── confirm-dialog/                # Confirmation dialog
│   │   ├── file-upload/                   # File uploader
│   │   ├── rating-stars/                  # Rating component
│   │   └── breadcrumb/                    # Breadcrumb navigation
│   │
│   ├── directives/
│   │   ├── click-outside.directive.ts     # Detect clicks outside
│   │   ├── debounce.directive.ts          # Input debounce
│   │   └── autofocus.directive.ts         # Auto focus
│   │
│   ├── pipes/
│   │   ├── time-ago.pipe.ts               # Time ago formatting
│   │   ├── truncate.pipe.ts               # Text truncation
│   │   └── safe-url.pipe.ts               # Safe iframe/video urls
│   │
│   ├── types/
│   │   ├── nullable.type.ts               # Nullable<T>
│   │   ├── api-error.type.ts              # API error contracts
│   │   └── select-option.type.ts          # Dropdown option type
│   │
│   └── ui/                                # Design System Components
│       ├── button/
│       ├── input/
│       ├── textarea/
│       ├── select/
│       ├── checkbox/
│       ├── modal/
│       ├── drawer/
│       ├── spinner/
│       ├── skeleton/
│       ├── empty-state/
│       ├── avatar/
│       ├── badge/
│       ├── card/
│       ├── table/
│       ├── pagination/
│       ├── tabs/
│       └── toast/
│
├── layouts/
│   │
│   ├── public-layout/
│   │   ├── public-layout.component.ts     # Landing pages layout
│   │   ├── public-header.component.ts     # Public header
│   │   └── public-footer.component.ts     # Public footer
│   │
│   ├── user-layout/
│   │   ├── user-layout.component.ts       # User dashboard layout
│   │   ├── user-sidebar.component.ts      # User navigation
│   │   └── user-header.component.ts       # User header
│   │
│   ├── specialist-layout/
│   │   ├── specialist-layout.component.ts # Specialist dashboard layout
│   │   ├── specialist-sidebar.component.ts
│   │   └── specialist-header.component.ts
│   │
│   └── admin-layout/
│       ├── admin-layout.component.ts      # Admin dashboard layout
│       ├── admin-sidebar.component.ts
│       └── admin-header.component.ts
│
├── features/
│   │
│   ├── auth/
│   │   ├── pages/
│   │   │   ├── login/
│   │   │   ├── register/
│   │   │   ├── forgot-password/
│   │   │   └── reset-password/
│   │   │
│   │   ├── components/
│   │   │   └── otp-form/
│   │   │
│   │   ├── contracts/
│   │   │   ├── login-request.ts
│   │   │   ├── register-request.ts
│   │   │   └── auth-response.ts
│   │   │
│   │   ├── data-access/
│   │   │   ├── auth-api.service.ts
│   │   │   ├── auth.mapper.ts
│   │   │   └── auth.repository.ts
│   │   │
│   │   ├── models/
│   │   │   └── current-user.model.ts
│   │   │
│   │   ├── store/
│   │   │   └── auth.store.ts
│   │   │
│   │   └── routes.ts
│   │
│   ├── users/
│   │   ├── pages/
│   │   │   ├── profile/
│   │   │   ├── education/
│   │   │   └── social-links/
│   │   │
│   │   ├── components/
│   │   ├── contracts/
│   │   ├── data-access/
│   │   ├── models/
│   │   ├── store/
│   │   └── routes.ts
│   │
│   ├── specialists/
│   │   ├── pages/
│   │   │   ├── specialist-list/
│   │   │   ├── specialist-details/
│   │   │   ├── specialist-profile/
│   │   │   ├── availability/
│   │   │   └── experience/
│   │   │
│   │   ├── components/
│   │   │   ├── specialist-card/
│   │   │   ├── review-list/
│   │   │   ├── availability-calendar/
│   │   │   └── specialist-filters/
│   │   │
│   │   ├── contracts/
│   │   │   ├── specialist-response.ts
│   │   │   ├── specialist-request.ts
│   │   │   ├── availability-response.ts
│   │   │   └── experience-response.ts
│   │   │
│   │   ├── data-access/
│   │   │   ├── specialist-api.service.ts
│   │   │   ├── lookup-api.service.ts
│   │   │   ├── specialist.mapper.ts
│   │   │   └── specialist.repository.ts
│   │   │
│   │   ├── models/
│   │   │   ├── specialist.model.ts
│   │   │   ├── availability.model.ts
│   │   │   └── experience.model.ts
│   │   │
│   │   ├── store/
│   │   │   └── specialists.store.ts
│   │   │
│   │   └── routes.ts
│   │
│   ├── appointments/
│   │   ├── pages/
│   │   │   ├── appointments-list/
│   │   │   ├── appointment-details/
│   │   │   └── create-appointment/
│   │   │
│   │   ├── components/
│   │   ├── contracts/
│   │   ├── data-access/
│   │   ├── models/
│   │   ├── store/
│   │   └── routes.ts
│   │
│   ├── payments/
│   │   ├── pages/
│   │   │   ├── checkout/
│   │   │   ├── payment-history/
│   │   │   └── payment-success/
│   │   │
│   │   ├── components/
│   │   ├── contracts/
│   │   ├── data-access/
│   │   ├── models/
│   │   └── routes.ts
│   │
│   ├── chat/
│   │   ├── pages/
│   │   │   ├── conversations/
│   │   │   └── chat-room/
│   │   │
│   │   ├── components/
│   │   │   ├── chat-input/
│   │   │   ├── message-bubble/
│   │   │   └── conversation-list/
│   │   │
│   │   ├── contracts/
│   │   ├── data-access/
│   │   ├── models/
│   │   ├── store/
│   │   └── routes.ts
│   │
│   ├── video/
│   │   ├── pages/
│   │   │   └── call-room/
│   │   │
│   │   ├── components/
│   │   │   ├── video-controls/
│   │   │   ├── participant-tile/
│   │   │   └── screen-share-view/
│   │   │
│   │   ├── contracts/
│   │   ├── data-access/
│   │   ├── models/
│   │   └── routes.ts
│   │
│   ├── notifications/
│   │   ├── pages/
│   │   │   └── notification-center/
│   │   │
│   │   ├── components/
│   │   ├── contracts/
│   │   ├── data-access/
│   │   ├── models/
│   │   ├── store/
│   │   └── routes.ts
│   │
│   ├── ai/
│   │   ├── pages/
│   │   │   ├── smart-search/
│   │   │   └── search-history/
│   │   │
│   │   ├── components/
│   │   ├── contracts/
│   │   ├── data-access/
│   │   ├── models/
│   │   ├── store/
│   │   └── routes.ts
│   │
│   └── admin/
│       ├── pages/
│       │   ├── dashboard/
│       │   ├── specialists-approval/
│       │   ├── users-management/
│       │   ├── payments-management/
│       │   ├── audit-logs/
│       │   └── ai-monitoring/
│       │
│       ├── components/
│       ├── contracts/
│       ├── data-access/
│       ├── models/
│       ├── store/
│       └── routes.ts
│
└── environments/
    ├── environment.ts               # Development configuration
    └── environment.prod.ts          # Production configuration
```

--- 

## Main Modules

### Auth Module

Responsible for:
- Login
- Registration
- Logout
- Route protection
- Token management
- User Module

### User Module

Responsible for:
- User profile
- Education
- Social links
- Account settings
- Specialists Module

### Specialists Module

Responsible for:
- Specialist listing
- Specialist profile
- Availability
- Experience
- Skills and expertise
- Appointments Module

### Appointments Module

Responsible for:
- Booking sessions
- Appointment management
- Session tracking
- Chat Module

### Chat Module

Responsible for:
- Conversations
- Messages
- Real-time communication
- Video Sessions Module

### Video Sessions Module

Responsible for:
- Video consultations
- Session joining
- Session details
- Payments Module

### Payments Module

Responsible for:
- Payment processing
- Transaction history
- Earnings dashboard
- Notifications Module

### Notifications Module
Responsible for:
- Notification center
- Read/unread status
- Real-time updates
- AI Module

### AI Module

Responsible for:
- Smart search
- Specialist recommendations
- AI-generated summaries

---

## Routing Strategy

The application uses:
- Lazy Loading for feature modules
- Route Guards for authentication and authorization
- Resolver support when required
- Standalone Components

Example:
{
  path: 'specialists',
  loadChildren: () =>
    import('./features/specialists/specialists.routes')
      .then(m => m.SPECIALISTS_ROUTES)
}

---

## Environment Configuration

Create the following files:
src/environments/
├── environment.ts
└── environment.development.ts

Example:
export const environment = {
  production: false,
  apiUrl: 'https://api.bosla.com/api/v1'
};

---

## Getting Started

### Prerequisites
- Node.js 22+
- npm 10+
- Angular CLI 20+

### Installation

git clone <repository-url>
cd bosla-frontend
npm install

### Run Development Server

ng serve
Application will be available at:
http://localhost:4200

### Build Production
ng build

### Run Tests
ng test

### Lint
ng lint

---

## API Integration

The frontend communicates with the Bosla Backend API through a dedicated API layer.


### Authentication Endpoints

POST /api/v1/auth/register
POST /api/v1/auth/login
POST /api/v1/auth/refresh
POST /api/v1/auth/logout

### Specialists Endpoints

GET    /api/v1/specialists
GET    /api/v1/specialists/{id}
POST   /api/v1/specialists/onboard
PUT    /api/v1/specialists/me

### Appointments Endpoints

GET    /api/v1/appointments
POST   /api/v1/appointments
POST   /api/v1/appointments/{id}/confirm
POST   /api/v1/appointments/{id}/cancel

### Payments Endpoints

POST /api/v1/payments
GET  /api/v1/payments/{id}

---

## Security
- JWT Authentication
- Route Guards
- HTTP Interceptors
- Role-Based Access Control (RBAC)
- Secure Token Storage
- API Request Validation

---

## Performance Optimizations
- Lazy Loaded Features
- Route-Level Code Splitting
- OnPush Change Detection
- Signals-Based State Management
- HTTP Request Caching
- Optimized Bundle Size

---

## Future Enhancements
- Mobile Application
- Push Notifications
- Session Recording
- Group Consultations
- Advanced Analytics Dashboard
- AI Career Assistant
- File Sharing System

---

## Project Goals

Bosla aims to provide a scalable, modern, and intelligent platform that helps users connect with professionals, receive personalized guidance, and make informed career and professional decisions through real-time communication and AI-powered recommendations.

---

## License

This project is developed as part of the Bosla Platform ecosystem.
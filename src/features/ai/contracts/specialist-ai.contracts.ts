// Specialist AI Feature Contracts
// Matches BoslaPlatform.Service/Interfaces/AI/ISpecialistAiService.cs DTOs

// ─── Smart Replies ────────────────────────────────────────────────────────────

export interface SmartRepliesRequest {
  conversationId: string;
}

export interface SmartRepliesResponse {
  replies: string[];
}

// ─── Session Prep ─────────────────────────────────────────────────────────────

export interface PastAppointmentDto {
  date: string; // ISO date
  topic: string | null;
  summary: string | null;
}

export interface SessionPrepDto {
  clientName: string;
  clientTitle: string | null;
  appointmentTopic: string;
  appointmentTime: string;
  pastAppointments: PastAppointmentDto[];
  conversationPreview: string | null;
  existingSummaryBrief: string | null;
  aiBrief: string | null;
}

// ─── Dashboard Insights ───────────────────────────────────────────────────────

export interface PendingActionDto {
  appointmentId: string;
  clientName: string;
  action: string;
  time: string;
}

export interface DashboardInsightsDto {
  todaySummary: string;
  upcomingSummary: string;
  pendingActions: PendingActionDto[];
  aiTip: string | null;
  statsBrief: string | null;
}

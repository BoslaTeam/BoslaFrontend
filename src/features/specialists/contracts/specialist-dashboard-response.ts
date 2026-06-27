export interface MonthlyRevenue {
  month: string;
  amount: number;
}

export interface UpcomingAppointment {
  appointmentId: string;
  clientId: string;
  clientName: string;
  serviceName: string;
  startTimeUtc: string;
  status: string;
}

export interface SpecialistDashboardResponse {
  monthlyEarnings: number;
  earningsGrowthPercentage: number;
  upcomingAppointments: number;
  completedAppointments: number;
  averageRating: number;
  totalReviews: number;
  monthlyRevenue: MonthlyRevenue[];
  upcomingAppointmentsList: UpcomingAppointment[];
  upcomingAppointmentsGrowthPercentage: number;
completedAppointmentsGrowthPercentage: number;
averageRatingGrowthPercentage: number;
}
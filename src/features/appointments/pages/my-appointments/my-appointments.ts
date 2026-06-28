import { Component, OnInit, inject, signal } from '@angular/core';
import { CommonModule, DatePipe } from '@angular/common';
import { AppointmentsService } from '../../services/appointments.service';
import { AppointmentDto, AppointmentStatus } from '../../contracts/appointments.contracts';

@Component({
  selector: 'app-my-appointments',
  standalone: true,
  imports: [CommonModule, DatePipe],
  templateUrl: './my-appointments.html',
  styleUrl: './my-appointments.css'
})
export class MyAppointments implements OnInit {
  private appointmentsService = inject(AppointmentsService);

  appointments = signal<AppointmentDto[]>([]);
  isLoading = signal(true);
  AppointmentStatus = AppointmentStatus;
  
  ngOnInit() {
    this.loadAppointments();
  }

  loadAppointments() {
    this.isLoading.set(true);
    this.appointmentsService.getMyAppointments().subscribe({
      next: (res) => {
        this.appointments.set(res.data.items);
        this.isLoading.set(false);
      },
      error: (err) => {
        console.error('Error loading appointments', err);
        this.isLoading.set(false);
      }
    });
  }

  cancelAppointment(id: string) {
    if (confirm('هل أنت متأكد من رغبتك في إلغاء هذا الحجز؟')) {
      this.appointmentsService.cancelAppointment(id).subscribe({
        next: () => {
          alert('تم إلغاء الحجز بنجاح');
          this.loadAppointments();
        },
        error: (err) => {
          alert('حدث خطأ أثناء الإلغاء');
        }
      });
    }
  }

  getStatusText(status: AppointmentStatus): string {
    switch (status) {
      case AppointmentStatus.Pending: return 'قيد الانتظار';
      case AppointmentStatus.Confirmed: return 'مؤكد';
      case AppointmentStatus.Completed: return 'مكتمل';
      case AppointmentStatus.Cancelled: return 'ملغى';
      case AppointmentStatus.Rejected: return 'مرفوض';
      default: return 'غير معروف';
    }
  }

  getStatusClass(status: AppointmentStatus): string {
    switch (status) {
      case AppointmentStatus.Pending: return 'bg-yellow-100 text-yellow-800';
      case AppointmentStatus.Confirmed: return 'bg-green-100 text-green-800';
      case AppointmentStatus.Completed: return 'bg-blue-100 text-blue-800';
      case AppointmentStatus.Cancelled: 
      case AppointmentStatus.Rejected: return 'bg-red-100 text-red-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  }
}

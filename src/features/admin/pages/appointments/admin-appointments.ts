import { Component, OnInit, inject, signal, computed } from '@angular/core';
import { CommonModule } from '@angular/common';
import { AdminService } from '../../services/admin.service';
import { AdminAppointmentDto } from '../../contracts/admin.contracts';
import { ToastService } from '@core/services/toast.service';
import { UiSpinner } from '@shared/ui/spinner/spinner';
import { AppointmentStatus } from '@core/enums/appointment-status.enum';

@Component({
  selector: 'app-admin-appointments',
  standalone: true,
  imports: [CommonModule, UiSpinner],
  templateUrl: './admin-appointments.html',
})
export class AdminAppointments implements OnInit {
  private readonly adminService = inject(AdminService);
  private readonly toast = inject(ToastService);

  readonly appointments = signal<AdminAppointmentDto[]>([]);
  readonly isLoading = signal(false);
  readonly activeFilter = signal<number | null>(null);
  readonly currentPage = signal(1);
  readonly totalCount = signal(0);
  readonly pageSize = 10;

  readonly filterTabs = [
    { label: 'الكل', value: null },
    { label: 'قيد الانتظار', value: AppointmentStatus.Pending },
    { label: 'مؤكد', value: AppointmentStatus.Confirmed },
    { label: 'مكتمل', value: AppointmentStatus.Completed },
    { label: 'ملغي', value: AppointmentStatus.Cancelled },
  ];

  readonly statusLabels: Record<number, string> = {
    [AppointmentStatus.Pending]: 'قيد الانتظار',
    [AppointmentStatus.Confirmed]: 'مؤكد',
    [AppointmentStatus.Completed]: 'مكتمل',
    [AppointmentStatus.Cancelled]: 'ملغي',
  };

  readonly statusClasses: Record<number, string> = {
    [AppointmentStatus.Pending]: 'bg-amber-500/10 text-amber-600 border-amber-500/20',
    [AppointmentStatus.Confirmed]: 'bg-emerald-500/10 text-emerald-600 border-emerald-500/20',
    [AppointmentStatus.Completed]: 'bg-bosla-blue/10 text-bosla-blue border-bosla-blue/20',
    [AppointmentStatus.Cancelled]: 'bg-rose-500/10 text-rose-500 border-rose-500/20',
  };

  readonly totalPages = computed(() => Math.ceil(this.totalCount() / this.pageSize));

  ngOnInit(): void {
    this.loadAppointments();
  }

  loadAppointments(): void {
    this.isLoading.set(true);
    const params: any = { page: this.currentPage(), pageSize: this.pageSize };
    if (this.activeFilter() !== null) params.status = this.activeFilter()!;

    this.adminService.getAppointments(params).subscribe({
      next: (res) => {
        this.appointments.set(res.data?.items ?? []);
        this.totalCount.set(res.data?.metadata?.totalCount ?? 0);
        this.isLoading.set(false);
      },
      error: () => {
        this.toast.danger('فشل في تحميل الحجوزات');
        this.isLoading.set(false);
      },
    });
  }

  setFilter(status: number | null): void {
    this.activeFilter.set(status);
    this.currentPage.set(1);
    this.loadAppointments();
  }

  goToPage(page: number): void {
    if (page < 1 || page > this.totalPages()) return;
    this.currentPage.set(page);
    this.loadAppointments();
  }
}

import { Injectable, inject, signal, computed } from '@angular/core';
import { AppointmentService } from '../services/appointments.service';
import { 
  AppointmentDto, 
  CreateAppointmentRequest, 
  CancelAppointmentRequest, 
  RescheduleAppointmentRequest,
  RejectAppointmentRequest,
  UpdateAppointmentNotesRequest,
  AddReviewRequest,
  AddReminderRequest,
  ReminderDto,
  AppointmentStatusHistoryDto
} from '../contracts/appointments.contracts';
import { ToastService } from '@core/services/toast.service';
import { finalize } from 'rxjs';

export interface AppointmentsState {
  items: AppointmentDto[];
  upcomingItems: AppointmentDto[];
  specialistItems: AppointmentDto[];
  selectedItem: AppointmentDto | null;
  selectedItemHistory: AppointmentStatusHistoryDto[]; 
  selectedItemReminders: ReminderDto[];
  isLoading: boolean;
  isActionLoading: boolean;
  error: string | null;
}

@Injectable({
  providedIn: 'root'
})
export class AppointmentsStore {
  private readonly appointmentService = inject(AppointmentService);
  private readonly toast = inject(ToastService);

  private readonly _state = signal<AppointmentsState>({
    items: [],
    upcomingItems: [],
    specialistItems: [],
    selectedItem: null,
    selectedItemHistory: [],
    selectedItemReminders: [],
    isLoading: false,
    isActionLoading: false,
    error: null
  });


  readonly items = computed(() => this._state().items);
  readonly upcomingItems = computed(() => this._state().upcomingItems);
  readonly specialistItems = computed(() => this._state().specialistItems);
  readonly selectedItem = computed(() => this._state().selectedItem);
  readonly selectedItemHistory = computed(() => this._state().selectedItemHistory);
  readonly selectedItemReminders = computed(() => this._state().selectedItemReminders);
  readonly isLoading = computed(() => this._state().isLoading);
  readonly isActionLoading = computed(() => this._state().isActionLoading);
  readonly error = computed(() => this._state().error);


  loadMyAppointments(): void {
    this.updateState({ isLoading: true, error: null });
    this.appointmentService.getMyAppointments()
      .pipe(finalize(() => this.updateState({ isLoading: false })))
      .subscribe({
        next: (items) => this.updateState({ items : items.data }),
        error: (err) => this.handleError(err, 'فشل في تحميل مواعيدك.')
      });
  }

 
  loadUpcomingAppointments(): void {
    this.updateState({ isLoading: true, error: null });
    this.appointmentService.getUpcomingAppointments()
      .pipe(finalize(() => this.updateState({ isLoading: false })))
      .subscribe({
        next: (upcomingItems) => this.updateState({ upcomingItems: upcomingItems.data }),
        error: (err) => this.handleError(err, 'فشل في تحميل المواعيد القادمة.')
      });
  }


  loadSpecialistAppointments(specialistId: string): void {
    this.updateState({ isLoading: true, error: null });
    this.appointmentService.getAppointmentsBySpecialist(specialistId)
      .pipe(finalize(() => this.updateState({ isLoading: false })))
      .subscribe({
        next: (specialistItems) => this.updateState({ specialistItems : specialistItems.data}),
        error: (err) => this.handleError(err, 'فشل في تحميل مواعيد المختص.')
      });
  }


  loadAppointmentDetails(id: string): void {
    this.updateState({ isLoading: true, error: null, selectedItem: null, selectedItemHistory: [], selectedItemReminders: [] });
    

    this.appointmentService.getById(id)
      .pipe(finalize(() => this.updateState({ isLoading: false })))
      .subscribe({
        next: (selectedItem) => {
          this.updateState({ selectedItem : selectedItem.data});
          
          this.loadStatusHistory(id);
          this.loadReminders(id);
        },
        error: (err) => this.handleError(err, 'فشل في تحميل تفاصيل الموعد.')
      });
  }


  createAppointment(request: CreateAppointmentRequest, onSuccess?: () => void): void {
    this.updateState({ isActionLoading: true, error: null });
    this.appointmentService.create(request)
      .pipe(finalize(() => this.updateState({ isActionLoading: false })))
      .subscribe({
        next: () => {
          this.toast.success('تم حجز الموعد بنجاح.');
          this.loadMyAppointments();
          if (onSuccess) onSuccess();
        },
        error: (err) => this.handleError(err, 'فشل في إتمام عملية حجز الموعد.')
      });
  }


  confirmAppointment(id: string): void {
    this.updateState({ isActionLoading: true });
    this.appointmentService.confirm(id)
      .pipe(finalize(() => this.updateState({ isActionLoading: false })))
      .subscribe({
        next: () => {
          this.toast.success('تم تأكيد الموعد بنجاح.');
          this.refreshAfterAction(id);
        },
        error: (err) => this.handleError(err, 'فشل في تأكيد الموعد.')
      });
  }

  cancelAppointment(id: string, request: CancelAppointmentRequest): void {
    this.updateState({ isActionLoading: true });
    this.appointmentService.cancel(id, request)
      .pipe(finalize(() => this.updateState({ isActionLoading: false })))
      .subscribe({
        next: () => {
          this.toast.success('تم إلغاء الموعد.');
          this.refreshAfterAction(id);
        },
        error: (err) => this.handleError(err, 'فشل في إلغاء الموعد.')
      });
  }

  rejectAppointment(id: string, request: RejectAppointmentRequest): void {
    this.updateState({ isActionLoading: true });
    this.appointmentService.reject(id, request)
      .pipe(finalize(() => this.updateState({ isActionLoading: false })))
      .subscribe({
        next: () => {
          this.toast.success('تم رفض طلب الموعد.');
          this.refreshAfterAction(id);
        },
        error: (err) => this.handleError(err, 'فشل في رفض الموعد.')
      });
  }

  completeAppointment(id: string): void {
    this.updateState({ isActionLoading: true });
    this.appointmentService.complete(id)
      .pipe(finalize(() => this.updateState({ isActionLoading: false })))
      .subscribe({
        next: () => {
          this.toast.success('تم إتمام الجلسة بنجاح.');
          this.refreshAfterAction(id);
        },
        error: (err) => this.handleError(err, 'فشل في تحديث حالة الجلسة إلى مكتملة.')
      });
  }

  rescheduleAppointment(id: string, request: RescheduleAppointmentRequest): void {
    this.updateState({ isActionLoading: true });
    this.appointmentService.reschedule(id, request)
      .pipe(finalize(() => this.updateState({ isActionLoading: false })))
      .subscribe({
        next: () => {
          this.toast.success('تم إعادة جدولة الموعد بنجاح.');
          this.refreshAfterAction(id);
        },
        error: (err) => this.handleError(err, 'فشل في إعادة جدولة الموعد.')
      });
  }

  updateNotes(id: string, request: UpdateAppointmentNotesRequest): void {
    this.updateState({ isActionLoading: true });
    this.appointmentService.updateNotes(id, request)
      .pipe(finalize(() => this.updateState({ isActionLoading: false })))
      .subscribe({
        next: () => {
          this.toast.success('تم تحديث الملاحظات بنجاح.');
          if (this._state().selectedItem?.id === id) {
            this.updateState({ selectedItem: { ...this._state().selectedItem!, notes: request.notes } });
          }
        },
        error: (err) => this.handleError(err, 'فشل في تحديث الملاحظات.')
      });
  }

  addReview(id: string, request: AddReviewRequest, onSuccess?: () => void): void {
    this.updateState({ isActionLoading: true });
    this.appointmentService.addReview(id, request)
      .pipe(finalize(() => this.updateState({ isActionLoading: false })))
      .subscribe({
        next: () => {
          this.toast.success('شكرًا لك، تم إضافة تقييمك بنجاح.');
          if (onSuccess) onSuccess();
        },
        error: (err) => this.handleError(err, 'فشل في إضافة التقييم.')
      });
  }

  addReminder(id: string, request: AddReminderRequest): void {
    this.appointmentService.addReminder(id, request).subscribe({
      next: () => {
        this.toast.success('تم إضافة التذكير بنجاح.');
        this.loadReminders(id); 
      },
      error: (err) => this.handleError(err, 'فشل في إضافة التذكير.')
    });
  }

  deleteReminder(id: string, reminderId: string): void {
    this.appointmentService.deleteReminder(id, reminderId).subscribe({
      next: () => {
        this.toast.success('تم حذف التذكير.');
        this.updateState({
          selectedItemReminders: this._state().selectedItemReminders.filter(r => r.id !== reminderId)
        });
      },
      error: (err) => this.handleError(err, 'فشل في حذف التذكير.')
    });
  }

  private loadStatusHistory(id: string): void {
    this.appointmentService.getStatusHistory(id).subscribe({
      next: (selectedItemHistory) => this.updateState({ selectedItemHistory :selectedItemHistory.data}),
      error: (err) => console.error('History load failed:', err)
    });
  }

  private loadReminders(id: string): void {
    this.appointmentService.getReminders(id).subscribe({
      next: (selectedItemReminders) => this.updateState({ selectedItemReminders }),
      error: (err) => console.error('Reminders load failed:', err)
    });
  }

  private updateState(partialState: Partial<AppointmentsState>): void {
    this._state.update((current) => ({ ...current, ...partialState }));
  }

  private handleError(error: any, defaultMsg: string): void {
    const errorMsg = error?.error?.message || defaultMsg;
    this.updateState({ error: errorMsg });
    this.toast.danger(errorMsg);
  }

  private refreshAfterAction(id: string): void {
    if (this._state().selectedItem?.id === id) {
      this.loadAppointmentDetails(id);
    }
    this.loadMyAppointments();
    this.loadUpcomingAppointments();
  }
}
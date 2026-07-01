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
  AppointmentStatusHistoryDto,
  SpecialistBrief,
  SpecialistFullDetail,
  AvailabilitySlotDto,
} from '../contracts/appointments.contracts';
import { ToastService } from '@core/services/toast.service';
import { finalize, forkJoin } from 'rxjs';
import { SpecialistsApiService } from '@features/specialists/data-access/specialist-api.service';
import { AppointmentStatus } from '@core/enums/appointment-status.enum';

export interface AppointmentsState {
  items: AppointmentDto[];
  upcomingItems: AppointmentDto[];
  specialistItems: AppointmentDto[];
  selectedItem: AppointmentDto | null;
  selectedItemHistory: AppointmentStatusHistoryDto[];
  selectedItemReminders: ReminderDto[];
  isLoading: boolean;
  isActionLoading: boolean;
  isLoadingSpecialist: boolean;
  error: string | null;
  specialistInfo: SpecialistBrief | null;
  selectedSpecialistDetail: SpecialistFullDetail | null;
  availabilitySlots: AvailabilitySlotDto[];
  bookingAppointmentId: string | null;
  bookingStep: 'form' | 'pending_approval' | 'payment' | 'done';
}

@Injectable({
  providedIn: 'root'
})
export class AppointmentsStore {
  private readonly appointmentService = inject(AppointmentService);
  private readonly specialistApi = inject(SpecialistsApiService);
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
    isLoadingSpecialist: false,
    error: null,
    specialistInfo: null,
    selectedSpecialistDetail: null,
    availabilitySlots: [],
    bookingAppointmentId: null,
    bookingStep: 'form',
  });

  readonly items = computed(() => this._state().items);
  readonly upcomingItems = computed(() => this._state().upcomingItems);
  readonly specialistItems = computed(() => this._state().specialistItems);
  readonly selectedItem = computed(() => this._state().selectedItem);
  readonly selectedItemHistory = computed(() => this._state().selectedItemHistory);
  readonly selectedItemReminders = computed(() => this._state().selectedItemReminders);
  readonly isLoading = computed(() => this._state().isLoading);
  readonly isActionLoading = computed(() => this._state().isActionLoading);
  readonly isLoadingSpecialist = computed(() => this._state().isLoadingSpecialist);
  readonly error = computed(() => this._state().error);
  readonly specialistInfo = computed(() => this._state().specialistInfo);
  readonly selectedSpecialistDetail = computed(() => this._state().selectedSpecialistDetail);
  readonly availabilitySlots = computed(() => this._state().availabilitySlots);
  readonly bookingAppointmentId = computed(() => this._state().bookingAppointmentId);
  readonly bookingStep = computed(() => this._state().bookingStep);

  readonly formattedAvailabilitySlots = computed(() => {
    const slots = this._state().availabilitySlots;
    const days = ['الأحد', 'الإثنين', 'الثلاثاء', 'الأربعاء', 'الخميس', 'الجمعة', 'السبت'];
    const shortDays = ['الأحد', 'الإثنين', 'الثلاثاء', 'الأربعاء', 'الخميس', 'الجمعة', 'السبت'];
    const months = ['يناير', 'فبراير', 'مارس', 'أبريل', 'مايو', 'يونيو', 'يوليو', 'أغسطس', 'سبتمبر', 'أكتوبر', 'نوفمبر', 'ديسمبر'];

    const groups: {
      dateStr: string;
      displayDate: string;
      dayNumber: number;
      dayName: string;
      monthName: string;
      availableCount: number;
      slots: { id: string; start: Date; end: Date; timeStr: string; isBooked: boolean }[];
    }[] = [];

    const map = new Map<string, {
      displayDate: string;
      dayNumber: number;
      dayName: string;
      monthName: string;
      slots: { id: string; start: Date; end: Date; timeStr: string; isBooked: boolean }[];
    }>();

    for (const s of slots) {
      const start = new Date(s.start);
      const end = new Date(s.end);
      const key = start.toISOString().split('T')[0];
      const isBooked = s.isBooked ?? false;
      const displayDate = `${days[start.getDay()]}، ${start.getDate()} ${months[start.getMonth()]}`;

      const fmtTime = (d: Date) => {
        const h = d.getHours();
        const m = d.getMinutes().toString().padStart(2, '0');
        return `${h.toString().padStart(2, '0')}:${m}`;
      };

      if (!map.has(key)) {
        map.set(key, {
          displayDate,
          dayNumber: start.getDate(),
          dayName: shortDays[start.getDay()],
          monthName: months[start.getMonth()],
          slots: [],
        });
      }
      map.get(key)!.slots.push({
        id: s.id,
        start,
        end,
        timeStr: `${fmtTime(start)} - ${fmtTime(end)}`,
        isBooked: s.isBooked ?? false,
      });
    }

    for (const [key, val] of map) {
      groups.push({
        dateStr: key,
        ...val,
        availableCount: val.slots.filter(sl => !sl.isBooked).length,
      });
    }

    return groups.sort((a, b) => a.dateStr.localeCompare(b.dateStr));
  });

  loadMyAppointments(): void {
    this.updateState({ isLoading: true, error: null });
    this.appointmentService.getMyAppointments()
      .pipe(finalize(() => this.updateState({ isLoading: false })))
      .subscribe({
        next: (items) => this.updateState({ items: items.data }),
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
        next: (specialistItems) => this.updateState({ specialistItems: specialistItems.data }),
        error: (err) => this.handleError(err, 'فشل في تحميل مواعيد المختص.')
      });
  }

  loadAppointmentDetails(id: string): void {
    this.updateState({ isLoading: true, error: null, selectedItem: null, selectedItemHistory: [], selectedItemReminders: [], selectedSpecialistDetail: null });

    this.appointmentService.getById(id)
      .pipe(finalize(() => this.updateState({ isLoading: false })))
      .subscribe({
        next: (selectedItem) => {
          this.updateState({ selectedItem: selectedItem.data });
          if (selectedItem.data?.specialistId) {
            this.loadSpecialistInfo(selectedItem.data.specialistId);
          }
          this.loadStatusHistory(id);
          this.loadReminders(id);
        },
        error: (err) => this.handleError(err, 'فشل في تحميل تفاصيل الموعد.')
      });
  }

  loadSpecialistInfo(id: string): void {
    this.updateState({ isLoadingSpecialist: true });
    this.specialistApi.getSpecialistById(id).subscribe({
      next: (res) => {
        const d = res.data;
        this.updateState({
          isLoadingSpecialist: false,
          specialistInfo: {
            id: d.id,
            name: d.name,
            title: d.title,
            imageUrl: d.profileImageUrl,
            rating: d.rating,
            hourlyRate: d.hourlyRate,
            reviewsCount: d.reviewsCount,
          },
          selectedSpecialistDetail: {
            id: d.id,
            name: d.name,
            title: d.title,
            imageUrl: d.profileImageUrl,
            rating: d.rating,
            hourlyRate: d.hourlyRate,
            reviewsCount: d.reviewsCount,
            bio: d.bio,
            skills: d.skills,
            isOnline: d.isOnline,
            country: d.country,
          }
        });
      },
      error: () => {
        this.updateState({ isLoadingSpecialist: false });
        this.toast.danger('فشل في تحميل بيانات المختص.');
      }
    });
  }

  loadAvailability(specialistId: string): void {
    forkJoin({
      slots: this.appointmentService.getSpecialistAvailability(specialistId),
      appointments: this.appointmentService.getAppointmentsBySpecialist(specialistId),
    }).subscribe({
      next: ({ slots, appointments }) => {
        const bookedAppointments = appointments.data.filter(
          a => a.status === AppointmentStatus.Pending || a.status === AppointmentStatus.Confirmed
        );

        const availabilitySlots = slots.data.map(slot => {
          const slotStart = new Date(slot.start).getTime();
          const slotEnd = new Date(slot.end).getTime();

          const isBooked = bookedAppointments.some(apt => {
            const aptStart = new Date(apt.start).getTime();
            const aptEnd = new Date(apt.end).getTime();
            return slotStart < aptEnd && slotEnd > aptStart;
          });

          return { ...slot, isBooked };
        });

        this.updateState({ availabilitySlots });
      },
      error: () => this.toast.danger('فشل في تحميل الأوقات المتاحة.')
    });
  }

  createAppointment(request: CreateAppointmentRequest, onSuccess?: (id: string) => void): void {
    this.updateState({ isActionLoading: true, error: null });
    this.appointmentService.create(request)
      .pipe(finalize(() => this.updateState({ isActionLoading: false })))
      .subscribe({
        next: (res) => {
          this.toast.success('تم إرسال طلب الحجز بنجاح. سيتم إشعارك عند موافقة المختص.');
          const appointmentId = res.data;
          this.updateState({ bookingAppointmentId: appointmentId, bookingStep: 'done' });
          if (onSuccess) onSuccess(appointmentId);
        },
        error: (err) => this.handleError(err, 'فشل في إتمام عملية حجز الموعد.')
      });
  }

  checkAppointmentStatus(id: string): void {
    this.updateState({ isActionLoading: true });
    this.appointmentService.getById(id)
      .pipe(finalize(() => this.updateState({ isActionLoading: false })))
      .subscribe({
        next: (res) => {
          if (res.data?.status === AppointmentStatus.Confirmed) {
            this.toast.success('تمت موافقة المختص! يمكنك الآن إتمام الدفع.');
            this.updateState({ bookingStep: 'payment' });
          } else if (res.data?.status === AppointmentStatus.Cancelled) {
            this.toast.danger('تم رفض طلب الموعد من قبل المختص.');
            this.updateState({ bookingAppointmentId: null, bookingStep: 'form' });
          } else {
            this.toast.info('لم يتم الموافقة على الطلب بعد. سيتم إشعارك فور الموافقة.');
          }
        },
        error: (err) => this.handleError(err, 'فشل في التحقق من حالة الموعد.')
      });
  }

  confirmAppointment(id: string): void {
    this.updateState({ isActionLoading: true });
    this.appointmentService.confirm(id)
      .pipe(finalize(() => this.updateState({ isActionLoading: false })))
      .subscribe({
        next: () => {
          this.toast.success('تم تأكيد الموعد وإتمام الدفع بنجاح.');
          this.updateState({ bookingStep: 'done' });
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

  resetBooking(): void {
    this.updateState({
      specialistInfo: null,
      availabilitySlots: [],
      bookingAppointmentId: null,
      bookingStep: 'form',
    });
  }

  private loadStatusHistory(id: string): void {
    this.appointmentService.getStatusHistory(id).subscribe({
      next: (selectedItemHistory) => this.updateState({ selectedItemHistory: selectedItemHistory.data }),
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

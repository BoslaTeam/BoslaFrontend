import { Component, OnInit, inject, signal, computed, effect, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute, Router, RouterLink } from '@angular/router';
import { AppointmentsStore } from '../../store/appointments.store';
import { AppointmentStatus } from '@core/enums/appointment-status.enum';
import { PaymentStatus } from '../../contracts/appointments.contracts';
import { UiButton } from '@shared/ui/button/button';
import { UiSpinner } from '@shared/ui/spinner/spinner';
import { AuthService } from '@core/services/auth.service';
import { UserRole } from '@core/enums/user-role.enum';
@Component({
  selector: 'app-appointment-detail',
  standalone: true,
  imports: [CommonModule, RouterLink, UiButton, UiSpinner],
  templateUrl: './appointment-details.html',
})
export class AppointmentDetail implements OnInit {
  private readonly route = inject(ActivatedRoute);
  private readonly router = inject(Router);
  readonly store = inject(AppointmentsStore);
  readonly authService = inject(AuthService);
  private readonly cdr = inject(ChangeDetectorRef);

  readonly appointmentId = this.route.snapshot.paramMap.get('id') ?? '';

  readonly showCancelModal = signal(false);
  readonly cancelReason = signal('');

  readonly showReviewModal = signal(false);
  readonly reviewRating = signal(0);
  readonly reviewHover = signal(0);
  readonly reviewComment = signal('');

  readonly showReminderModal = signal(false);
  readonly reminderMessage = signal('');
  readonly reminderDate = signal('');
  readonly reminderTime = signal('');

  readonly showRescheduleModal = signal(false);
  readonly rescheduleDate = signal('');
  readonly rescheduleStartTime = signal('');
  readonly rescheduleEndTime = signal('');

  readonly showNotesModal = signal(false);
  readonly editNotesText = signal('');

  readonly showRejectModal = signal(false);
  readonly rejectReason = signal('');

  readonly newConversationId = signal<string | null>(null);

  readonly hasConversation = computed(() => {
    return this.newConversationId() ?? this.store.selectedItem()?.conversationId ?? null;
  });

  readonly userRole = computed(() => this.authService.userRole());
  readonly UserRole = UserRole;
  readonly AppointmentStatus = AppointmentStatus;
  readonly PaymentStatus = PaymentStatus;

  readonly canConfirm = computed(() => {
    const u = this.userRole();
    const s = this.store.selectedItem()?.status;
    return (u === UserRole.Specialist || u === UserRole.Admin) && s === AppointmentStatus.Pending;
  });

  readonly canComplete = computed(() => {
    const u = this.userRole();
    const s = this.store.selectedItem()?.status;
    return (u === UserRole.Specialist || u === UserRole.Admin) && (s === AppointmentStatus.Confirmed || s === AppointmentStatus.Paid);
  });

  readonly canPay = computed(() => {
    const u = this.userRole();
    const s = this.store.selectedItem();
    if (u !== UserRole.User) return false;
    if (s?.status !== AppointmentStatus.Confirmed) return false;
    if (s?.paymentStatus === PaymentStatus.Paid || s?.paymentStatus === PaymentStatus.Refunded) return false;
    return true;
  });

  readonly canCancel = computed(() => {
    const s = this.store.selectedItem()?.status;
    return s === AppointmentStatus.Pending || s === AppointmentStatus.Confirmed;
  });

  readonly canReject = computed(() => {
    const u = this.userRole();
    const s = this.store.selectedItem()?.status;
    return (u === UserRole.Specialist || u === UserRole.Admin) && s === AppointmentStatus.Pending;
  });

  readonly canReschedule = computed(() => {
    const s = this.store.selectedItem()?.status;
    return s === AppointmentStatus.Pending || s === AppointmentStatus.Confirmed;
  });

  readonly canAddReview = computed(() => {
    const u = this.userRole();
    const s = this.store.selectedItem()?.status;
    return u === UserRole.User && s === AppointmentStatus.Completed;
  });

  readonly canEditNotes = computed(() => {
    const u = this.userRole();
    return u === UserRole.Specialist || u === UserRole.Admin;
  });

  readonly canAddReminder = computed(() => {
    const s = this.store.selectedItem()?.status;
    return s === AppointmentStatus.Pending || s === AppointmentStatus.Confirmed;
  });

  readonly tomorrow = computed(() => {
    const d = new Date();
    d.setDate(d.getDate() + 1);
    return d.toISOString().split('T')[0];
  });

  constructor() {
    effect(() => {
      this.store.selectedItem();
      this.store.isLoading();
      this.store.selectedSpecialistDetail();
      this.store.isLoadingSpecialist();
      this.store.isActionLoading();
      this.cdr.detectChanges();
    });
    effect(() => {
      const convId = this.store.lastCreatedConversationId();
      if (convId) {
        this.newConversationId.set(convId);
        this.store.lastCreatedConversationId.set(null);
      }
    });
  }

  ngOnInit(): void {
    if (this.appointmentId) {
      this.store.loadAppointmentDetails(this.appointmentId);
    }
  }

  onConfirm(): void {
    this.store.confirmAppointment(this.appointmentId, (convId) => {
      if (convId) {
        this.newConversationId.set(convId);
      }
    });
  }

  goToConversation(): void {
    const convId = this.hasConversation();
    if (convId) {
      this.router.navigate(['/chat', convId]);
    }
  }

  onComplete(): void {
    this.store.completeAppointment(this.appointmentId);
  }

  onCancelSubmit(): void {
    if (!this.cancelReason().trim()) return;
    this.store.cancelAppointment(this.appointmentId, { reason: this.cancelReason() });
    this.showCancelModal.set(false);
    this.cancelReason.set('');
  }

  onRejectSubmit(): void {
    if (!this.rejectReason().trim()) return;
    this.store.rejectAppointment(this.appointmentId, { reason: this.rejectReason() });
    this.showRejectModal.set(false);
    this.rejectReason.set('');
  }

  onRescheduleSubmit(): void {
    if (!this.rescheduleDate() || !this.rescheduleStartTime() || !this.rescheduleEndTime()) return;
    const newStart = new Date(`${this.rescheduleDate()}T${this.rescheduleStartTime()}`);
    const newEnd = new Date(`${this.rescheduleDate()}T${this.rescheduleEndTime()}`);
    this.store.rescheduleAppointment(this.appointmentId, { newStart, newEnd });
    this.showRescheduleModal.set(false);
    this.rescheduleDate.set('');
    this.rescheduleStartTime.set('');
    this.rescheduleEndTime.set('');
  }

  openNotesModal(): void {
    this.editNotesText.set(this.store.selectedItem()?.notes || '');
    this.showNotesModal.set(true);
  }

  onNotesSubmit(): void {
    this.store.updateNotes(this.appointmentId, { notes: this.editNotesText() });
    this.showNotesModal.set(false);
  }

  onReviewSubmit(): void {
    if (this.reviewRating() === 0) return;
    this.store.addReview(this.appointmentId, {
      rating: this.reviewRating(),
      comment: this.reviewComment().trim() || undefined,
    }, () => {
      this.showReviewModal.set(false);
      this.reviewRating.set(0);
      this.reviewComment.set('');
    });
  }

  onAddReminder(): void {
    if (!this.reminderDate() || !this.reminderTime() || !this.reminderMessage().trim()) return;
    const reminderTime = new Date(`${this.reminderDate()}T${this.reminderTime()}`);
    this.store.addReminder(this.appointmentId, { reminderTime, message: this.reminderMessage() });
    this.showReminderModal.set(false);
    this.reminderDate.set('');
    this.reminderTime.set('');
    this.reminderMessage.set('');
  }

  onDeleteReminder(reminderId: string): void {
    this.store.deleteReminder(this.appointmentId, reminderId);
  }

  getStatusGradient(status: AppointmentStatus | undefined): string {
    switch (status) {
      case AppointmentStatus.Pending: return 'linear-gradient(135deg, #F39C12, #E67E22)';
      case AppointmentStatus.Confirmed: return 'linear-gradient(135deg, #1B4F72, #2E86AB)';
      case AppointmentStatus.Paid: return 'linear-gradient(135deg, #059669, #10B981)';
      case AppointmentStatus.Completed: return 'linear-gradient(135deg, #059669, #10B981)';
      case AppointmentStatus.Cancelled: return 'linear-gradient(135deg, #DC2626, #EF4444)';
      case AppointmentStatus.Rescheduled: return 'linear-gradient(135deg, #7C3AED, #8B5CF6)';
      default: return 'linear-gradient(135deg, #64748B, #94A3B8)';
    }
  }

  getStatusIcon(status: AppointmentStatus | undefined): string {
    switch (status) {
      case AppointmentStatus.Pending: return '<path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />';
      case AppointmentStatus.Confirmed: return '<path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />';
      case AppointmentStatus.Paid: return '<path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />';
      case AppointmentStatus.Completed: return '<path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />';
      case AppointmentStatus.Cancelled: return '<path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12" />';
      default: return '<path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />';
    }
  }

  getStatusLabel(status: AppointmentStatus | undefined) {
    if (status === undefined) return { text: '', classes: '' };
    switch (status) {
      case AppointmentStatus.Pending:
        return {
          text: 'بانتظار موافقة المختص',
          classes: 'bg-amber-500/10 text-amber-600 border-amber-500/20',
        };
      case AppointmentStatus.Confirmed:
        return {
          text: 'قابل للدفع',
          classes: 'bg-emerald-500/10 text-emerald-600 border-emerald-500/20',
        };
      case AppointmentStatus.Paid:
        return {
          text: 'مؤكدة',
          classes: 'bg-emerald-500/10 text-emerald-600 border-emerald-500/20',
        };
      case AppointmentStatus.Completed:
        return { text: 'مكتملة', classes: 'bg-bosla-blue/10 text-bosla-blue border-bosla-blue/20' };
      case AppointmentStatus.Cancelled:
        return { text: 'ملغية', classes: 'bg-rose-500/10 text-rose-500 border-rose-500/20' };
      case AppointmentStatus.Rescheduled:
        return { text: 'مجدولة', classes: 'bg-purple-500/10 text-purple-600 border-purple-500/20' };
      default:
        return { text: 'غير معروف', classes: 'bg-gray-500/10 text-gray-500' };
    }
  }

  getPaymentStatusLabel(status: PaymentStatus | undefined): { text: string; classes: string } {
    switch (status) {
      case PaymentStatus.Unpaid:
        return { text: 'غير مدفوع', classes: 'bg-amber-500/10 text-amber-600 border-amber-500/20' };
      case PaymentStatus.Paid:
        return { text: 'مدفوع', classes: 'bg-emerald-500/10 text-emerald-600 border-emerald-500/20' };
      case PaymentStatus.Refunded:
        return { text: 'مسترجع', classes: 'bg-blue-500/10 text-blue-600 border-blue-500/20' };
      default:
        return { text: 'غير محدد', classes: 'bg-gray-500/10 text-gray-500' };
    }
  }

  getStatusColor(status: AppointmentStatus | undefined): string {
    switch (status) {
      case AppointmentStatus.Pending: return 'text-amber-500';
      case AppointmentStatus.Confirmed: return 'text-emerald-500';
      case AppointmentStatus.Paid: return 'text-emerald-500';
      case AppointmentStatus.Completed: return 'text-bosla-blue';
      case AppointmentStatus.Cancelled: return 'text-rose-500';
      case AppointmentStatus.Rescheduled: return 'text-purple-500';
      default: return 'text-gray-500';
    }
  }

  getStatusDotColor(status: AppointmentStatus | undefined): string {
    switch (status) {
      case AppointmentStatus.Pending: return 'bg-amber-500';
      case AppointmentStatus.Confirmed: return 'bg-emerald-500';
      case AppointmentStatus.Paid: return 'bg-emerald-500';
      case AppointmentStatus.Completed: return 'bg-bosla-blue';
      case AppointmentStatus.Cancelled: return 'bg-rose-500';
      case AppointmentStatus.Rescheduled: return 'bg-purple-500';
      default: return 'bg-gray-500';
    }
  }

  getStatusTimelineLabel(status: AppointmentStatus | undefined): string {
    switch (status) {
      case AppointmentStatus.Pending: return 'تم إنشاء طلب الموعد';
      case AppointmentStatus.Confirmed: return 'تم قبول الموعد من قبل المختص';
      case AppointmentStatus.Paid: return 'تم تأكيد الموعد بعد الدفع';
      case AppointmentStatus.Completed: return 'تم إتمام الجلسة';
      case AppointmentStatus.Cancelled: return 'تم إلغاء الموعد';
      case AppointmentStatus.Rescheduled: return 'تم إعادة جدولة الموعد';
      default: return 'تم تغيير الحالة';
    }
  }
}

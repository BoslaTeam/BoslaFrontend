import {
  Component,
  OnInit,
  OnDestroy,
  inject,
  signal,
  computed,
  effect,
} from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute, Router, RouterLink } from '@angular/router';
import { firstValueFrom } from 'rxjs';
import { AppointmentsStore } from '../../store/appointments.store';
import { AppointmentStatus } from '@core/enums/appointment-status.enum';
import { PaymentStatus } from '../../contracts/appointments.contracts';
import { UiButton } from '@shared/ui/button/button';
import { UiSpinner } from '@shared/ui/spinner/spinner';
import { AuthService } from '@core/services/auth.service';
import { UserRole } from '@core/enums/user-role.enum';
import { VideoSessionService } from '@features/video/services/video-session.service';
import { ToastService } from '@core/services/toast.service';
import { TranslatePipe } from '@shared/pipes/translate.pipe';
import { TranslationService } from '@core/services/translation.service';
@Component({
  selector: 'app-appointment-detail',
  standalone: true,
  imports: [CommonModule, RouterLink, UiButton, UiSpinner, TranslatePipe],
  templateUrl: './appointment-details.html',
  styles: [`
    ui-button.w-full { display: flex; }
    ui-button.w-full button { flex: 1; }
  `],
})
export class AppointmentDetail implements OnInit, OnDestroy {
  private readonly route = inject(ActivatedRoute);
  private readonly router = inject(Router);
  readonly store = inject(AppointmentsStore);
  readonly authService = inject(AuthService);
  private readonly videoSessionService = inject(VideoSessionService);
  private readonly toast = inject(ToastService);
  private readonly translationService = inject(TranslationService);

  readonly direction = computed(() => this.translationService.currentLang() === 'ar' ? 'rtl' : 'ltr');
  readonly Math = Math;
  readonly appointmentId = this.route.snapshot.paramMap.get('id') ?? '';

  readonly showCancelModal = signal(false);
  readonly cancelReason = signal('');

  readonly showReviewModal = signal(false);
  readonly reviewRating = signal(0);
  readonly reviewHover = signal(0);
  readonly reviewComment = signal('');

  readonly showNotesModal = signal(false);
  readonly editNotesText = signal('');

  readonly showRejectModal = signal(false);
  readonly rejectReason = signal('');

  readonly newConversationId = signal<string | null>(null);

  readonly paymentDeadline = computed(() => {
    const item = this.store.selectedItem();
    if (!item?.confirmedAt) return null;
    if (item.status !== AppointmentStatus.Confirmed) return null;
    if (item.paymentStatus === PaymentStatus.Paid || item.paymentStatus === PaymentStatus.Refunded) return null;
    return new Date(item.confirmedAt).getTime() + 21_600_000;
  });

  readonly remainingMs = signal(0);
  private paymentTimerHandle: ReturnType<typeof setInterval> | null = null;

  private stopPaymentTimer(): void {
    if (this.paymentTimerHandle) {
      clearInterval(this.paymentTimerHandle);
      this.paymentTimerHandle = null;
    }
  }

  readonly expandedSections = signal<Set<string>>(new Set(['appointment-info']));
  readonly expandedTimelineItems = signal<Set<number>>(new Set());

  toggleSection(id: string): void {
    this.expandedSections.update(s => {
      const next = new Set(s);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  }

  toggleTimelineItem(index: number): void {
    this.expandedTimelineItems.update(s => {
      const next = new Set(s);
      if (next.has(index)) next.delete(index);
      else next.add(index);
      return next;
    });
  }

  readonly duration = computed(() => {
    const item = this.store.selectedItem();
    if (!item) return '';
    const start = new Date(item.start);
    const end = new Date(item.end);
    const diff = end.getTime() - start.getTime();
    const hours = Math.floor(diff / 3600000);
    const minutes = Math.floor((diff % 3600000) / 60000);
    if (hours > 0) return `${hours} ساعة ${minutes > 0 ? `${minutes} دقيقة` : ''}`;
    return `${minutes} دقيقة`;
  });

  readonly disputeInfo = computed(() => {
    const item = this.store.selectedItem();
    if (!item?.escrowStatus) return null;
    if (item.escrowStatus === 'Held' || item.escrowStatus === 'Released') return null;
    return item;
  });

  readonly hasConversation = computed(() => {
    const item = this.store.selectedItem();
    if (!item) return null;
    if (item.status === AppointmentStatus.Cancelled) return null;
    const deadline = this.paymentDeadline();
    if (deadline && deadline <= Date.now()) return null;
    return this.newConversationId() ?? item.conversationId ?? null;
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
    return (
      (u === UserRole.Specialist || u === UserRole.Admin) &&
      (s === AppointmentStatus.Confirmed || s === AppointmentStatus.Paid)
    );
  });

  readonly canPay = computed(() => {
    const u = this.userRole();
    const s = this.store.selectedItem();
    if (u !== UserRole.User) return false;
    if (s?.status !== AppointmentStatus.Confirmed) return false;
    if (s?.paymentStatus === PaymentStatus.Paid || s?.paymentStatus === PaymentStatus.Refunded)
      return false;
    const deadline = this.paymentDeadline();
    if (deadline && deadline <= Date.now()) return false;
    return true;
  });

  readonly canJoin = computed(() => {
    const u = this.userRole();
    const item = this.store.selectedItem();
    if (u !== UserRole.User) return false;
    if (!item) return false;
    if (item.status === AppointmentStatus.Completed) return false;
    if (item.status === AppointmentStatus.Cancelled) return false;
    if (item.paymentStatus !== PaymentStatus.Paid && item.status !== AppointmentStatus.Paid) return false;
    return true;
  });

  readonly canJoinNow = computed(() => {
    if (!this.canJoin()) return false;
    const item = this.store.selectedItem();
    if (!item) return false;
    const startMs = new Date(item.start).getTime() - 15 * 60 * 1000;
    return Date.now() >= startMs;
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

  readonly canAddReview = computed(() => {
    const u = this.userRole();
    const s = this.store.selectedItem()?.status;
    return u === UserRole.User && s === AppointmentStatus.Completed;
  });

  readonly canEditNotes = computed(() => {
    const u = this.userRole();
    const s = this.store.selectedItem()?.status;
    return u === UserRole.Specialist || u === UserRole.Admin || s === AppointmentStatus.Paid;
  });

  constructor() {
    effect(() => {
      const convId = this.store.lastCreatedConversationId();
      if (convId) {
        this.newConversationId.set(convId);
        this.store.lastCreatedConversationId.set(null);
      }
    });
    effect(() => {
      const deadline = this.paymentDeadline();
      this.stopPaymentTimer();
      if (deadline) {
        this.remainingMs.set(deadline - Date.now());
        this.paymentTimerHandle = setInterval(() => {
          const remaining = deadline - Date.now();
          if (remaining <= 0) {
            this.remainingMs.set(0);
            this.stopPaymentTimer();
            this.store.loadAppointmentDetails(this.appointmentId);
          } else {
            this.remainingMs.set(remaining);
          }
        }, 1000);
      } else {
        this.remainingMs.set(0);
      }
    });
  }

  ngOnInit(): void {
    if (this.appointmentId) {
      this.store.loadAppointmentDetails(this.appointmentId);
    }
  }

  ngOnDestroy(): void {
    this.stopPaymentTimer();
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

  async joinSession(): Promise<void> {
    if (!this.canJoinNow()) {
      this.toast.warning('لا يمكن الانضمام الآن، الميعاد لم يحن بعد');
      return;
    }
    const item = this.store.selectedItem();
    if (!item) return;
    try {
      const res = await firstValueFrom(this.videoSessionService.generateToken(item.id));
      if (res.data?.sessionId) {
        this.router.navigate(['/video', res.data.sessionId]);
      }
    } catch (err) {
      console.error('Failed to join session', err);
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
    this.store.addReview(
      this.appointmentId,
      {
        rating: this.reviewRating(),
        comment: this.reviewComment().trim() || undefined,
      },
      () => {
        this.showReviewModal.set(false);
        this.reviewRating.set(0);
        this.reviewComment.set('');
      },
    );
  }

  formatCountdown(ms: number): string {
    if (ms <= 0) return '0:00:00';
    const totalSec = Math.floor(ms / 1000);
    const hours = Math.floor(totalSec / 3600);
    const min = Math.floor((totalSec % 3600) / 60);
    const sec = totalSec % 60;
    return `${hours}:${min.toString().padStart(2, '0')}:${sec.toString().padStart(2, '0')}`;
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
        return {
          text: 'مدفوع',
          classes: 'bg-emerald-500/10 text-emerald-600 border-emerald-500/20',
        };
      case PaymentStatus.Refunded:
        return { text: 'مسترجع', classes: 'bg-blue-500/10 text-blue-600 border-blue-500/20' };
      default:
        return { text: 'غير محدد', classes: 'bg-gray-500/10 text-gray-500' };
    }
  }

  getEscrowStatusLabel(status: string | undefined): { text: string; classes: string } {
    switch (status) {
      case 'Held':
        return { text: 'معلق', classes: 'bg-amber-500/10 text-amber-600' };
      case 'Released':
        return { text: 'تم الصرف', classes: 'bg-emerald-500/10 text-emerald-600' };
      case 'Disputed':
        return { text: 'في نزاع', classes: 'bg-rose-500/10 text-rose-600' };
      case 'Refunded':
        return { text: 'مسترجع', classes: 'bg-blue-500/10 text-blue-600' };
      default:
        return { text: 'غير محدد', classes: 'bg-gray-500/10 text-gray-500' };
    }
  }

  getStatusColor(status: AppointmentStatus | undefined): string {
    switch (status) {
      case AppointmentStatus.Pending:
        return 'text-amber-500';
      case AppointmentStatus.Confirmed:
        return 'text-emerald-500';
      case AppointmentStatus.Paid:
        return 'text-emerald-500';
      case AppointmentStatus.Completed:
        return 'text-bosla-blue';
      case AppointmentStatus.Cancelled:
        return 'text-rose-500';
      case AppointmentStatus.Rescheduled:
        return 'text-purple-500';
      default:
        return 'text-gray-500';
    }
  }

  getStatusDotColor(status: AppointmentStatus | undefined): string {
    switch (status) {
      case AppointmentStatus.Pending:
        return 'bg-amber-500';
      case AppointmentStatus.Confirmed:
        return 'bg-emerald-500';
      case AppointmentStatus.Paid:
        return 'bg-emerald-500';
      case AppointmentStatus.Completed:
        return 'bg-bosla-blue';
      case AppointmentStatus.Cancelled:
        return 'bg-rose-500';
      case AppointmentStatus.Rescheduled:
        return 'bg-purple-500';
      default:
        return 'bg-gray-500';
    }
  }

  getStatusTimelineLabel(status: AppointmentStatus | undefined): string {
    switch (status) {
      case AppointmentStatus.Pending:
        return 'تم إنشاء طلب الموعد';
      case AppointmentStatus.Confirmed:
        return 'تم قبول الموعد من قبل المختص';
      case AppointmentStatus.Paid:
        return 'تم تأكيد الموعد بعد الدفع';
      case AppointmentStatus.Completed:
        return 'تم إتمام الجلسة';
      case AppointmentStatus.Cancelled:
        return 'تم إلغاء الموعد';
      case AppointmentStatus.Rescheduled:
        return 'تم إعادة جدولة الموعد';
      default:
        return 'تم تغيير الحالة';
    }
  }

  getChangedByLabel(changedBy: string): string {
    if (changedBy === 'System') return 'النظام';
    const currentUserId = this.authService.currentUser()?.id;
    if (currentUserId && changedBy === currentUserId) {
      return this.userRole() === UserRole.User ? 'بواسطتك' : 'بواسطك';
    }
    const role = this.userRole();
    if (role === UserRole.User) return 'المختص';
    if (role === UserRole.Specialist || role === UserRole.Admin) return 'المستخدم';
    return changedBy;
  }

  getTimelineEventIcon(status: AppointmentStatus | undefined): string {
    switch (status) {
      case AppointmentStatus.Pending:
        return 'M13 10V3L4 14h7v7l9-11h-7z';
      case AppointmentStatus.Confirmed:
        return 'M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z';
      case AppointmentStatus.Paid:
        return 'M3 10h18M7 15h1m4 0h1m-7 4h12a3 3 0 003-3V8a3 3 0 00-3-3H6a3 3 0 00-3 3v8a3 3 0 003 3z';
      case AppointmentStatus.Completed:
        return 'M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-6 9l2 2 4-4';
      case AppointmentStatus.Cancelled:
        return 'M6 18L18 6M6 6l12 12';
      case AppointmentStatus.Rescheduled:
        return 'M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15';
      default:
        return 'M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z';
    }
  }
}

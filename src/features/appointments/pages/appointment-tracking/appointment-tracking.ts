import { Component, OnInit, AfterViewInit, inject, computed, effect, ChangeDetectorRef, ElementRef, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute, Router, RouterLink } from '@angular/router';
import { AppointmentsStore } from '../../store/appointments.store';
import { AppointmentStatus } from '@core/enums/appointment-status.enum';
import { PaymentStatus } from '../../contracts/appointments.contracts';
import { UiSpinner } from '@shared/ui/spinner/spinner';

export interface TrackingStep {
  key: string;
  label: string;
  icon: string;
  status: 'completed' | 'current' | 'upcoming';
  date?: string;
}

@Component({
  selector: 'app-appointment-tracking',
  standalone: true,
  imports: [CommonModule, RouterLink, UiSpinner],
  templateUrl: './appointment-tracking.html',
})
export class AppointmentTracking implements OnInit, AfterViewInit {
  private readonly route = inject(ActivatedRoute);
  private readonly router = inject(Router);
  readonly store = inject(AppointmentsStore);
  private readonly cdr = inject(ChangeDetectorRef);
  private readonly el = inject(ElementRef);

  readonly newConversationId = signal<string | null>(null);

  readonly hasConversation = computed(() => {
    return this.newConversationId() ?? this.store.selectedItem()?.conversationId ?? null;
  });

  private readonly appointmentId = this.route.snapshot.paramMap.get('id') ?? '';

  readonly AppointmentStatus = AppointmentStatus;
  readonly PaymentStatus = PaymentStatus;

  readonly trackingSteps = computed<TrackingStep[]>(() => {
    const app = this.store.selectedItem();
    if (!app) return [];

    const status = app.status;
    const paymentStatus = app.paymentStatus;
    const history = this.store.selectedItemHistory();
    const getDate = (s: AppointmentStatus): string | undefined => {
      const h = history.find((x) => x.newStatus === s);
      return h ? h.changedAt : undefined;
    };

    const stepsConfig: { key: string; label: string; icon: string; dateStatus: AppointmentStatus }[] = [
      { key: 'pending',    label: 'تم إرسال الطلب',       icon: 'M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z',  dateStatus: AppointmentStatus.Pending },
      { key: 'confirmed',  label: 'موافقة المختص',        icon: 'M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z',  dateStatus: AppointmentStatus.Confirmed },
      { key: 'payment',    label: 'الدفع',                icon: 'M17 9V7a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2m2 4h10a2 2 0 002-2v-6a2 2 0 00-2-2H9a2 2 0 00-2 2v6a2 2 0 002 2zm7-5a2 2 0 11-4 0 2 2 0 014 0z', dateStatus: AppointmentStatus.Confirmed },
      { key: 'completed',  label: 'اكتمال الجلسة',        icon: 'M5 13l4 4L19 7',                                   dateStatus: AppointmentStatus.Completed },
    ];

    const isDone: boolean[] = [
      status !== AppointmentStatus.Pending,                                                                  // step 0: past pending?
      status === AppointmentStatus.Confirmed || status === AppointmentStatus.Paid || status === AppointmentStatus.Completed, // step 1: specialist approved?
      paymentStatus === PaymentStatus.Paid || status === AppointmentStatus.Paid || status === AppointmentStatus.Completed,   // step 2: payment done?
      status === AppointmentStatus.Completed,                                                                 // step 3: session completed?
    ];

    const doneCount = isDone.filter(Boolean).length;

    const steps: TrackingStep[] = stepsConfig.map((cfg, i) => ({
      key: cfg.key,
      label: cfg.label,
      icon: cfg.icon,
      status: i < doneCount ? 'completed' : i === doneCount ? 'current' : 'upcoming' as 'completed' | 'current' | 'upcoming',
      date: getDate(cfg.dateStatus),
    }));

    return steps;
  });

  readonly isCancelled = computed(() => this.store.selectedItem()?.status === AppointmentStatus.Cancelled);
  readonly cancelReason = computed(() => {
    const history = this.store.selectedItemHistory();
    const cancel = history.find((h) => h.newStatus === AppointmentStatus.Cancelled);
    return cancel?.reason;
  });

  constructor() {
    effect(() => {
      this.store.selectedItem();
      this.store.selectedItemHistory();
      this.store.isLoading();
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

  goToConversation(): void {
    const convId = this.hasConversation();
    if (convId) {
      this.router.navigate(['/chat', convId]);
    }
  }

  ngOnInit(): void {
    if (this.appointmentId) {
      this.store.loadAppointmentDetails(this.appointmentId);
    }
  }

  ngAfterViewInit(): void {
    setTimeout(() => {
      const currentEl = this.el.nativeElement.querySelector('[data-step="current"]');
      if (currentEl) {
        currentEl.scrollIntoView({ behavior: 'smooth', block: 'center' });
      }
    }, 500);
  }

  getStepBorder(step: TrackingStep): string {
    if (step.status === 'completed') return 'border-emerald-500';
    if (step.status === 'current') return 'border-bosla-blue';
    return 'border-bosla-charcoal/10';
  }

  getStepBg(step: TrackingStep): string {
    if (step.status === 'completed') return 'bg-emerald-500 text-white';
    if (step.status === 'current') return 'bg-bosla-blue text-white';
    return 'bg-bosla-offwhite text-bosla-grey';
  }

  getStepLabelClass(step: TrackingStep): string {
    if (step.status === 'completed') return 'text-emerald-600';
    if (step.status === 'current') return 'text-bosla-blue font-bold';
    return 'text-bosla-grey';
  }

  getStepSubtext(step: TrackingStep): string {
    if (step.status === 'completed') return 'تم';
    if (step.status === 'current') return 'قيد التنفيذ';
    return 'لم يبدأ بعد';
  }
}

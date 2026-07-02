import { AppointmentStatus } from '@core/enums/appointment-status.enum';

/* ── Arabic Date ─────────────────────────────────────────────────────── */

export function formatArabicDate(date: Date): string {
  return date.toLocaleDateString('ar-SA', {
    weekday: 'long',
    month: 'long',
    day: 'numeric',
  });
}

export function formatArabicTime(date: Date): string {
  return new Intl.DateTimeFormat('ar-SA', {
    hour: '2-digit',
    minute: '2-digit',
    hour12: true,
  }).format(date);
}

/* ── Arabic Duration ─────────────────────────────────────────────────── */

function minuteWord(n: number): string {
  if (n >= 3 && n <= 10) return 'دقائق';
  return 'دقيقة';
}

function hourWord(hours: number): string {
  if (hours === 1) return 'ساعة';
  if (hours === 2) return 'ساعتان';
  if (hours >= 3 && hours <= 10) return `${hours} ساعات`;
  return `${hours} ساعة`;
}

export function formatArabicDuration(minutes: number): string {
  if (minutes < 1) return 'أقل من دقيقة';

  const hours = Math.floor(minutes / 60);
  const mins = minutes % 60;

  if (hours === 0) {
    return `${mins} ${minuteWord(mins)}`;
  }

  if (mins === 0) {
    return hourWord(hours);
  }

  return `${hourWord(hours)} و${mins} ${minuteWord(mins)}`;
}

/* ── Arabic Countdown ────────────────────────────────────────────────── */

export function formatArabicCountdown(targetDate: Date): string {
  const now = Date.now();
  const diffMs = targetDate.getTime() - now;

  if (diffMs <= 0) {
    return '';
  }

  const diffMins = Math.floor(diffMs / 60000);

  if (diffMins < 1) {
    return 'تبدأ الآن';
  }

  const hours = Math.floor(diffMins / 60);
  const mins = diffMins % 60;

  if (hours === 0) {
    return `متبقي ${mins} ${minuteWord(mins)}`;
  }

  if (mins === 0) {
    return `متبقي ${hourWord(hours)}`;
  }

  return `متبقي ${hourWord(hours)} و${mins} ${minuteWord(mins)}`;
}

/* ── Appointment Status ──────────────────────────────────────────────── */

const STATUS_MAP: Record<AppointmentStatus, string> = {
  [AppointmentStatus.Pending]: 'قيد الانتظار',
  [AppointmentStatus.Confirmed]: 'مؤكدة',
  [AppointmentStatus.Paid]: 'تم الدفع',
  [AppointmentStatus.Completed]: 'مكتملة',
  [AppointmentStatus.Cancelled]: 'ملغاة',
  [AppointmentStatus.Rescheduled]: 'معاد جدولتها',
  [AppointmentStatus.Paid]: 'تم الدفع',
};

export function localizeAppointmentStatus(status: AppointmentStatus): string {
  return STATUS_MAP[status] ?? 'غير معروف';
}

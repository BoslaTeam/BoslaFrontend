import { Component, input, computed } from '@angular/core';

// تعريف الأنواع المدعومة بدقة بناءً على وثيقة التصميم
export type ConsultationType = 'scheduled' | 'confirmed' | 'live' | 'completed' | 'cancelled';
export type AvailabilityType = 'available' | 'busy' | 'offline';

@Component({
  selector: 'ui-status-badge',
  standalone: true,
  imports: [],
  templateUrl: './status-badge.html',
})
export class UiStatusBadge {
  // المدخلات الأساسية للتحكم بالنوع والمظهر
  readonly type = input<ConsultationType | AvailabilityType>('scheduled');
  readonly isMuted = input<boolean>(false); // خاصة بمجموعة Availability المطفأة

  // تحديد ما إذا كان العنصر ينتمي لمجموعة التوفر (Availability)
  readonly isAvailabilityGroup = computed(() => {
    return ['available', 'busy', 'offline'].includes(this.type());
  });

  // مصفوفة الأيقونات المحددة في السكتش لكل حالة
  readonly badgeIcon = computed(() => {
    const icons: Record<ConsultationType, string> = {
      scheduled: 'fa-regular fa-calendar-days',
      confirmed: 'fa-regular fa-circle-check',
      live: 'fa-solid fa-video',
      completed: 'fa-solid fa-check-double',
      cancelled: 'fa-regular fa-circle-xmark',
    };
    return !this.isAvailabilityGroup() ? icons[this.type() as ConsultationType] : '';
  });

  // اسم شارة الحالة باللغة العربية مطابقاً للرسم
  readonly badgeLabel = computed(() => {
    const labels: Record<ConsultationType | AvailabilityType, string> = {
      scheduled: 'مجدول',
      confirmed: 'مؤكد',
      live: 'مباشر',
      completed: 'مكتمل',
      cancelled: 'ملغى',
      available: 'متاح',
      busy: 'مشغول',
      offline: 'غير متصل'
    };
    return labels[this.type()];
  });

  // حساب كلاسات التنسيق والحركة (Default & Hover) المتوافقة مع Tailwind
  readonly badgeClasses = computed(() => {
    const base = 'inline-flex items-center gap-1.5 h-7 px-3 text-[13px] font-sans font-semibold rounded-[4px] select-none transition-all duration-200 cursor-default border';

    // كلاسات مجموعة الاستشارات (Solid / Cancelled)
    const consultationClasses: Record<ConsultationType, string> = {
      scheduled: 'bg-[#1B4F72] border-[#1B4F72] text-white hover:bg-[#153d59]',
      confirmed: 'bg-[#2C3E50] border-[#2C3E50] text-white hover:bg-[#1a252f]',
      live: 'bg-[#F39C12] border-[#F39C12] text-white hover:bg-[#d6850f]',
      completed: 'bg-[#7f8c8d] border-[#7f8c8d] text-white hover:bg-[#6c7778]',
      cancelled: 'bg-white border-[#ba1a1a] text-[#ba1a1a] hover:bg-[#ba1a1a]/5'
    };

    // كلاسات مجموعة التوفر (Bordered with Dots)
    const availabilityClasses: Record<AvailabilityType, string> = {
      available: 'bg-[#eaf4fa] border-[#2EB6AB]/30 text-bosla-charcoal hover:border-[#2EB6AB]',
      busy: 'bg-[#fff3e0] border-[#F39C12]/30 text-bosla-charcoal hover:border-[#F39C12]',
      offline: 'bg-bosla-charcoal/[0.03] border-bosla-charcoal/10 text-bosla-charcoal/50 hover:border-bosla-charcoal/30'
    };

    // تطبيق التعديل الذكي لـ تحسين وضوح النص في حالة (Muted)
    if (this.isMuted() && this.isAvailabilityGroup()) {
      const currentType = this.type() as AvailabilityType;
      const mutedBg = currentType === 'available' ? 'bg-[#eaf4fa]' : currentType === 'busy' ? 'bg-[#fff3e0]' : 'bg-bosla-charcoal/[0.03]';
      // الإبقاء على لون الخلفية المميز مع جعل النص بلون رمادي داكن ومقروء بوضوح
      return `${base} ${mutedBg} border-bosla-charcoal/10 text-bosla-charcoal/60`;
    }

    return this.isAvailabilityGroup()
      ? `${base} ${availabilityClasses[this.type() as AvailabilityType]}`
      : `${base} ${consultationClasses[this.type() as ConsultationType]}`;
  });

  // حساب لون النقطة الدائرية الداخلية لمجموعة التوفر
  readonly dotClasses = computed(() => {
    const dots: Record<AvailabilityType, string> = {
      available: 'bg-[#2EB6AB]',
      busy: 'bg-[#F39C12]',
      offline: 'bg-bosla-charcoal/40'
    };
    return `w-2 h-2 rounded-full ${this.isMuted() ? 'bg-bosla-charcoal/30' : dots[this.type() as AvailabilityType]}`;
  });
}
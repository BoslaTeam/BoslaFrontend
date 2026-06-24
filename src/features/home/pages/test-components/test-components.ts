import { Component, inject, model } from '@angular/core';
import { UiLogo } from "@shared/ui/logo/logo";
import { UiButton } from "@shared/ui/button/button";
import { UiInput } from "@shared/ui/input/input";
import { UiTextarea } from "@shared/ui/textarea/textarea";
import { ToastService } from '@core/services/toast.service';
import { UiToast } from "@shared/ui/toast/toast";
import { TabItem, UiTabs } from '@shared/ui/tabs/tabs';
import { BreadcrumbItem, UiBreadcrumbs } from '@shared/ui/breadcrumbs/breadcrumbs';
import { ExpertData, UiExpertCard } from '@shared/ui/expert-card/expert-card';
import { TimeSlotItem, UiTimeSlotsPicker } from '@shared/ui/time-slots-picker/time-slots-picker';
import { UiStatCard } from "@shared/ui/stat-card/stat-card";
import { UiEmptyStateCard } from '@shared/ui/empty-state-card/empty-state-card';
import { UiLoadingSkeleton } from "@shared/ui/loading-skeleton/loading-skeleton";
import { UiModal } from '@shared/ui/modal/modal';
import { UiStatusBadge } from '@shared/ui/status-badge/status-badge';
import { ReviewItem, UiReviewCard } from '@shared/ui/review-card/review-card';
import { UiInteractiveRating } from "@shared/ui/interactive-rating/interactive-rating";
import { UiRatingSummary } from "@shared/ui/rating-summary/rating-summary";

@Component({
  selector: 'app-test-components',
  imports: [UiLogo, UiButton, UiInput, UiTextarea, UiToast, UiTabs, UiBreadcrumbs, UiExpertCard, UiTimeSlotsPicker, UiStatCard, UiEmptyStateCard, UiLoadingSkeleton, UiModal, UiStatusBadge, UiReviewCard, UiInteractiveRating, UiRatingSummary],
  templateUrl: './test-components.html',
  styleUrl: './test-components.css',
})
export class TestComponents {

  // **********************************************
  // toast
  private toastService = inject(ToastService);

  triggerSuccess() {
    this.toastService.success('تم تأكيد حجز الموعد بنجاح.');
  }

  triggerDanger() {
    this.toastService.danger('فشل الاتصال بالخادم، يرجى المحاولة لاحقاً.');
  }

  triggerInfo() {
    this.toastService.info('تم تحديث بيانات ملفك الشخصي بنجاح.');
  }

  // **********************************************
  // breadcrumbs
  myTabs: TabItem[] = [
    { id: 'upcoming', label: 'الاستشارات القادمة' },
    { id: 'history', label: 'السجل' },
    { id: 'saved', label: 'الملفات المحفوظة' }
  ];
  selectedTabId = 'upcoming';

  // بيانات الـ Breadcrumbs المحاكية للسكتش
  myBreadcrumbs: BreadcrumbItem[] = [
    { label: 'الرئيسية', url: '/home' },
    { label: 'المستشارين', url: '/consultants' },
    { label: 'د. أحمد المنصوري' } // الأخير ثابت بدون رابط
  ];

  onTabChanged(tabId: string) {
    console.log('التبويب النشط الآن هو:', tabId);
  }

  // **********************************************
  // بيانات المستشار المحاكية تماماً للسكتش الخاص بك
  mockExpert: ExpertData = {
    id: 'exp_01',
    name: 'د. أحمد المنصوري',
    title: 'مستشار قانوني وتجاري',
    rating: 4.9,
    price: 150,
    avatarUrl: 'assets/icons/BoslaLogo.svg', // ضع مسار أي صورة تجريبية متوفرة لديك
    isOnline: true,
    isVerified: true
  };

  onBookingTriggered(expertId: string) {
    // ربط مدمج مع نظام التنبيهات الذي قمنا ببنائه سابقاً ليعطي تجربة ممتعة!
    this.toastService.success(`تم فتح بوابة الحجز للمستشار ذو المعرف: ${expertId}`);
  }

  // **********************************************
  mySlots: TimeSlotItem[] = [
    { time: '10:00 ص' },
    { time: '11:30 ص' },
    { time: '01:00 م' },
    { time: '08:00 م', isDisabled: true }, // فترة محجوزة/معطلة
    { time: '02:30 م' },
    { time: '03:00 م' },
    { time: '04:30 م' },
    { time: '05:15 م' },
    { time: '05:30 م' },
    { time: '05:60 م' },
    { time: '07:16 م' },
    { time: '12:30 م' },
    { time: '11:00 م' },
    { time: '07:30 م' },
    { time: '05:30 م' }
  ];

  activeTimeSlot = '11:30 ص'; // القيمة النشطة الافتراضية بالرسم

  // **************************************************

  isCancelModalOpen = false;

  openModal() {
    this.isCancelModalOpen = true;
  }

  handleCancelConfirm() {
    this.isCancelModalOpen = false;
    this.toastService.danger('تم إلغاء الموعد بنجاح.');
  }

  // ******************************************************

  readonly mockReviews: ReviewItem[] = [
    {
      id: 1,
      authorName: 'عمر عبد الله',
      timeAgo: 'منذ شهر',
      rating: 5,
      isVerified: true,
      comment: 'استشارة جيدة بشكل عام، لكن كان هناك بعض التأخير في بدء الجلسة. المحتوى مفيد.'
    },
    {
      id: 2,
      authorName: 'سارة خالد',
      timeAgo: 'منذ أسبوع',
      rating: 5,
      isVerified: false,
      comment: 'أفضل تجربة استشارية حصلت عليها. الدقة في المواعيد والاحترافية العالية هي ما يميز هذه المنصة.'
    },
    {
      id: 3,
      authorName: 'أحمد محمد',
      timeAgo: 'منذ يومين',
      rating: 5,
      isVerified: false,
      comment: 'استشارة ممتازة جداً، المستشار كان متعاوناً وقدم لي حلولاً عملية وواضحة لمشكلتي. أنصح به بشدة.'
    }
  ];

  // *************************************************************

  
}

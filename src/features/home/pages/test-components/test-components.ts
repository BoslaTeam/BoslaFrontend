import { Component, inject, model, signal } from '@angular/core';
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
import { UiTableRowSkeleton } from '@shared/ui/table-row-skeleton/table-row-skeleton';
import { UiKpiCardSkeleton } from '@shared/ui/kpi-card-skeleton/kpi-card-skeleton';
import { DropdownOption, UiDropdown } from '@shared/ui/dropdown/dropdown';
import { FormsModule } from '@angular/forms';
import { FilterOption, UiMultiSelectFilter } from '@shared/ui/multi-select-filter/multi-select-filter';
import { JsonPipe } from '@angular/common';
import { UiEmptyState } from "@shared/ui/empty-state/empty-state";
import { DashboardActivity, UiDashboardActivityCard } from '@shared/ui/dashboard-activity-card/dashboard-activity-card';
import { UiDashboardStatCard } from "@shared/ui/dashboard-stat-card/dashboard-stat-card";
import { UiPagination } from '@shared/ui/pagination/pagination';

@Component({
  selector: 'app-test-components',
  imports: [
    FormsModule, JsonPipe,
    UiLogo, UiButton, UiInput, UiTextarea, UiToast, UiTabs, UiBreadcrumbs,
    UiExpertCard, UiTimeSlotsPicker, UiStatCard, UiEmptyStateCard,
    UiLoadingSkeleton, UiModal, UiStatusBadge, UiReviewCard,
    UiInteractiveRating, UiRatingSummary, UiTableRowSkeleton,
    UiKpiCardSkeleton, UiDropdown, UiMultiSelectFilter,
    UiEmptyState, UiDashboardStatCard, UiDashboardActivityCard,
    UiPagination
  ],
  templateUrl: './test-components.html',
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

  myBreadcrumbs: BreadcrumbItem[] = [
    { label: 'الرئيسية', url: '/home' },
    { label: 'المستشارين', url: '/consultants' },
    { label: 'د. أحمد المنصوري' }
  ];

  onTabChanged(tabId: string) {
    console.log('التبويب النشط الآن هو:', tabId);
  }

  // **********************************************
  mockExpert: ExpertData = {
    id: 'exp_01',
    name: 'د. أحمد المنصوري',
    title: 'مستشار قانوني وتجاري',
    rating: 4.9,
    price: 150,
    avatarUrl: 'assets/icons/BoslaLogo.svg',
    isOnline: true,
    isVerified: true
  };

  onBookingTriggered(expertId: string) {
    this.toastService.success(`تم فتح بوابة الحجز للمستشار ذو المعرف: ${expertId}`);
  }

  // **********************************************
  mySlots: TimeSlotItem[] = [
    { time: '10:00 ص' },
    { time: '11:30 ص' },
    { time: '01:00 م' },
    { time: '08:00 م', isDisabled: true },
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

  activeTimeSlots: string[] = ['11:30 ص'];

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

  // ******************************************************
  specialties: DropdownOption[] = [
    { value: 'management', label: 'الاستشارات الإدارية' },
    { value: 'financial', label: 'الاستشارات المالية' },
    { value: 'marketing', label: 'التسويق والمبيعات' },
    { value: 'hr', label: 'الموارد البشرية' }
  ];

  selectedSpecialty = 'financial';

  // ******************************************************
  filterSpecialties: FilterOption[] = [
    { value: 'financial', label: 'الاستشارات المالية' },
    { value: 'management', label: 'الاستشارات الإدارية' },
    { value: 'marketing', label: 'التسويق والمبيعات' },
    { value: 'hr', label: 'الموارد البشرية' }
  ];

  // مصفوفة تجريبية تحتوي على قيمتين تم اختيارهم مسبقاً لمحاكاة حالة "Active (With Tags)" بالصورة
  selectedFilterValues = ['financial', 'management'];

  // ******************************************************
  recentActivities: DashboardActivity[] = [
    {
      id: 1,
      title: 'تم تأكيد جلسة استشارية جديدة مع ',
      highlightedText: 'أحمد محمود',
      time: 'قبل 10 دقائق',
      icon: 'fa-regular fa-calendar-check'
    },
    {
      id: 2,
      title: 'اكتملت عملية الدفع للاستشارة رقم #8920',
      time: 'قبل ساعتين',
      icon: 'fa-regular fa-credit-card',
      iconColorClass: 'orange' // لعرض أيقونة الدفع باللون البرتقالي المتوافق مع الصورة
    },
    {
      id: 3,
      title: 'اكتملت عملية الدفع للاستشارة رقم #8920',
      time: 'قبل ساعتين',
      icon: 'fa-regular fa-credit-card',
      iconColorClass: 'orange' // لعرض أيقونة الدفع باللون البرتقالي المتوافق مع الصورة
    },
    {
      id: 4,
      title: 'اكتملت عملية الدفع للاستشارة رقم #8920',
      time: 'قبل ساعتين',
      icon: 'fa-regular fa-credit-card',
      iconColorClass: 'orange' // لعرض أيقونة الدفع باللون البرتقالي المتوافق مع الصورة
    },
    {
      id: 4,
      title: 'اكتملت عملية الدفع للاستشارة رقم #8920',
      time: 'قبل ساعتين',
      icon: 'fa-regular fa-credit-card',
      iconColorClass: 'orange' // لعرض أيقونة الدفع باللون البرتقالي المتوافق مع الصورة
    },
    {
      id: 4,
      title: 'اكتملت عملية الدفع للاستشارة رقم #8920',
      time: 'قبل ساعتين',
      icon: 'fa-regular fa-credit-card',
      iconColorClass: 'orange' // لعرض أيقونة الدفع باللون البرتقالي المتوافق مع الصورة
    },
  ];

  // ******************************************************
  activePage = signal<number>(1);

  // إجمالي عدد الصفحات (مثلاً 6 صفحات كما في صورتك المرفقة)
  totalAmountOfPages = signal<number>(100);

  // دالة تُستدعى فور الانتقال لصفحة جديدة
  onPageSelected(newPage: number): void {
    this.activePage.set(newPage);
    console.log(`تم الانتقال بنجاح إلى الصفحة رقم: ${newPage}`);
    // هنا يمكنك استدعاء الـ API الخاص بك لجلب بيانات الصفحة الجديدة
  }
}
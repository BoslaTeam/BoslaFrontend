import { Component, input, output, computed } from '@angular/core';

@Component({
  selector: 'ui-pagination',
  standalone: true,
  imports: [],
  templateUrl: './pagination.html',
  styleUrl: './pagination.css'
})
export class UiPagination {
  readonly currentPage = input<number>(1);
  readonly totalPages = input<number>(1);
  readonly pageChange = output<number>();

  // حساب الأرقام بشكل تفاعلي يتغير مع حركة المؤشر والأسهم
  readonly pages = computed<(number | string)[]>(() => {
    const current = this.currentPage();
    const total = this.totalPages();
    const items: (number | string)[] = [];

    // إذا كان إجمالي الصفحات 4 أو أقل، نعرضها بالكامل
    if (total <= 4) {
      for (let i = 1; i <= total; i++) items.push(i);
      return items;
    }

    // دائماً نبدأ بالصفحة الأولى
    items.push(1);

    // حساب مدى الصفحات حول الصفحة الحالية لضمان ظهور الرقم النشط دائماً
    const startPage = Math.max(2, current - 1);
    const endPage = Math.min(total - 1, current + 1);

    // إضافة النقاط الثلاث الأولى إذا كان هناك فجوة بين الصفحة 1 والصفحة الحالية
    if (startPage > 2) {
      items.push('...');
    }

    // إضافة الصفحات المحيطة بالصفحة النشطة
    for (let i = startPage; i <= endPage; i++) {
      items.push(i);
    }

    // إضافة النقاط الثلاث الأخيرة إذا كان هناك فجوة قبل الصفحة الأخيرة
    if (endPage < total - 1) {
      items.push('...');
    }

    // دائماً ننهي بالصفحة الأخيرة
    if (total > 1) {
      items.push(total);
    }

    return items;
  });

  onPageSelect(page: number | string): void {
    if (typeof page === 'number' && page !== this.currentPage()) {
      this.pageChange.emit(page);
    }
  }

  nextPage(): void {
    if (this.currentPage() < this.totalPages()) {
      this.pageChange.emit(this.currentPage() + 1);
    }
  }

  prevPage(): void {
    if (this.currentPage() > 1) {
      this.pageChange.emit(this.currentPage() - 1);
    }
  }
}
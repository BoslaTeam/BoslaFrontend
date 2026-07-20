import { Component, forwardRef, input, signal, HostListener, ElementRef, inject, computed } from '@angular/core';
import { NG_VALUE_ACCESSOR, ControlValueAccessor, FormsModule } from '@angular/forms';
import { TranslationService } from '@core/services/translation.service';

export interface FilterOption {
  value: any;
  label: string;
}

@Component({
  selector: 'ui-multi-select-filter',
  standalone: true,
  imports: [FormsModule],
  providers: [
    {
      provide: NG_VALUE_ACCESSOR,
      useExisting: forwardRef(() => UiMultiSelectFilter),
      multi: true,
    },
  ],
  templateUrl: './multi-select-filter.html',
  styleUrl: './multi-select-filter.css',
})
export class UiMultiSelectFilter implements ControlValueAccessor {
  private elementRef = inject(ElementRef);
  private readonly translationService = inject(TranslationService);

  readonly direction = computed(() => this.translationService.currentLang() === 'ar' ? 'rtl' : 'ltr');

  // المدخلات الأساسية للمكون
  readonly label = input<string>('');
  readonly placeholder = input<string>('تصفية / بحث...');
  readonly searchPlaceholder = input<string>('ابحث...');
  readonly options = input<FilterOption[]>([]);

  // الحالات الداخلية للمكون باستخدام Signals
  readonly selectedValues = signal<any[]>([]);
  readonly isOpen = signal<boolean>(false);
  readonly searchQuery = signal<string>('');

  // مصفوفة الخيارات المفلترة بناءً على نص البحث الصادر من المستخدم
  readonly filteredOptions = computed(() => {
    const query = this.searchQuery().trim().toLowerCase();
    if (!query) return this.options();
    return this.options().filter(opt => opt.label.toLowerCase().includes(query));
  });

  // مصفوفة العناصر المختارة حالياً لعرضها كـ Tags داخل الحقل
  readonly selectedTags = computed(() => {
    return this.options().filter(opt => this.selectedValues().includes(opt.value));
  });

  private onChange: (value: any[]) => void = () => {};
  private onTouched: () => void = () => {};

  toggleDropdown(): void {
    this.isOpen.update(val => !val);
    if (this.isOpen()) {
      this.onTouched();
    } else {
      this.searchQuery.set(''); // تصفير حقل البحث عند الإغلاق
    }
  }

  // تحديد أو إلغاء تحديد خيار
  toggleOption(value: any, event?: Event): void {
    if (event) {
      event.stopPropagation(); // منع إغلاق القائمة عند الضغط على الـ Checkbox أو النص
    }

    const current = this.selectedValues();
    let updated: any[];

    if (current.includes(value)) {
      updated = current.filter(v => v !== value);
    } else {
      updated = [...current, value];
    }

    this.selectedValues.set(updated);
    this.onChange(updated);
  }

  // حذف Tag محدد من الخارج مباشرة بالضغط على الـ X
  removeTag(value: any, event: Event): void {
    event.stopPropagation(); // منع فتح/إغلاق القائمة
    const updated = this.selectedValues().filter(v => v !== value);
    this.selectedValues.set(updated);
    this.onChange(updated);
  }

  @HostListener('document:click', ['$event'])
  clickOutside(event: Event): void {
    if (!this.elementRef.nativeElement.contains(event.target)) {
      this.isOpen.set(false);
      this.searchQuery.set('');
    }
  }

  // ربط المكون بنظام نماذج الـ Angular
  writeValue(value: any[]): void {
    this.selectedValues.set(Array.isArray(value) ? value : []);
  }

  registerOnChange(fn: (value: any[]) => void): void {
    this.onChange = fn;
  }

  registerOnTouched(fn: () => void): void {
    this.onTouched = fn;
  }
}
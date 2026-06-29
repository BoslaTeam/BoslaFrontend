import { Component, forwardRef, input, signal, HostListener, ElementRef, inject } from '@angular/core';
import { NG_VALUE_ACCESSOR, ControlValueAccessor } from '@angular/forms';

export interface DropdownOption {
  value: any;
  label: string;
}

@Component({
  selector: 'ui-dropdown',
  standalone: true,
  imports: [],
  providers: [
    {
      provide: NG_VALUE_ACCESSOR,
      useExisting: forwardRef(() => UiDropdown),
      multi: true,
    },
  ],
  templateUrl: './dropdown.html',
  styleUrl: './dropdown.css',
})
export class UiDropdown implements ControlValueAccessor {
  private elementRef = inject(ElementRef);

  // المدخلات الأساسية للمكون
  readonly label = input<string>('');
  readonly placeholder = input<string>('اختر التخصص');
  readonly options = input<DropdownOption[]>([]);
  readonly disabled = input<boolean>(false);

  // الحالات الداخلية للمكون باستخدام الـ Signals
  readonly selectedValue = signal<any>(null);
  readonly isOpen = signal<boolean>(false);

  // دوال الـ ControlValueAccessor
  private onChange: (value: any) => void = () => { };
  private onTouched: () => void = () => { };

  // الحصول على النص المعروض للخيار المحدد حالياً
  get selectedLabel(): string {
    const selected = this.options().find(opt => opt.value === this.selectedValue());
    return selected ? selected.label : this.placeholder();
  }

  toggleDropdown(): void {
    if (this.disabled()) return;
    this.isOpen.update(val => !val);
    this.onTouched();
  }

  selectOption(option: DropdownOption): void {
    if (this.disabled()) return;
    this.selectedValue.set(option.value);
    this.isOpen.set(false);
    this.onChange(option.value);
  }

  // إغلاق القائمة التلقائي عند الضغط خارج المكون
  @HostListener('document:click', ['$event'])
  clickOutside(event: Event): void {
    if (!this.elementRef.nativeElement.contains(event.target)) {
      this.isOpen.set(false);
    }
  }

  // إعدادات التزامن مع الـ Angular Forms
  writeValue(value: any): void {
    this.selectedValue.set(value);
  }

  registerOnChange(fn: (value: any) => void): void {
    this.onChange = fn;
  }

  registerOnTouched(fn: () => void): void {
    this.onTouched = fn;
  }

  setDisabledState(isDisabled: boolean): void {
    // متاح التحكم به أيضاً عبر خاصية الـ disabled input
  }
}
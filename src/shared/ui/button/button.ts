import { Component, forwardRef, input, output, computed, signal } from '@angular/core';
import { ControlValueAccessor, NG_VALUE_ACCESSOR } from '@angular/forms';
import { UiSpinner } from "../spinner/spinner";

export type ButtonVariant = 'primary' | 'secondary' | 'ghost' | 'danger';
export type ButtonSize = 'sm' | 'md' | 'lg';

@Component({
  selector: 'ui-button',
  standalone: true,
  imports: [UiSpinner],
  templateUrl: './button.html',
  styleUrl: './button.css',
  providers: [
    {
      provide: NG_VALUE_ACCESSOR,
      useExisting: forwardRef(() => UiButton),
      multi: true,
    },
  ],
})
export class UiButton implements ControlValueAccessor {
  readonly variant = input<ButtonVariant>('primary');
  readonly size = input<ButtonSize>('md');
  readonly outline = input<boolean>(false);
  readonly loading = input<boolean>(false);
  readonly type = input<'button' | 'submit' | 'reset'>('button');

  readonly buttonValue = input<any>(null);

  readonly btnClick = output<MouseEvent>();

  readonly formValue = signal<any>(null);
  readonly disabledSignal = signal<boolean>(false);
  readonly inputDisabled = input<boolean>(false);

  readonly isButtonDisabled = computed(() =>
    this.disabledSignal() || this.inputDisabled() || this.loading()
  );

  readonly buttonClasses = computed(() => {
    const baseClasses = 'w-[245.5px] relative flex items-center justify-center gap-2 py-2 px-4 rounded-[2px] text-[14px] font-sans font-medium transition-all duration-300 ease-in-out cursor-pointer select-none active:scale-[0.98]';

    const sizes = {
      sm: 'h-[32px] text-[13px] w-[180px]',
      md: 'h-[36px]',
      lg: 'h-[44px] text-[16px] w-[280px]'
    };

    const isSelected = this.buttonValue() !== null && this.formValue() === this.buttonValue();

    const variants = {
      primary: isSelected
        ? 'bg-bosla-primary text-white hover:shadow-md'
        : 'bg-bosla-orange text-white hover:bg-bosla-orange/90 hover:shadow-md active:bg-bosla-orange/95 disabled:opacity-50 disabled:cursor-not-allowed disabled:active:scale-100 disabled:shadow-none',
      secondary: 'bg-transparent text-bosla-blue border border-bosla-blue h-[38px] hover:bg-bosla-blue/10 active:bg-bosla-blue/20 disabled:opacity-50 disabled:active:scale-100',
      ghost: 'bg-transparent text-bosla-charcoal hover:bg-bosla-charcoal/5 active:bg-bosla-charcoal/10 disabled:opacity-50 disabled:active:scale-100',
      danger: this.outline()
        ? 'bg-transparent text-bosla-error border border-bosla-error h-[38px] hover:bg-bosla-error/10 active:bg-bosla-error/20 disabled:opacity-50 disabled:active:scale-100'
        : 'bg-bosla-error text-white hover:bg-bosla-error/90 hover:shadow-md active:bg-bosla-error/95 disabled:opacity-50 disabled:active:scale-100 disabled:shadow-none'
    };

    const selectedSize = sizes[this.size()] || sizes['md'];
    const selectedVariant = variants[this.variant()] || variants.primary;

    return `${baseClasses} ${selectedSize} ${selectedVariant}`;
  });

  private onChange: (value: any) => void = () => { };
  private onTouched: () => void = () => { };

  writeValue(value: any): void {
    this.formValue.set(value);
  }

  registerOnChange(fn: (value: any) => void): void {
    this.onChange = fn;
  }

  registerOnTouched(fn: () => void): void {
    this.onTouched = fn;
  }

  setDisabledState(isDisabled: boolean): void {
    this.disabledSignal.set(isDisabled);
  }

  onClick(event: MouseEvent) {
    if (this.isButtonDisabled()) {
      event.preventDefault();
      event.stopPropagation();
      return;
    }

    if (this.buttonValue() !== null) {
      this.formValue.set(this.buttonValue());
      this.onChange(this.buttonValue());
    }

    this.onTouched();
    this.btnClick.emit(event);
  }
}
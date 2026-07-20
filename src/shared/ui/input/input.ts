import { Component, forwardRef, input, signal, computed, inject } from '@angular/core';
import { ControlValueAccessor, NG_VALUE_ACCESSOR } from '@angular/forms';
import { TranslationService } from '@core/services/translation.service';

export type InputType = 'text' | 'email' | 'password' | 'number' | 'tel' | 'date' | 'time';

@Component({
  selector: 'ui-input',
  standalone: true,
  imports: [],
  templateUrl: './input.html',
  providers: [
    {
      provide: NG_VALUE_ACCESSOR,
      useExisting: forwardRef(() => UiInput),
      multi: true,
    },
  ],
})
export class UiInput implements ControlValueAccessor {
  private readonly translationService = inject(TranslationService);

  readonly direction = computed(() => this.translationService.currentLang() === 'ar' ? 'rtl' : 'ltr');

  readonly label = input<string>('');
  readonly type = input<InputType>('text');
  readonly placeholder = input<string>('');
  readonly required = input(false);
  readonly hint = input<string>('');
  readonly errorMessage = input<string>('');
  readonly inputId = input<string>(`ui-input-${Math.random().toString(36).slice(2, 9)}`);

  readonly value = signal('');
  readonly disabled = signal(false);

  private onChange: (value: string) => void = () => { };
  private onTouched: () => void = () => { };

  writeValue(value: string): void {
    this.value.set(value ?? '');
  }

  registerOnChange(fn: (value: string) => void): void {
    this.onChange = fn;
  }

  registerOnTouched(fn: () => void): void {
    this.onTouched = fn;
  }

  setDisabledState(isDisabled: boolean): void {
    this.disabled.set(isDisabled);
  }

  onInput(event: Event): void {
    let value = (event.target as HTMLInputElement).value;
    if (this.type() === 'number' && value !== '') {
      const numValue = Number(value);
      if (numValue < 1) {
        value = '1';
        (event.target as HTMLInputElement).value = '1';
      }
    }
    this.value.set(value);
    this.onChange(value);
  }

  onBlur(): void {
    this.onTouched();
  }
}
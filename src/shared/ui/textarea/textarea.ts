import { Component, forwardRef, input, signal } from '@angular/core';
import { ControlValueAccessor, NG_VALUE_ACCESSOR } from '@angular/forms';

@Component({
  selector: 'ui-textarea',
  standalone: true,
  imports: [],
  providers: [
    {
      provide: NG_VALUE_ACCESSOR,
      useExisting: forwardRef(() => UiTextarea),
      multi: true,
    },
  ],
  templateUrl: './textarea.html',
})

export class UiTextarea implements ControlValueAccessor {

  readonly label = input<string>('');
  readonly placeholder = input<string>('');
  readonly required = input(false);
  readonly rows = input(4);
  readonly hint = input<string>('');
  readonly errorMessage = input<string>('');
  readonly inputId = input<string>(`ui-textarea-${Math.random().toString(36).slice(2, 9)}`);

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
    const value = (event.target as HTMLTextAreaElement).value;
    this.value.set(value);
    this.onChange(value);
  }

  onBlur(): void {
    this.onTouched();
  }
}
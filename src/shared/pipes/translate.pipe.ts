import { Pipe, PipeTransform, inject } from '@angular/core';
import { TranslationService } from '@core/services/translation.service';

@Pipe({
  name: 't',
  standalone: true,
  pure: false,
})
export class TranslatePipe implements PipeTransform {
  private readonly service = inject(TranslationService);

  transform(key: string, ...args: any[]): string {
    this.service.currentLang();
    return this.service.translate(key, ...args.map(a => String(a)));
  }
}

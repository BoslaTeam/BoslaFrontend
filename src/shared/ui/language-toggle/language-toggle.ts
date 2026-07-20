import { Component, inject } from '@angular/core';
import { TranslationService, Lang } from '@core/services/translation.service';

@Component({
  selector: 'app-language-toggle',
  standalone: true,
  templateUrl: './language-toggle.html',
})
export class LanguageToggle {
  protected readonly t = inject(TranslationService);

  toggle(): void {
    const next: Lang = this.t.currentLang() === 'ar' ? 'en' : 'ar';
    this.t.switchLang(next);
  }
}

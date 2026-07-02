import { Component, inject, signal } from '@angular/core';
import { RouterOutlet, Router } from '@angular/router';
import { AppHeader } from '@layouts/shared/app-header/app-header';
import { PublicFooter } from './public-footer/public-footer';
import { AuthService } from '@core/services/auth.service';
import { AiChatWidget } from '@features/ai/components/ai-chat-widget/ai-chat-widget';

@Component({
  selector: 'app-public-layout',
  imports: [RouterOutlet, AppHeader, PublicFooter],
  templateUrl: './public-layout.html'
})
export class PublicLayout {
  private readonly router = inject(Router);
  private readonly auth = inject(AuthService);

  isMobileMenuOpen = signal(false);

  get showChat(): boolean {
    const url = this.router.url;
    return this.auth.isAuthenticated()
      && !url.startsWith('/auth/login')
      && !url.startsWith('/auth/register');
  }
}

import { Component, inject, signal } from '@angular/core';
import { Router } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { AiSearchService } from '../../services/ai-search.service';
import { SpecialistCardDto } from '../../contracts/ai-search.contracts';

interface ChatMessage { role: string; content: string; }

@Component({
  selector: 'app-ai-chat-widget',
  imports: [FormsModule],
  template: `
    @if (!isOpen()) {
      <button (click)="toggle()" class="chat-fab" title="المساعد الذكي">
        <img src="assets/chat.png" alt="Bosla AI" class="bot-image" />
      </button>
    }

    @if (isOpen()) {
      <div class="chat-panel" dir="rtl">
        <div class="chat-header">
          <div class="chat-header-info">
            <div class="chat-avatar">
              <img src="assets/chat.png" alt="Bosla AI" class="bot-image bot-image-sm" />
            </div>
            <div>
              <div class="chat-header-title">بوصلة</div>
              <div class="chat-header-sub">المساعد الذكي</div>
            </div>
          </div>
          <button (click)="toggle()" class="chat-close">
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
              <line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/>
            </svg>
          </button>
        </div>

        <div class="chat-messages" #messagesContainer>
          <div class="chat-welcome">
            <div class="chat-welcome-icon">
              <img src="assets/chat.png" alt="Bosla AI" class="bot-image" />
            </div>
            <h4>مرحباً بك في بوصلة!</h4>
            <p>أنا المساعد الذكي. كيف أقدر أساعدك اليوم؟</p>
          </div>

          @for (msg of messages(); track $index) {
            @if (msg.role === 'user') {
              <div class="msg msg-user">{{ msg.content }}</div>
            } @else {
              <div class="msg msg-bot">
                @for (line of formatText(msg.content); track $index) {
                  <p>{{ line }}</p>
                }
              </div>
            }

            @let cards = msgCards()[msg.content];
            @if (cards?.length) {
              <div class="cards-row">
                @for (c of cards; track c.id) {
                   <a (click)="goToSpecialist(c.id); $event.preventDefault()" class="card">
                    <div class="card-avatar">
                      <img [src]="c.profileImageUrl?.trim() || 'assets/icons/favicon.ico'" [alt]="c.name"
                        (error)="c.profileImageUrl = undefined" />
                      @if (c.isOnline) { <div class="card-online"></div> }
                    </div>
                    <div class="card-name">{{ c.name }}</div>
                    <div class="card-title">{{ c.title || 'متخصص' }}</div>
                    <div class="card-footer">
                      <span class="card-rating">
                        <svg width="12" height="12" viewBox="0 0 20 20" fill="#F39C12">
                          <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z"/>
                        </svg>
                        {{ c.rating > 0 ? c.rating : 'جديد' }}
                      </span>
                      <span class="card-rate">{{ c.hourlyRate }} <small>/س</small></span>
                    </div>
                  </a>
                }
              </div>
            }
          }

          @if (isLoading()) {
            <div class="msg msg-bot">
              <div class="typing"><span></span><span></span><span></span></div>
            </div>
          }
        </div>

        <div class="chat-input">
          <input [(ngModel)]="input" (keyup.enter)="send()"
            placeholder="اكتب رسالتك..." class="chat-input-field" [disabled]="isLoading()" />
          <button (click)="send()" class="chat-send-btn" [disabled]="!input.trim() || isLoading()">
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
              <line x1="22" y1="2" x2="11" y2="13"/><polygon points="22 2 15 22 11 13 2 9 22 2"/>
            </svg>
          </button>
        </div>
      </div>
    }
  `,
  styles: [`
    :host { position: fixed; bottom: 16px; inset-inline-end: 16px; z-index: 9999; }

    .chat-fab {
      width: 68px; height: 68px; border-radius: 50%;
      background: transparent;
      border: none; cursor: pointer; padding: 0;
      box-shadow: 0 4px 20px rgba(243,156,18,0.5);
      display: flex; align-items: center; justify-content: center;
      transition: transform 0.2s, box-shadow 0.2s;
    }
    .chat-fab:hover { transform: scale(1.12); box-shadow: 0 6px 28px rgba(243,156,18,0.7); }

    .bot-image {
      width: 68px; height: 68px;
      border-radius: 50%;
      object-fit: cover;
      animation: floatBot 3s ease-in-out infinite;
    }
    .bot-image-sm {
      width: 40px; height: 40px;
      animation: floatBot 3s ease-in-out infinite;
    }
    @keyframes floatBot {
      0%, 100% { transform: translateY(0px) rotate(0deg); }
      33% { transform: translateY(-4px) rotate(-2deg); }
      66% { transform: translateY(-2px) rotate(2deg); }
    }

    .chat-panel {
      width: min(400px, calc(100vw - 32px));
      height: min(600px, calc(100vh - 120px));
      background: #fff; border-radius: 16px;
      box-shadow: 0 8px 40px rgba(0,0,0,0.15);
      display: flex; flex-direction: column;
      overflow: hidden;
      animation: slideUp 0.3s ease;
    }

    @media (max-width: 480px) {
      :host { bottom: 0; inset-inline-end: 0; }
      .chat-fab { width: 50px; height: 50px; }
      .chat-panel {
        width: 100vw;
        height: 100vh;
        border-radius: 0;
      }
    }
    @keyframes slideUp {
      from { opacity: 0; transform: translateY(20px); }
      to { opacity: 1; transform: translateY(0); }
    }

    .chat-header {
      padding: 16px 20px;
      background: linear-gradient(135deg, #1B4F72, #2E86AB);
      color: #fff;
      display: flex; align-items: center; justify-content: space-between;
      flex-shrink: 0;
    }
    .chat-header-info { display: flex; align-items: center; gap: 12px; }
    .chat-avatar {
      width: 40px; height: 40px; border-radius: 50%;
      background: rgba(255,255,255,0.2);
      display: flex; align-items: center; justify-content: center;
    }
    .chat-header-title { font-weight: 700; font-size: 16px; }
    .chat-header-sub { font-size: 12px; opacity: 0.8; }
    .chat-close {
      background: none; border: none; color: #fff; cursor: pointer;
      padding: 4px; border-radius: 8px;
    }
    .chat-close:hover { background: rgba(255,255,255,0.15); }

    .chat-messages {
      flex: 1; overflow-y: auto; padding: 16px;
      display: flex; flex-direction: column; gap: 8px;
    }
    .chat-welcome {
      text-align: center; padding: 24px 0; color: #1B4F72;
    }
    .chat-welcome-icon {
      width: 64px; height: 64px; margin: 0 auto 12px;
      background: rgba(27,79,114,0.1); border-radius: 50%;
      display: flex; align-items: center; justify-content: center;
    }
    .chat-welcome h4 { margin: 0 0 4px; font-size: 18px; }
    .chat-welcome p { margin: 0; font-size: 14px; color: #666; }

    .msg { max-width: 85%; padding: 12px 16px; border-radius: 14px; font-size: 14px; line-height: 1.6; word-wrap: break-word; }
    .msg p { margin: 0 0 6px; }
    .msg p:last-child { margin: 0; }
    .msg-user {
      align-self: flex-start;
      background: #1B4F72; color: #fff;
      border-bottom-right-radius: 4px;
    }
    .msg-bot {
      align-self: flex-end;
      background: #f0f0f0; color: #333;
      border-bottom-left-radius: 4px;
    }

    .typing { display: flex; gap: 4px; padding: 4px 0; }
    .typing span {
      width: 8px; height: 8px; border-radius: 50%;
      background: #999; animation: typing 1.4s infinite ease-in-out;
    }
    .typing span:nth-child(2) { animation-delay: 0.2s; }
    .typing span:nth-child(3) { animation-delay: 0.4s; }
    @keyframes typing {
      0%,60%,100% { transform: translateY(0); opacity: 0.4; }
      30% { transform: translateY(-8px); opacity: 1; }
    }

    .cards-row {
      display: flex; gap: 8px; overflow-x: auto;
      padding: 4px 0; flex-shrink: 0;
      align-self: flex-end;
      max-width: 100%;
    }
    .card {
      min-width: 140px; max-width: 160px;
      background: #fff; border: 1px solid #e0e0e0;
      border-radius: 12px; padding: 12px;
      text-decoration: none; color: inherit;
      display: flex; flex-direction: column; align-items: center; gap: 4px;
      transition: transform 0.2s, box-shadow 0.2s;
      cursor: pointer; flex-shrink: 0;
    }
    .card:hover { transform: translateY(-2px); box-shadow: 0 4px 12px rgba(0,0,0,0.1); }
    .card-avatar {
      width: 48px; height: 48px; border-radius: 50%;
      background: #f0f0f0; position: relative; overflow: hidden;
    }
    .card-avatar img { width: 100%; height: 100%; object-fit: cover; }
    .card-online {
      width: 12px; height: 12px; border-radius: 50%;
      background: #2ecc71; border: 2px solid #fff;
      position: absolute; bottom: 0; inset-inline-end: 0;
    }
    .card-name { font-weight: 700; font-size: 13px; text-align: center; color: #1B4F72; }
    .card-title { font-size: 11px; color: #888; text-align: center; }
    .card-footer {
      display: flex; align-items: center; gap: 8px; font-size: 12px;
      width: 100%; justify-content: center;
    }
    .card-rating { display: flex; align-items: center; gap: 2px; color: #555; }
    .card-rate { color: #F39C12; font-weight: 700; }

    .chat-input {
      padding: 12px 16px; border-top: 1px solid #eee;
      display: flex; gap: 8px; flex-shrink: 0;
    }
    .chat-input-field {
      flex: 1; padding: 12px 16px; border: 1px solid #ddd;
      border-radius: 24px; font-size: 14px; outline: none;
      font-family: inherit;
    }
    .chat-input-field:focus { border-color: #F39C12; }
    .chat-send-btn {
      width: 44px; height: 44px; border-radius: 50%;
      background: #F39C12; color: #fff; border: none;
      cursor: pointer; display: flex; align-items: center; justify-content: center;
      flex-shrink: 0;
    }
    .chat-send-btn:disabled { opacity: 0.5; cursor: not-allowed; }
    .chat-send-btn:not(:disabled):hover { background: #E67E22; }
  `],
})
export class AiChatWidget {
  private readonly aiSearchService = inject(AiSearchService);
  private readonly router = inject(Router);

  readonly isOpen = signal(false);
  readonly messages = signal<ChatMessage[]>([]);
  readonly msgCards = signal<Record<string, SpecialistCardDto[]>>({});
  readonly isLoading = signal(false);
  input = '';

  toggle() {
    this.isOpen.update(v => !v);
  }

  goToSpecialist(id: string) {
    this.router.navigate(['/specialists', id]);
    this.isOpen.set(false);
  }

  formatText(text: string): string[] {
    const clean = text
      .replace(/\*\*(.+?)\*\*/g, '$1')
      .replace(/`([^`]+)`/g, '$1')
      .replace(/[*_~#]/g, '')
      .replace(/\[(.+?)\]\(.+?\)/g, '$1');
    return clean.split('\n').filter(l => l.trim());
  }

  send() {
    const text = this.input.trim();
    if (!text || this.isLoading()) return;

    const userMsg: ChatMessage = { role: 'user', content: text };
    const history = this.messages().map(m => ({ role: m.role, content: m.content }));

    this.messages.update(m => [...m, userMsg]);
    this.input = '';
    this.isLoading.set(true);

    this.aiSearchService.chat({ message: text, history }).subscribe({
      next: (res) => {
        const botContent = res.reply;
        const botMsg: ChatMessage = { role: 'assistant', content: botContent };
        this.messages.update(m => [...m, botMsg]);
        if (res.specialists?.length) {
          this.msgCards.update(map => ({ ...map, [botContent]: res.specialists }));
        }
        this.isLoading.set(false);
      },
      error: () => {
        this.messages.update(m => [...m, { role: 'assistant', content: 'عذراً، حدث خطأ. حاول مرة أخرى.' }]);
        this.isLoading.set(false);
      },
    });
  }
}

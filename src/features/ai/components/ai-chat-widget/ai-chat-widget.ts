import { Component, inject, signal, ElementRef, ViewChild, AfterViewChecked } from '@angular/core';
import { Router } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { AiSearchService } from '../../services/ai-search.service';
import { SpecialistCardDto } from '../../contracts/ai-search.contracts';

interface ChatMessage { role: string; content: string; }

@Component({
  selector: 'app-ai-chat-widget',
  imports: [FormsModule],
  template: `
    <!-- FAB BUTTON -->
    @if (!isOpen()) {
      <div class="fab-container">
        <div class="pulse-ring"></div>
        <div class="pulse-ring delay"></div>
        <button (click)="toggle()" class="chat-fab" title="المساعد الذكي">
          <img src="assets/chat.png" alt="Bosla AI" class="bot-image" />
        </button>
      </div>
    }

    <!-- CHAT PANEL -->
    @if (isOpen()) {
      <div class="chat-wrapper">
        <div class="chat-panel" dir="rtl">
          <!-- Header -->
          <div class="chat-header">
            <div class="chat-header-bg"></div>
            <div class="chat-header-content">
              <div class="chat-header-info">
                <div class="chat-avatar-wrapper">
                  <img src="assets/chat.png" alt="Bosla AI" class="bot-image bot-image-sm" />
                  <div class="online-indicator"></div>
                </div>
                <div class="header-text">
                  <div class="chat-header-title">بوصلة</div>
                  <div class="chat-header-sub">مساعدك الذكي المتقدم</div>
                </div>
              </div>
              <button (click)="toggle()" class="chat-close">
                <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                  <line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/>
                </svg>
              </button>
            </div>
          </div>

          <!-- Messages Body -->
          <div class="chat-messages" #messagesContainer>
            @if (messages().length === 0) {
              <div class="chat-welcome animate-in">
                <div class="welcome-orb">
                  <img src="assets/chat.png" alt="Bosla AI" class="welcome-bot-image" />
                </div>
                <h4>مرحباً بك في عالم بوصلة!</h4>
                <p>أنا هنا لمساعدتك في العثور على أفضل الخبراء. بماذا تفكر اليوم؟</p>
              </div>
            }

            @for (msg of messages(); track $index) {
              <div class="msg-wrapper animate-in" [class.user]="msg.role === 'user'">
                @if (msg.role !== 'user') {
                  <img src="assets/chat.png" class="msg-avatar" alt="AI" />
                }
                
                <div class="msg" [class.msg-user]="msg.role === 'user'" [class.msg-bot]="msg.role !== 'user'">
                  @for (line of formatText(msg.content); track $index) {
                    <p>{{ line }}</p>
                  }
                </div>
              </div>

              @let cards = msgCards()[msg.content];
              @if (cards?.length) {
                <div class="cards-row animate-in delay-1">
                  @for (c of cards; track c.id) {
                      <a (click)="goToSpecialist(c.id); $event.preventDefault()" class="specialist-card">
                       <div class="card-glow"></div>
                       <div class="card-content">
                         <div class="card-avatar">
                           <img [src]="c.profileImageUrl?.trim() || 'assets/icons/favicon.ico'" [alt]="c.name"
                             (error)="c.profileImageUrl = undefined" />
                           @if (c.isOnline) { <div class="card-online"></div> }
                         </div>
                         <div class="card-info">
                           <div class="card-name">{{ c.name }}</div>
                           <div class="card-title">{{ c.title || 'متخصص' }}</div>
                            <button (click)="$event.preventDefault(); $event.stopPropagation(); goToBooking(c.id)"
                              class="w-full py-1.5 px-2 rounded-lg text-[11px] font-bold bg-gradient-to-r from-bosla-primary to-bosla-blue text-white hover:shadow-lg transition-all duration-200 cursor-pointer">
                              حجز موعد
                            </button>
                            <div class="card-footer">
                             <span class="card-rating">
                               <i class="fa-solid fa-star text-[#F39C12] text-[10px]"></i>
                               {{ c.rating > 0 ? c.rating : 'جديد' }}
                             </span>
                             <span class="card-rate">{{ c.hourlyRate }} <small>/س</small></span>
                           </div>
                         </div>
                       </div>
                     </a>
                  }
                </div>
              }
            }

            @if (isLoading()) {
              <div class="msg-wrapper animate-in">
                <img src="assets/chat.png" class="msg-avatar" alt="AI" />
                <div class="msg msg-bot typing-indicator">
                  <div class="typing-dot"></div>
                  <div class="typing-dot"></div>
                  <div class="typing-dot"></div>
                </div>
              </div>
            }
          </div>

          <!-- Input Area -->
          <div class="chat-input-wrapper">
            <div class="chat-input">
              <input [(ngModel)]="input" (keyup.enter)="send()"
                placeholder="اكتب رسالتك هنا..." class="chat-input-field" [disabled]="isLoading()" />
              <button (click)="send()" class="chat-send-btn" [disabled]="!input.trim() || isLoading()" [class.active]="input.trim()">
                <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round">
                  <line x1="22" y1="2" x2="11" y2="13"/><polygon points="22 2 15 22 11 13 2 9 22 2"/>
                </svg>
              </button>
            </div>
          </div>
        </div>
      </div>
    }
  `,
  styles: [`
    :host { 
      position: fixed; 
      bottom: 24px; 
      inset-inline-end: 24px; 
      z-index: 9999; 
      font-family: 'Inter', system-ui, sans-serif;
    }

    /* --- FAB Animations & Styles --- */
    .fab-container {
      position: relative;
      width: 72px; height: 72px;
      display: flex; align-items: center; justify-content: center;
    }

    .pulse-ring {
      position: absolute;
      width: 100%; height: 100%;
      background: radial-gradient(circle, rgba(243,156,18,0.4) 0%, rgba(243,156,18,0) 70%);
      border-radius: 50%;
      z-index: -1;
      animation: pulse 2.5s cubic-bezier(0.215, 0.61, 0.355, 1) infinite;
    }
    .pulse-ring.delay {
      animation-delay: 1.25s;
    }

    @keyframes pulse {
      0% { transform: scale(0.9); opacity: 1; }
      100% { transform: scale(1.8); opacity: 0; }
    }

    .chat-fab {
      width: 64px; height: 64px; 
      border-radius: 50%;
      background: transparent;
      border: none;
      cursor: pointer; padding: 0;
      box-shadow: none;
      display: flex; align-items: center; justify-content: center;
      transition: all 0.3s cubic-bezier(0.175, 0.885, 0.32, 1.275);
      position: relative;
    }

    .chat-fab:hover { 
      transform: scale(1.1) translateY(-4px); 
    }



    .bot-image {
      width: 64px; height: 64px;
      border-radius: 50%;
      object-fit: cover;
      animation: floatingFab 4s ease-in-out infinite;
      filter: drop-shadow(0 8px 15px rgba(243,156,18,0.4));
    }
    
    @keyframes floatingFab {
      0%, 100% { transform: translateY(0) rotate(0deg); }
      33% { transform: translateY(-3px) rotate(-4deg); }
      66% { transform: translateY(-1px) rotate(4deg); }
    }

    /* --- Chat Panel Styles --- */
    .chat-wrapper {
      position: absolute;
      bottom: 0; inset-inline-end: 0;
      transform-origin: bottom left;
      animation: popIn 0.4s cubic-bezier(0.175, 0.885, 0.32, 1.275) forwards;
    }

    @keyframes popIn {
      0% { opacity: 0; transform: scale(0.8) translateY(20px); }
      100% { opacity: 1; transform: scale(1) translateY(0); }
    }

    .chat-panel {
      width: min(420px, calc(100vw - 48px));
      height: min(650px, calc(100vh - 120px));
      background: rgba(255, 255, 255, 0.95);
      backdrop-filter: blur(20px);
      -webkit-backdrop-filter: blur(20px);
      border-radius: 28px;
      box-shadow: 0 20px 60px rgba(27,79,114,0.15), 0 0 0 1px rgba(255,255,255,0.5) inset;
      display: flex; flex-direction: column;
      overflow: hidden;
      border: 1px solid rgba(226, 232, 240, 0.8);
    }

    @media (max-width: 480px) {
      :host { bottom: 0; inset-inline-end: 0; }
      .chat-wrapper {
        position: fixed; top: 0; left: 0; right: 0; bottom: 0;
        animation: slideUpMobile 0.3s cubic-bezier(0.2, 0.8, 0.2, 1) forwards;
      }
      .chat-panel {
        width: 100vw; height: 100vh;
        border-radius: 0;
      }
    }
    @keyframes slideUpMobile {
      0% { transform: translateY(100%); }
      100% { transform: translateY(0); }
    }

    /* --- Header --- */
    .chat-header {
      position: relative;
      padding: 20px 24px;
      overflow: hidden;
      flex-shrink: 0;
    }
    .chat-header-bg {
      position: absolute; inset: 0;
      background: linear-gradient(135deg, #1B4F72, #2471A3);
      z-index: 0;
    }
    .chat-header-bg::after {
      content: ''; position: absolute; inset: 0;
      background: url('data:image/svg+xml;utf8,<svg viewBox="0 0 100 100" xmlns="http://www.w3.org/2000/svg"><circle cx="10" cy="10" r="2" fill="white" opacity="0.1"/></svg>') repeat;
      background-size: 20px 20px;
    }
    .chat-header-content {
      position: relative; z-index: 1;
      display: flex; align-items: center; justify-content: space-between;
    }

    .chat-header-info { display: flex; align-items: center; gap: 14px; }
    .chat-avatar-wrapper { position: relative; }
    
    .bot-image-sm {
      width: 46px; height: 46px; 
      border-radius: 50%;
      background: rgba(255,255,255,0.2);
      padding: 2px;
      backdrop-filter: blur(4px);
      box-shadow: 0 4px 12px rgba(0,0,0,0.15);
      animation: floatingHeader 3s ease-in-out infinite;
    }

    @keyframes floatingHeader {
      0%, 100% { transform: translateY(0); }
      50% { transform: translateY(-3px); }
    }

    .online-indicator {
      position: absolute; bottom: 2px; right: 2px;
      width: 12px; height: 12px;
      background: #2ecc71;
      border: 2px solid #1B4F72;
      border-radius: 50%;
      box-shadow: 0 0 0 2px rgba(46, 204, 113, 0.4);
    }

    .header-text { color: #fff; }
    .chat-header-title { font-weight: 800; font-size: 18px; letter-spacing: 0.5px; }
    .chat-header-sub { font-size: 13px; color: rgba(255,255,255,0.85); font-weight: 500; }
    
    .chat-close {
      background: rgba(255,255,255,0.1);
      border: 1px solid rgba(255,255,255,0.2);
      color: #fff; cursor: pointer;
      width: 36px; height: 36px;
      border-radius: 50%;
      display: flex; align-items: center; justify-content: center;
      transition: all 0.2s ease;
      backdrop-filter: blur(4px);
    }
    .chat-close:hover { 
      background: rgba(255,255,255,0.25); 
      transform: rotate(90deg);
    }

    /* --- Messages Area --- */
    .chat-messages {
      flex: 1; overflow-y: auto; padding: 24px;
      display: flex; flex-direction: column; gap: 16px;
      background: #f8fafc;
      scroll-behavior: smooth;
    }
    
    .chat-messages::-webkit-scrollbar { width: 6px; }
    .chat-messages::-webkit-scrollbar-thumb { background: rgba(27,79,114,0.2); border-radius: 10px; }
    
    .animate-in {
      animation: fadeSlideUp 0.4s ease forwards;
      opacity: 0; transform: translateY(10px);
    }
    .delay-1 { animation-delay: 0.1s; }

    @keyframes fadeSlideUp {
      to { opacity: 1; transform: translateY(0); }
    }

    .chat-welcome {
      text-align: center; padding: 40px 20px;
      margin: auto 0;
    }
    .welcome-orb {
      width: 90px; height: 90px; margin: 0 auto 20px;
      background: radial-gradient(circle, rgba(243,156,18,0.15) 0%, rgba(243,156,18,0) 70%);
      display: flex; align-items: center; justify-content: center;
      position: relative;
    }
    .welcome-orb::before {
      content: ''; position: absolute; inset: 10px;
      border-radius: 50%;
      background: rgba(243,156,18,0.1);
      animation: pulseBg 2s infinite alternate;
    }
    @keyframes pulseBg {
      0% { transform: scale(0.9); opacity: 0.5; }
      100% { transform: scale(1.1); opacity: 1; }
    }
    .welcome-bot-image {
      width: 70px; height: 70px; position: relative; z-index: 1;
      filter: drop-shadow(0 10px 15px rgba(243,156,18,0.2));
      animation: floatingBotWelcome 4s ease-in-out infinite;
    }
    @keyframes floatingBotWelcome {
      0%, 100% { transform: translateY(0); }
      50% { transform: translateY(-8px); }
    }
    .chat-welcome h4 { margin: 0 0 8px; font-size: 20px; color: #1B4F72; font-weight: 800; }
    .chat-welcome p { margin: 0; font-size: 15px; color: #64748b; line-height: 1.6; }

    .msg-wrapper {
      display: flex; gap: 10px; align-items: flex-end;
      max-width: 90%;
      align-self: flex-start; /* Default (Bot) to Right side in RTL */
    }
    .msg-wrapper.user { 
      align-self: flex-end; /* User to Left side in RTL */
      flex-direction: row-reverse; 
    }

    .msg-avatar {
      width: 28px; height: 28px; border-radius: 50%;
      box-shadow: 0 2px 8px rgba(0,0,0,0.1);
      margin-bottom: 2px;
    }

    .msg { 
      padding: 14px 18px; border-radius: 20px; 
      font-size: 15px; line-height: 1.6; 
      box-shadow: 0 4px 15px rgba(0,0,0,0.03);
      word-wrap: break-word;
      overflow-wrap: break-word;
      word-break: break-word;
      white-space: pre-wrap;
    }
    .msg p { margin: 0 0 8px; }
    .msg p:last-child { margin: 0; }
    
    .msg-user {
      background: linear-gradient(135deg, #1B4F72, #2980B9); 
      color: #fff;
      border-bottom-left-radius: 4px;
      box-shadow: 0 8px 20px rgba(27,79,114,0.15);
    }
    .msg-bot {
      background: #fff; color: #334155;
      border: 1px solid rgba(226, 232, 240, 0.8);
      border-bottom-right-radius: 4px;
    }

    .typing-indicator {
      display: flex; gap: 6px; padding: 16px 20px;
      align-items: center; justify-content: center;
    }
    .typing-dot {
      width: 6px; height: 6px; border-radius: 50%;
      background: #94a3b8; 
      animation: typingBounce 1.4s infinite ease-in-out both;
    }
    .typing-dot:nth-child(1) { animation-delay: -0.32s; }
    .typing-dot:nth-child(2) { animation-delay: -0.16s; }
    
    @keyframes typingBounce {
      0%, 80%, 100% { transform: scale(0); opacity: 0.5; }
      40% { transform: scale(1); opacity: 1; }
    }

    /* --- Cards Carousel --- */
    .cards-row {
      display: grid;
      grid-template-columns: 1fr 1fr;
      gap: 10px;
      padding: 8px 0 4px;
      margin: 4px 0 12px;
    }

    .specialist-card {
      position: relative;
      background: #fff; border-radius: 16px;
      text-decoration: none; color: inherit;
      display: flex; flex-direction: column; align-items: stretch;
      padding: 12px;
      transition: all 0.3s cubic-bezier(0.175, 0.885, 0.32, 1.275);
      border: 1px solid rgba(226, 232, 240, 0.8);
      cursor: pointer;
    }
    
    .card-glow {
      position: absolute; top: -2px; bottom: -2px; left: -2px; right: -2px;
      border-radius: 18px;
      background: linear-gradient(135deg, #1B4F72, #F39C12);
      opacity: 0; transition: opacity 0.3s;
      z-index: -1;
    }

    .specialist-card:hover .card-glow { opacity: 0.15; }

    .card-content {
      display: flex; flex-direction: column; align-items: center; gap: 8px; width: 100%;
    }

    .card-avatar {
      width: 56px; height: 56px; border-radius: 50%;
      background: #f1f5f9; position: relative; overflow: hidden;
      flex-shrink: 0;
      box-shadow: 0 4px 10px rgba(0,0,0,0.05);
    }
    .card-avatar img { width: 100%; height: 100%; object-fit: cover; }
    .card-online {
      width: 12px; height: 12px; border-radius: 50%;
      background: #2ecc71; border: 2px solid #fff;
      position: absolute; bottom: 1px; inset-inline-end: 1px;
    }

    .card-info { width: 100%; text-align: center; }
    .card-name { font-weight: 800; font-size: 13px; color: #1B4F72; white-space: nowrap; overflow: hidden; text-overflow: ellipsis; }
    .card-title { font-size: 10px; color: #64748b; margin-bottom: 4px; white-space: nowrap; overflow: hidden; text-overflow: ellipsis; }
    .card-footer {
      display: flex; align-items: center; justify-content: space-between; 
      font-size: 11px; font-weight: 600;
      gap: 4px;
    }
    .card-rating { display: flex; align-items: center; gap: 3px; color: #475569; }
    .card-rate { color: #F39C12; background: rgba(243,156,18,0.1); padding: 1px 5px; border-radius: 5px; }

    /* --- Input Area --- */
    .chat-input-wrapper {
      padding: 16px 24px 24px;
      background: #fff;
      border-top: 1px solid rgba(226, 232, 240, 0.8);
      position: relative;
    }
    .chat-input-wrapper::before {
      content: ''; position: absolute; top: -20px; left: 0; right: 0; height: 20px;
      background: linear-gradient(to top, #fff, transparent); pointer-events: none;
    }
    
    .chat-input {
      display: flex; gap: 12px;
      background: #f8fafc;
      padding: 6px 6px 6px 16px;
      border-radius: 100px;
      border: 1px solid #e2e8f0;
      transition: all 0.3s ease;
      box-shadow: inset 0 2px 4px rgba(0,0,0,0.02);
    }
    .chat-input:focus-within {
      border-color: #F39C12; background: #fff;
      box-shadow: 0 0 0 4px rgba(243,156,18,0.1);
    }

    .chat-input-field {
      flex: 1; border: none; background: transparent;
      font-size: 15px; outline: none; color: #334155;
      font-family: inherit;
    }
    .chat-input-field::placeholder { color: #94a3b8; }

    .chat-send-btn {
      width: 48px; height: 48px; border-radius: 50%;
      background: #e2e8f0; color: #94a3b8; border: none;
      cursor: pointer; display: flex; align-items: center; justify-content: center;
      transition: all 0.3s cubic-bezier(0.175, 0.885, 0.32, 1.275);
      flex-shrink: 0;
    }
    .chat-send-btn.active {
      background: linear-gradient(135deg, #F39C12, #E67E22); 
      color: #fff;
      box-shadow: 0 4px 15px rgba(243,156,18,0.4);
    }
    .chat-send-btn.active:hover { 
      transform: scale(1.05) rotate(-10deg); 
      box-shadow: 0 6px 20px rgba(243,156,18,0.6);
    }
    .chat-send-btn:disabled { opacity: 0.5; cursor: not-allowed; }
  `]
})
export class AiChatWidget implements AfterViewChecked {
  private readonly aiSearchService = inject(AiSearchService);
  private readonly router = inject(Router);

  @ViewChild('messagesContainer') private messagesContainer!: ElementRef;

  readonly isOpen = signal(false);
  readonly messages = signal<ChatMessage[]>([]);
  readonly msgCards = signal<Record<string, SpecialistCardDto[]>>({});
  readonly isLoading = signal(false);
  input = '';
  private needsScroll = false;

  toggle() {
    this.isOpen.update(v => !v);
    if (this.isOpen()) {
      this.needsScroll = true;
    }
  }

  ngAfterViewChecked() {
    if (this.needsScroll) {
      this.scrollToBottom();
      this.needsScroll = false;
    }
  }

  private scrollToBottom() {
    if (this.messagesContainer) {
      setTimeout(() => {
        const el = this.messagesContainer.nativeElement;
        el.scrollTo({ top: el.scrollHeight, behavior: 'smooth' });
      }, 50);
    }
  }

  goToSpecialist(id: string) {
    this.router.navigate(['/specialists', id]);
    this.isOpen.set(false);
  }

  goToBooking(id: string) {
    this.router.navigate(['/appointments/book'], { queryParams: { specialistId: id } });
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
    this.needsScroll = true;

    this.aiSearchService.chat({ message: text, history }).subscribe({
      next: (res) => {
        const botContent = res.reply;
        const botMsg: ChatMessage = { role: 'assistant', content: botContent };
        this.messages.update(m => [...m, botMsg]);
        if (res.specialists?.length) {
          this.msgCards.update(map => ({ ...map, [botContent]: res.specialists }));
        }
        this.isLoading.set(false);
        this.needsScroll = true;
      },
      error: () => {
        this.messages.update(m => [...m, { role: 'assistant', content: 'عذراً، حدث خطأ. حاول مرة أخرى.' }]);
        this.isLoading.set(false);
        this.needsScroll = true;
      },
    });
  }
}

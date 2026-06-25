import { Component } from '@angular/core';

@Component({
  selector: 'chat-typing-indicator',
  standalone: true,
  imports: [],
  template: `
    <div class="flex items-end gap-2.5 max-w-[80%] md:max-w-[70%] self-start font-inter py-1" aria-label="Contact is typing" role="status" aria-live="polite">
      <div class="w-8 h-8 rounded-full bg-gradient-to-tr from-bosla-primary to-bosla-blue text-white text-[10px] font-bold flex items-center justify-center shrink-0 shadow-sm select-none" aria-hidden="true">SP</div>
      <div class="px-3.5 py-2 bg-white border border-bosla-primary/10 rounded-2xl rounded-bl-sm shadow-sm flex items-center gap-1 shrink-0" aria-hidden="true">
        <span class="typing-dot"></span>
        <span class="typing-dot"></span>
        <span class="typing-dot"></span>
      </div>
    </div>
  `,
  styleUrl: '../../chat.css',
})
export class TypingIndicator { }

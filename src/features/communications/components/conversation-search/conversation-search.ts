import { Component, input, output } from '@angular/core';

@Component({
  selector: 'chat-conversation-search',
  standalone: true,
  imports: [],
  template: `
    <div class="relative w-full">
      <div class="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-bosla-grey/85">
        <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2">
          <circle cx="11" cy="11" r="8"/><path d="m21 21-4.35-4.35"/>
        </svg>
      </div>
      <input
        id="chat-search"
        type="text"
        class="w-full pl-10 pr-4 py-2.5 text-xs bg-bosla-offwhite border border-bosla-primary/10 rounded-xl text-bosla-charcoal placeholder-bosla-grey/80 focus:outline-none focus:border-bosla-blue focus:ring-4 focus:ring-bosla-blue/5 transition-all font-sans"
        placeholder="ابحث في المحادثات..."
        autocomplete="off"
        [value]="query()"
        (input)="onInput($event)"
        aria-label="Search conversations"
      />
    </div>
  `,
  styleUrl: '../../chat.css',
})
export class ConversationSearch {
  readonly query = input('');
  readonly queryChange = output<string>();

  onInput(event: Event) {
    this.queryChange.emit((event.target as HTMLInputElement).value);
  }
}

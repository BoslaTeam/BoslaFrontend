import { Injectable, inject, signal, computed, effect, untracked } from '@angular/core';
import { ChatSignalrService } from '../services/chat-signalr.service';

export interface UserPresence {
  isOnline: boolean;
  lastSeen: string | null;
}

@Injectable({ providedIn: 'root' })
export class PresenceStore {
  private readonly signalr = inject(ChatSignalrService);

  private readonly presence = signal<Map<string, UserPresence>>(new Map());

  constructor() {
    // ── Incremental updates ──────────────────────────────────────────────────
    // Handles every PresenceChanged pushed by the server after the initial
    // connection. This effect was here before and is kept unchanged.
    effect(() => {
      const payload = this.signalr.presenceChanged();
      if (!payload) return;

      untracked(() => {
        this.presence.update(map => {
          const next = new Map(map);
          next.set(payload.userId, {
            isOnline: payload.isOnline,
            lastSeen: payload.lastSeen,
          });
          return next;
        });
      });
    });

    // ── Initial snapshot ─────────────────────────────────────────────────────
    // Sent by the server exactly once, right after this client connects.
    // Merges all currently-online user IDs into the store WITHOUT clearing it,
    // so any PresenceChanged events that raced ahead are never lost.
    effect(() => {
      const userIds = this.signalr.onlineUsersSnapshot();
      if (!userIds.length) return;

      untracked(() => {
        this.presence.update(map => {
          const next = new Map(map);
          for (const userId of userIds) {
            // Only set to online; never downgrade an entry already in the map.
            if (!next.has(userId)) {
              next.set(userId, { isOnline: true, lastSeen: null });
            } else {
              // User already has an entry — ensure isOnline is true.
              const existing = next.get(userId)!;
              if (!existing.isOnline) {
                next.set(userId, { ...existing, isOnline: true });
              }
            }
          }
          return next;
        });
      });
    });
  }

  isOnline(userId: string): boolean {
    return this.presence().get(userId)?.isOnline ?? false;
  }

  lastSeen(userId: string): string | null {
    return this.presence().get(userId)?.lastSeen ?? null;
  }

  readonly onlineUserIds = computed(() => {
    const result = new Set<string>();
    for (const [userId, state] of this.presence()) {
      if (state.isOnline) {
        result.add(userId);
      }
    }
    return result;
  });
}

import { Component, computed, inject } from '@angular/core';
import { VideoConnectionService } from '../../services/video-connection.service';
import { VideoConnectionState } from '../../models/video-connection-state.enum';

@Component({
  selector: 'app-connection-status-badge',
  standalone: true,
  templateUrl: './connection-status-badge.html',
  styleUrl: './connection-status-badge.css',
})
export class ConnectionStatusBadge {
  private readonly connectionService = inject(VideoConnectionService);

  readonly state = this.connectionService.state;
  readonly label = this.connectionService.label;

  readonly cssClass = computed(() => {
    const s = this.state();
    switch (s) {
      case VideoConnectionState.Connected:
        return 'status-badge--connected';
      case VideoConnectionState.Connecting:
        return 'status-badge--connecting';
      case VideoConnectionState.Reconnecting:
        return 'status-badge--reconnecting';
      case VideoConnectionState.Disconnected:
        return 'status-badge--disconnected';
      case VideoConnectionState.Ended:
        return 'status-badge--ended';
    }
  });

  readonly showDot = computed(() => this.state() !== VideoConnectionState.Ended);
}

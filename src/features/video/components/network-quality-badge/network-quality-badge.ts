import { Component, inject, computed } from '@angular/core';
import { VideoNetworkQualityService } from '../../services/video-network-quality.service';
import { NetworkQuality } from '../../models/network-quality.enum';

@Component({
  selector: 'app-network-quality-badge',
  standalone: true,
  templateUrl: './network-quality-badge.html',
  styleUrl: './network-quality-badge.css',
})
export class NetworkQualityBadge {
  private readonly networkQualityService = inject(VideoNetworkQualityService);

  readonly quality = this.networkQualityService.localQuality;

  readonly label = computed(() => {
    switch (this.quality()) {
      case NetworkQuality.Excellent: return 'ممتاز';
      case NetworkQuality.Good: return 'جيد';
      case NetworkQuality.Poor: return 'متوسط';
      case NetworkQuality.Bad: return 'ضعيف';
      case NetworkQuality.VeryBad: return 'ضعيف جداً';
      default: return 'غير معروف';
    }
  });

  readonly cssClass = computed(() => {
    switch (this.quality()) {
      case NetworkQuality.Excellent: return 'nq-badge--excellent';
      case NetworkQuality.Good: return 'nq-badge--good';
      case NetworkQuality.Poor: return 'nq-badge--poor';
      case NetworkQuality.Bad: return 'nq-badge--bad';
      case NetworkQuality.VeryBad: return 'nq-badge--verybad';
      default: return 'nq-badge--unknown';
    }
  });
}

import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-my-video-sessions',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './my-video-sessions.html',
})
export class MyVideoSessions {
  // Mock data for UI demonstration
  sessions = [
    { id: 'VID-1029', date: new Date(Date.now() - 172800000), duration: '60 دقيقة', specialist: 'أحمد يوسف', topic: 'استشارة تطوير أعمال' },
    { id: 'VID-1035', date: new Date(Date.now() - 432000000), duration: '30 دقيقة', specialist: 'سارة محمد', topic: 'مراجعة خطة تسويقية' },
  ];
}

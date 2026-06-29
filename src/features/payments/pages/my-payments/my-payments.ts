import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-my-payments',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './my-payments.html',
})
export class MyPayments {
  // Mock data for UI demonstration
  payments = [
    { id: 'PAY-1234', date: new Date(), amount: 50, status: 'Completed', description: 'استشارة مع المتخصص أحمد' },
    { id: 'PAY-1235', date: new Date(Date.now() - 86400000), amount: 120, status: 'Completed', description: 'جلسة فيديو لمدة ساعة' },
  ];
}

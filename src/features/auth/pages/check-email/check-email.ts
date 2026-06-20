import { Component, inject } from '@angular/core';
import { ActivatedRoute, RouterLink } from '@angular/router';

@Component({
  selector: 'app-check-email',
  imports: [RouterLink],
  templateUrl: './check-email.html'
})
export class CheckEmail {
  private route = inject(ActivatedRoute);
  email = this.route.snapshot.queryParamMap.get('email') || 'your email';
}

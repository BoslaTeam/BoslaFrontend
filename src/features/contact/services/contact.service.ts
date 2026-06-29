import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '@environments/environment';

export interface ContactMessage {
  name: string;
  email: string;
  subject: string;
  message: string;
}

@Injectable({ providedIn: 'root' })
export class ContactService {
  private http = inject(HttpClient);

  sendMessage(data: ContactMessage): Observable<void> {
    return this.http.post<void>(`${environment.apiBaseUrl}/contact`, data);
  }
}

import { InjectionToken } from '@angular/core';
import { API_CONFIG } from '../config/api.config';

export const API_BASE_URL = new InjectionToken<string>('API_BASE_URL', {
    factory: () => API_CONFIG.baseUrl,
});
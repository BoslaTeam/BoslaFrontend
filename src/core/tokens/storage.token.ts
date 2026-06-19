import { InjectionToken } from '@angular/core';

export const BROWSER_STORAGE = new InjectionToken<Storage>('BROWSER_STORAGE', {
    factory: () => (typeof window !== 'undefined' ? window.localStorage : ({} as Storage)),
});
import { Injectable, PLATFORM_ID, effect, inject, signal } from '@angular/core';
import { isPlatformBrowser } from '@angular/common';
import { BrowserStorageService } from '../services/browser-storage.service';

type Theme = 'light' | 'dark';
const STORAGE_KEY = 'salla-theme';

@Injectable({ providedIn: 'root' })
export class ThemeStore {
  private readonly platformId = inject(PLATFORM_ID);
  private readonly storage = inject(BrowserStorageService);
  private readonly themeSignal = signal<Theme>(this.load());

  readonly theme = this.themeSignal.asReadonly();
  readonly isDark = () => this.themeSignal() === 'dark';

  constructor() {
    effect(() => {
      if (!isPlatformBrowser(this.platformId)) {
        return;
      }

      const theme = this.themeSignal();
      document.documentElement.classList.toggle('dark', theme === 'dark');
      this.storage.write(STORAGE_KEY, theme);
    });
  }

  toggle(): void {
    this.themeSignal.update((t) => (t === 'light' ? 'dark' : 'light'));
  }

  set(theme: Theme): void {
    this.themeSignal.set(theme);
  }

  private load(): Theme {
    const stored = this.storage.read<Theme | null>(STORAGE_KEY, null);
    if (stored === 'light' || stored === 'dark') {
      return stored;
    }

    if (this.storage.isBrowser && window.matchMedia('(prefers-color-scheme: dark)').matches) {
      return 'dark';
    }

    return 'light';
  }
}

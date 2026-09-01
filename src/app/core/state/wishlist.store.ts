import { Injectable, computed, inject, signal } from '@angular/core';
import { BrowserStorageService } from '../services/browser-storage.service';
import { MockAuthStore } from './auth.store';
import { ToastService } from '../services/toast.service';

const STORAGE_KEY = 'salla-wishlist';
const AUTH_TOAST_KEY = 'auth-required';
const AUTH_TOAST_TITLE = 'Sign in to continue';
const AUTH_TOAST_MSG = 'Create an account or sign in to save your favorites and start shopping.';

@Injectable({ providedIn: 'root' })
export class WishlistStore {
  private readonly storage = inject(BrowserStorageService);
  private readonly auth = inject(MockAuthStore);
  private readonly toast = inject(ToastService);

  private readonly idsSignal = signal<string[]>(
    this.storage.read<string[]>(STORAGE_KEY, [])
  );

  readonly ids = this.idsSignal.asReadonly();
  readonly count = computed(() => this.idsSignal().length);

  has(id: string): boolean {
    return this.idsSignal().includes(id);
  }

  toggle(id: string): boolean {
    if (!this.auth.isLoggedIn()) {
      this.toast.success(AUTH_TOAST_MSG, AUTH_TOAST_TITLE, AUTH_TOAST_KEY);
      return false;
    }

    if (this.has(id)) {
      this.idsSignal.update((ids) => ids.filter((i) => i !== id));
    } else {
      this.idsSignal.update((ids) => [...ids, id]);
    }
    this.persist();
    return true;
  }

  remove(id: string): void {
    this.idsSignal.update((ids) => ids.filter((i) => i !== id));
    this.persist();
  }

  private persist(): void {
    this.storage.write(STORAGE_KEY, this.idsSignal());
  }
}

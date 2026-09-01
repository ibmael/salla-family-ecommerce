import { Injectable, computed, inject, signal } from '@angular/core';
import { CartLine } from '../models/order.model';
import { Product } from '../models/product.model';
import { BrowserStorageService } from '../services/browser-storage.service';
import { MockAuthStore } from './auth.store';
import { ToastService } from '../services/toast.service';

const STORAGE_KEY = 'salla-cart';
const AUTH_TOAST_KEY = 'auth-required';
const AUTH_TOAST_TITLE = 'Sign in to continue';
const AUTH_TOAST_MSG = 'Create an account or sign in to save your favorites and start shopping.';

@Injectable({ providedIn: 'root' })
export class CartStore {
  private readonly storage = inject(BrowserStorageService);
  private readonly auth = inject(MockAuthStore);
  private readonly toast = inject(ToastService);

  private readonly linesSignal = signal<CartLine[]>(
    this.storage.read<CartLine[]>(STORAGE_KEY, [])
  );

  readonly lastAddedTimestamp = signal<number>(0);

  readonly lines = this.linesSignal.asReadonly();
  readonly count = computed(() =>
    this.linesSignal().reduce((sum, l) => sum + l.quantity, 0)
  );
  readonly total = computed(() =>
    this.linesSignal().reduce((sum, l) => sum + l.product.price * l.quantity, 0)
  );

  getLineKey(productId: string, size: string, color: string): string {
    return `${productId}-${size}-${color}`;
  }

  has(productId: string, size: string, color: string): boolean {
    const key = this.getLineKey(productId, size, color);
    return this.linesSignal().some((l) => l.key === key);
  }

  toggle(
    product: Product,
    size: string,
    color: string,
    quantity = 1
  ): { action: 'added' | 'removed' } | false {
    if (!this.auth.isLoggedIn()) {
      this.toast.success(AUTH_TOAST_MSG, AUTH_TOAST_TITLE, AUTH_TOAST_KEY);
      return false;
    }

    const key = this.getLineKey(product.id, size, color);
    const existing = this.linesSignal().find((l) => l.key === key);

    if (existing) {
      this.linesSignal.update((lines) => lines.filter((l) => l.key !== key));
      this.toast.success(
        'The item has been removed from your cart.',
        'Removed from your cart',
        `cart-removed-${key}`
      );
      this.persist();
      return { action: 'removed' };
    } else {
      const qty = Math.max(1, quantity);
      this.linesSignal.update((lines) => [
        ...lines,
        { key, product, quantity: qty, size, color },
      ]);
      this.toast.success(
        'Your item is ready when you are.',
        'Added to your cart',
        `cart-added-${key}`
      );
      this.lastAddedTimestamp.set(Date.now());
      this.persist();
      return { action: 'added' };
    }
  }

  add(product: Product, size: string, color: string, quantity = 1): boolean {
    if (!this.auth.isLoggedIn()) {
      this.toast.success(AUTH_TOAST_MSG, AUTH_TOAST_TITLE, AUTH_TOAST_KEY);
      return false;
    }

    const key = this.getLineKey(product.id, size, color);
    const qty = Math.max(1, quantity);
    const existing = this.linesSignal().find((l) => l.key === key);

    if (existing) {
      this.linesSignal.update((lines) =>
        lines.map((l) =>
          l.key === key ? { ...l, quantity: l.quantity + qty } : l
        )
      );
    } else {
      this.linesSignal.update((lines) => [
        ...lines,
        { key, product, quantity: qty, size, color },
      ]);
    }

    this.toast.success(
      'Your item is ready when you are.',
      'Added to your cart',
      `cart-added-${key}`
    );
    this.lastAddedTimestamp.set(Date.now());
    this.persist();
    return true;
  }

  updateQuantity(key: string, quantity: number): void {
    if (quantity <= 0) {
      this.remove(key);
      return;
    }
    this.linesSignal.update((lines) =>
      lines.map((l) => (l.key === key ? { ...l, quantity } : l))
    );
    this.persist();
  }

  remove(key: string): void {
    this.linesSignal.update((lines) => lines.filter((l) => l.key !== key));
    this.persist();
  }

  clear(): void {
    this.linesSignal.set([]);
    this.persist();
  }

  private persist(): void {
    this.storage.write(STORAGE_KEY, this.linesSignal());
  }
}

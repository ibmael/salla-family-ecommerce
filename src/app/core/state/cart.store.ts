import { Injectable, computed, inject, signal } from '@angular/core';
import { CartLine } from '../models/order.model';
import { Product } from '../models/product.model';
import { BrowserStorageService } from '../services/browser-storage.service';

const STORAGE_KEY = 'salla-cart';

@Injectable({ providedIn: 'root' })
export class CartStore {
  private readonly storage = inject(BrowserStorageService);
  private readonly linesSignal = signal<CartLine[]>(this.storage.read<CartLine[]>(STORAGE_KEY, []));

  readonly lines = this.linesSignal.asReadonly();
  readonly count = computed(() => this.linesSignal().reduce((sum, l) => sum + l.quantity, 0));
  readonly total = computed(() => this.linesSignal().reduce((sum, l) => sum + l.product.price * l.quantity, 0));

  add(product: Product, size: string, color: string, quantity = 1): void {
    const key = `${product.id}-${size}-${color}`;
    const existing = this.linesSignal().find((l) => l.key === key);
    if (existing) {
      this.linesSignal.update((lines) =>
        lines.map((l) => (l.key === key ? { ...l, quantity: l.quantity + quantity } : l)),
      );
    } else {
      this.linesSignal.update((lines) => [...lines, { key, product, quantity, size, color }]);
    }
    this.persist();
  }

  updateQuantity(key: string, quantity: number): void {
    if (quantity <= 0) {
      this.remove(key);
      return;
    }
    this.linesSignal.update((lines) => lines.map((l) => (l.key === key ? { ...l, quantity } : l)));
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

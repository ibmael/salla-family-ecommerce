import { Injectable, computed, inject, signal } from '@angular/core';
import { BrowserStorageService } from '../services/browser-storage.service';

const STORAGE_KEY = 'salla-wishlist';

@Injectable({ providedIn: 'root' })
export class WishlistStore {
  private readonly storage = inject(BrowserStorageService);
  private readonly idsSignal = signal<string[]>(this.storage.read<string[]>(STORAGE_KEY, []));

  readonly ids = this.idsSignal.asReadonly();
  readonly count = computed(() => this.idsSignal().length);

  has(id: string): boolean {
    return this.idsSignal().includes(id);
  }

  toggle(id: string): void {
    if (this.has(id)) {
      this.idsSignal.update((ids) => ids.filter((i) => i !== id));
    } else {
      this.idsSignal.update((ids) => [...ids, id]);
    }
    this.persist();
  }

  remove(id: string): void {
    this.idsSignal.update((ids) => ids.filter((i) => i !== id));
    this.persist();
  }

  private persist(): void {
    this.storage.write(STORAGE_KEY, this.idsSignal());
  }
}

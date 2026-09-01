import { Injectable, inject, signal } from '@angular/core';
import { BrowserStorageService } from '../services/browser-storage.service';

const STORAGE_KEY = 'salla-recent';
const MAX_ITEMS = 8;

@Injectable({ providedIn: 'root' })
export class RecentViewsStore {
  private readonly storage = inject(BrowserStorageService);
  private readonly idsSignal = signal<string[]>(this.storage.read<string[]>(STORAGE_KEY, []));

  readonly ids = this.idsSignal.asReadonly();

  add(productId: string): void {
    this.idsSignal.update((ids) => {
      const filtered = ids.filter((id) => id !== productId);
      return [productId, ...filtered].slice(0, MAX_ITEMS);
    });
    this.persist();
  }

  private persist(): void {
    this.storage.write(STORAGE_KEY, this.idsSignal());
  }
}

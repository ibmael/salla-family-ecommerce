import { Injectable, signal } from '@angular/core';

export interface ToastMessage {
  id: number;
  key?: string;
  title: string;
  message: string;
  exiting?: boolean;
}

@Injectable({ providedIn: 'root' })
export class ToastService {
  private counter = 0;
  readonly messages = signal<ToastMessage[]>([]);

  success(message: string, title = 'Success', key?: string): void {
    // Deduplicate: if a toast with the same key is already visible, skip
    if (key && this.messages().some((t) => t.key === key && !t.exiting)) {
      return;
    }

    const id = ++this.counter;
    this.messages.update((items) => [...items, { id, key, title, message }]);
    setTimeout(() => this.animateOut(id), 3000);
  }

  dismiss(id: number): void {
    this.animateOut(id);
  }

  private animateOut(id: number): void {
    // Mark as exiting for exit animation
    const current = this.messages();
    if (!current.find((t) => t.id === id)) return;

    this.messages.update((items) =>
      items.map((t) => (t.id === id ? { ...t, exiting: true } : t))
    );

    // Remove after exit animation completes
    setTimeout(() => {
      this.messages.update((items) => items.filter((t) => t.id !== id));
    }, 220);
  }
}

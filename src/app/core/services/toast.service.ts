import { Injectable, signal } from '@angular/core';

export interface ToastMessage {
  id: number;
  key?: string;
  type?: 'success' | 'error' | 'info';
  title: string;
  message: string;
  exiting?: boolean;
}

@Injectable({ providedIn: 'root' })
export class ToastService {
  private counter = 0;
  readonly messages = signal<ToastMessage[]>([]);

  success(message: string, title = 'Success', key?: string): void {
    if (key && this.messages().some((t) => t.key === key && !t.exiting)) {
      return;
    }

    const id = ++this.counter;
    this.messages.update((items) => [...items, { id, key, type: 'success', title, message }]);
    setTimeout(() => this.animateOut(id), 3000);
  }

  error(message: string, title = 'Error', key?: string): void {
    if (key && this.messages().some((t) => t.key === key && !t.exiting)) {
      return;
    }

    const id = ++this.counter;
    this.messages.update((items) => [...items, { id, key, type: 'error', title, message }]);
    setTimeout(() => this.animateOut(id), 4000);
  }

  info(message: string, title = 'Notice', key?: string): void {
    if (key && this.messages().some((t) => t.key === key && !t.exiting)) {
      return;
    }

    const id = ++this.counter;
    this.messages.update((items) => [...items, { id, key, type: 'info', title, message }]);
    setTimeout(() => this.animateOut(id), 3500);
  }

  dismiss(id: number): void {
    this.animateOut(id);
  }

  private animateOut(id: number): void {
    const current = this.messages();
    if (!current.find((t) => t.id === id)) return;

    this.messages.update((items) =>
      items.map((t) => (t.id === id ? { ...t, exiting: true } : t))
    );

    setTimeout(() => {
      this.messages.update((items) => items.filter((t) => t.id !== id));
    }, 220);
  }
}

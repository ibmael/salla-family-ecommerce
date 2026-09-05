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
    this.show('success', message, title, key, 3000);
  }

  error(message: string, title = 'Error', key?: string): void {
    this.show('error', message, title, key, 4000);
  }

  info(message: string, title = 'Notice', key?: string): void {
    this.show('info', message, title, key, 3500);
  }

  private show(type: 'success' | 'error' | 'info', message: string, title: string, key?: string, duration = 3000): void {
    if (key && this.messages().some((t) => t.key === key && !t.exiting)) {
      return;
    }

    const id = ++this.counter;
    this.messages.update((items) => [...items, { id, key, type, title, message }]);
    setTimeout(() => this.animateOut(id), duration);
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

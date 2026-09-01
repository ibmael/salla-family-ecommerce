import { Injectable, signal } from '@angular/core';

export interface ToastMessage {
  id: number;
  title: string;
  message: string;
}

@Injectable({ providedIn: 'root' })
export class ToastService {
  private counter = 0;
  readonly messages = signal<ToastMessage[]>([]);

  success(message: string, title = 'Success'): void {
    const id = ++this.counter;
    this.messages.update((items) => [...items, { id, title, message }]);
    setTimeout(() => this.dismiss(id), 3000);
  }

  dismiss(id: number): void {
    this.messages.update((items) => items.filter((t) => t.id !== id));
  }
}

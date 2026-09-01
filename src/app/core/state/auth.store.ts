import { Injectable, computed, inject, signal } from '@angular/core';
import { User } from '../models/user.model';
import { MockAuthRepository } from '../repositories/mock-orders.repository';
import { BrowserStorageService } from '../services/browser-storage.service';

const STORAGE_KEY = 'salla-auth';

@Injectable({ providedIn: 'root' })
export class MockAuthStore {
  private readonly storage = inject(BrowserStorageService);
  private readonly repo = new MockAuthRepository();
  private readonly userSignal = signal<User | null>(this.storage.read<User | null>(STORAGE_KEY, null));

  readonly user = this.userSignal.asReadonly();
  readonly isLoggedIn = computed(() => !!this.userSignal());
  readonly isAdmin = computed(() => this.userSignal()?.role === 'admin');

  login(email: string): void {
    this.repo.login(email).subscribe((user) => {
      this.userSignal.set(user);
      this.storage.write(STORAGE_KEY, user);
    });
  }

  logout(): void {
    this.repo.logout().subscribe(() => {
      this.userSignal.set(null);
      this.storage.remove(STORAGE_KEY);
    });
  }
}

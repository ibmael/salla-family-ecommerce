import { Injectable, computed, inject, signal } from '@angular/core';
import { Observable, tap, throwError } from 'rxjs';
import {
  ChangePasswordPayload,
  LoginCredentials,
  ProfileUpdatePayload,
  SignUpPayload,
  User,
} from '../models/user.model';
import { AUTH_REPOSITORY } from '../repositories/repository.tokens';
import { BrowserStorageService } from '../services/browser-storage.service';

const STORAGE_KEY = 'salla-auth';

@Injectable({ providedIn: 'root' })
export class MockAuthStore {
  private readonly storage = inject(BrowserStorageService);
  private readonly repo = inject(AUTH_REPOSITORY);
  private readonly userSignal = signal<User | null>(
    this.storage.read<User | null>(STORAGE_KEY, null)
  );

  readonly user = this.userSignal.asReadonly();
  readonly isLoggedIn = computed(() => !!this.userSignal());
  readonly isAdmin = computed(() => this.userSignal()?.role === 'admin');

  login(credentials: LoginCredentials): Observable<User> {
    return this.repo.login(credentials).pipe(
      tap((user) => {
        this.userSignal.set(user);
        this.storage.write(STORAGE_KEY, user);
      })
    );
  }

  signUp(payload: SignUpPayload): Observable<User> {
    return this.repo.signUp(payload).pipe(
      tap((user) => {
        this.userSignal.set(user);
        this.storage.write(STORAGE_KEY, user);
      })
    );
  }

  updateProfile(payload: ProfileUpdatePayload): Observable<User> {
    const current = this.userSignal();
    if (!current) {
      return throwError(() => new Error('Not authenticated'));
    }

    return this.repo.updateProfile(current.id, payload).pipe(
      tap((updated) => {
        this.userSignal.set(updated);
        this.storage.write(STORAGE_KEY, updated);
      })
    );
  }

  uploadAvatar(avatarDataUrl: string): Observable<User> {
    const current = this.userSignal();
    if (!current) {
      return throwError(() => new Error('Not authenticated'));
    }

    return this.updateProfile({
      name: current.name,
      username: current.username,
      email: current.email,
      phoneNumber: current.phoneNumber,
      avatar: avatarDataUrl,
    });
  }

  removeAvatar(): Observable<User> {
    const current = this.userSignal();
    if (!current) {
      return throwError(() => new Error('Not authenticated'));
    }

    return this.updateProfile({
      name: current.name,
      username: current.username,
      email: current.email,
      phoneNumber: current.phoneNumber,
      avatar: '',
    });
  }

  changePassword(payload: ChangePasswordPayload): Observable<void> {
    const current = this.userSignal();
    if (!current) {
      return throwError(() => new Error('Not authenticated'));
    }

    return this.repo.changePassword(current.id, payload);
  }

  logout(): void {
    this.repo.logout().subscribe(() => {
      this.userSignal.set(null);
      this.storage.remove(STORAGE_KEY);
    });
  }
}

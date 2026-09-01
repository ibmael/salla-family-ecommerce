import { Injectable, inject } from '@angular/core';
import { Observable, of, throwError } from 'rxjs';
import {
  ChangePasswordPayload,
  LoginCredentials,
  ProfileUpdatePayload,
  SignUpPayload,
  User,
} from '../models/user.model';
import { BrowserStorageService } from '../services/browser-storage.service';
import { AuthRepository } from './repository.tokens';

/**
 * Internal representation for mock persistence only.
 * Passwords are never exposed outside of this mock repository.
 */
interface InternalStoredUser extends User {
  passwordHash: string;
}

const USERS_STORAGE_KEY = 'salla-mock-users';

const INITIAL_USERS: InternalStoredUser[] = [
  {
    id: 'admin-1',
    email: 'admin@salla.studio',
    username: 'admin',
    name: 'Admin User',
    phoneNumber: '+1 (555) 019-2834',
    role: 'admin',
    passwordHash: 'admin123!',
    createdAt: '2025-01-01',
  },
  {
    id: 'user-1',
    email: 'hello@salla.studio',
    username: 'sarah',
    name: 'Sarah Mitchell',
    phoneNumber: '+1 (555) 012-3456',
    role: 'customer',
    passwordHash: 'password123',
    createdAt: '2025-11-10',
  },
];

@Injectable({ providedIn: 'root' })
export class MockAuthRepository implements AuthRepository {
  private readonly storage = inject(BrowserStorageService);
  private users: InternalStoredUser[] = this.loadUsers();
  private activeUser: User | null = null;

  private loadUsers(): InternalStoredUser[] {
    const saved = this.storage.read<InternalStoredUser[] | null>(USERS_STORAGE_KEY, null);
    if (saved && Array.isArray(saved) && saved.length > 0) {
      return saved;
    }
    this.storage.write(USERS_STORAGE_KEY, INITIAL_USERS);
    return [...INITIAL_USERS];
  }

  private saveUsers(): void {
    this.storage.write(USERS_STORAGE_KEY, this.users);
  }

  private sanitizeUser(stored: InternalStoredUser): User {
    const { passwordHash, ...user } = stored;
    return user;
  }

  login(credentials: LoginCredentials): Observable<User> {
    const identifier = credentials.identifier.trim().toLowerCase();
    const user = this.users.find(
      (u) =>
        u.email.toLowerCase() === identifier ||
        u.username.toLowerCase() === identifier
    );

    if (!user || user.passwordHash !== credentials.password) {
      return throwError(() => new Error('Invalid email/username or password.'));
    }

    const sanitized = this.sanitizeUser(user);
    this.activeUser = sanitized;
    return of(sanitized);
  }

  signUp(payload: SignUpPayload): Observable<User> {
    const email = payload.email.trim().toLowerCase();
    const username = payload.username.trim().toLowerCase();

    if (this.users.some((u) => u.email.toLowerCase() === email)) {
      return throwError(() => new Error('An account with this email address already exists.'));
    }

    if (this.users.some((u) => u.username.toLowerCase() === username)) {
      return throwError(() => new Error('This username is already taken.'));
    }

    if (payload.password.length < 8) {
      return throwError(() => new Error('Password must be at least 8 characters long.'));
    }

    const isAdmin = email.includes('admin') || username.includes('admin');
    const newUser: InternalStoredUser = {
      id: `user-${Date.now()}`,
      name: payload.name.trim(),
      username: payload.username.trim(),
      email: payload.email.trim(),
      phoneNumber: payload.phoneNumber.trim(),
      role: isAdmin ? 'admin' : 'customer',
      passwordHash: payload.password,
      createdAt: new Date().toISOString().split('T')[0],
    };

    this.users = [newUser, ...this.users];
    this.saveUsers();

    const sanitized = this.sanitizeUser(newUser);
    this.activeUser = sanitized;
    return of(sanitized);
  }

  updateProfile(userId: string, payload: ProfileUpdatePayload): Observable<User> {
    const userIndex = this.users.findIndex((u) => u.id === userId);
    if (userIndex === -1) {
      return throwError(() => new Error('User not found.'));
    }

    const email = payload.email.trim().toLowerCase();
    const username = payload.username.trim().toLowerCase();

    const conflict = this.users.find(
      (u) =>
        u.id !== userId &&
        (u.email.toLowerCase() === email || u.username.toLowerCase() === username)
    );

    if (conflict) {
      if (conflict.email.toLowerCase() === email) {
        return throwError(() => new Error('This email is already in use by another account.'));
      }
      if (conflict.username.toLowerCase() === username) {
        return throwError(() => new Error('This username is already taken.'));
      }
    }

    const current = this.users[userIndex];
    const updated: InternalStoredUser = {
      ...current,
      name: payload.name.trim(),
      username: payload.username.trim(),
      email: payload.email.trim(),
      phoneNumber: payload.phoneNumber?.trim() || undefined,
      avatar: payload.avatar !== undefined ? payload.avatar : current.avatar,
    };

    this.users[userIndex] = updated;
    this.saveUsers();

    const sanitized = this.sanitizeUser(updated);
    this.activeUser = sanitized;
    return of(sanitized);
  }

  changePassword(userId: string, payload: ChangePasswordPayload): Observable<void> {
    const userIndex = this.users.findIndex((u) => u.id === userId);
    if (userIndex === -1) {
      return throwError(() => new Error('User not found.'));
    }

    const current = this.users[userIndex];
    if (current.passwordHash !== payload.currentPassword) {
      return throwError(() => new Error('Current password is incorrect.'));
    }

    if (payload.newPassword.length < 8) {
      return throwError(() => new Error('New password must be at least 8 characters long.'));
    }

    this.users[userIndex] = {
      ...current,
      passwordHash: payload.newPassword,
    };
    this.saveUsers();

    return of(void 0);
  }

  logout(): Observable<void> {
    this.activeUser = null;
    return of(void 0);
  }

  currentUser(): Observable<User | null> {
    return of(this.activeUser);
  }
}

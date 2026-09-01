/**
 * MockCustomerRepository
 *
 * SOURCE OF TRUTH STRATEGY:
 * --------------------------
 * The real source of registered users is MockAuthRepository which persists
 * to 'salla-mock-users' localStorage. This is where sign-ups land.
 *
 * MOCK_CUSTOMERS in orders.mock.ts represents supplementary demo customer
 * records (cust-1..cust-10) that correspond to the expanded order dataset.
 * Most mock orders use userId values like 'cust-2', 'cust-7' etc. which
 * do NOT exist in the auth user store — they exist only in MOCK_CUSTOMERS.
 *
 * This repository MERGES both sources:
 *   1. Auth users (from salla-mock-users) — real registered accounts
 *   2. MOCK_CUSTOMERS supplement — demo records for order history
 *
 * Deduplication: if a MOCK_CUSTOMERS entry shares an email with an auth
 * user, the auth user record wins (it has more authoritative data).
 *
 * Order metrics are DERIVED in-memory from OrderRepository.
 * Passwords are NEVER exposed — we read from salla-mock-users but strip
 * passwordHash before building CustomerProfile DTOs.
 *
 * Dashboard KPI consistency:
 * MockAdminRepository.dashboardStats().customers now delegates to
 * MockCustomerRepository.count() so the number always matches.
 */

import { Injectable, inject } from '@angular/core';
import { Observable, of } from 'rxjs';
import { BrowserStorageService } from '../services/browser-storage.service';
import { Order } from '../models/order.model';
import { MOCK_CUSTOMERS } from '../../data/mocks/orders.mock';
import { CustomerProfile, CustomerRepository } from './repository.tokens';

const USERS_STORAGE_KEY = 'salla-mock-users';

/** Minimal shape we need from the stored user — never exposing auth secrets */
interface StoredUserMinimal {
  id:           string;
  name:         string;
  email:        string;
  username:     string;
  phoneNumber?: string;
  avatar?:      string;
  createdAt?:   string;
  role:         string;
  passwordHash: string; // present in storage but stripped before building profile
}

@Injectable({ providedIn: 'root' })
export class MockCustomerRepository implements CustomerRepository {
  private readonly storage = inject(BrowserStorageService);

  // ── Build unified customer list ────────────────────────────────────────────
  private buildRawCustomers(): { id: string; name: string; email: string; username: string; phoneNumber?: string; avatar?: string; createdAt?: string }[] {
    // 1. Auth-registered users (strip passwordHash)
    const storedUsers = this.storage.read<StoredUserMinimal[]>(USERS_STORAGE_KEY, []);
    const authCustomers = storedUsers
      .filter((u) => u.role === 'customer')
      .map(({ passwordHash, role, ...safe }) => safe);

    const seenEmails = new Set(authCustomers.map((u) => u.email.toLowerCase()));

    // 2. MOCK_CUSTOMERS supplement — skip entries whose email is already in auth
    const mockExtras = MOCK_CUSTOMERS
      .filter((c) => !seenEmails.has(c.email.toLowerCase()))
      .map((c) => ({
        id:          c.id,
        name:        c.name,
        email:       c.email,
        username:    c.email.split('@')[0],
        phoneNumber: undefined,
        avatar:      undefined,
        createdAt:   c.joinedAt,
      }));

    return [...authCustomers, ...mockExtras];
  }

  // ── Derive order metrics ───────────────────────────────────────────────────
  private deriveMetrics(customerId: string, orders: Order[]): {
    orderCount:   number;
    totalSpent:   number;
    lastOrderAt?: string;
  } {
    const customerOrders = orders.filter((o) => o.userId === customerId);
    const activeOrders   = customerOrders.filter((o) => o.status !== 'cancelled');

    const totalSpent = activeOrders.reduce((sum, o) => sum + o.total, 0);
    const lastOrderAt = customerOrders.length
      ? customerOrders
          .map((o) => o.createdAt)
          .sort((a, b) => b.localeCompare(a))[0]
      : undefined;

    return {
      orderCount: customerOrders.length,
      totalSpent,
      lastOrderAt,
    };
  }

  // ── Build CustomerProfile ─────────────────────────────────────────────────
  private buildProfile(
    raw: { id: string; name: string; email: string; username: string; phoneNumber?: string; avatar?: string; createdAt?: string },
    orders: Order[],
  ): CustomerProfile {
    const metrics = this.deriveMetrics(raw.id, orders);
    return {
      ...raw,
      segment:    metrics.orderCount >= 2 ? 'repeat' : 'new',
      orderCount: metrics.orderCount,
      totalSpent: metrics.totalSpent,
      lastOrderAt: metrics.lastOrderAt,
    };
  }

  // ── Public API ─────────────────────────────────────────────────────────────

  list(): Observable<CustomerProfile[]> {
    const rawCustomers = this.buildRawCustomers();

    // Read all orders once — derive metrics in-memory (no N+1)
    const ordersRaw = this.storage.read<Order[]>('salla-mock-orders', []);

    const profiles = rawCustomers.map((raw) => this.buildProfile(raw, ordersRaw));
    return of(profiles);
  }

  byId(id: string): Observable<CustomerProfile | undefined> {
    const rawCustomers = this.buildRawCustomers();
    const raw = rawCustomers.find((c) => c.id === id);
    if (!raw) return of(undefined);

    const ordersRaw = this.storage.read<Order[]>('salla-mock-orders', []);
    return of(this.buildProfile(raw, ordersRaw));
  }

  ordersByCustomer(customerId: string): Observable<Order[]> {
    const ordersRaw = this.storage.read<Order[]>('salla-mock-orders', []);
    return of(ordersRaw.filter((o) => o.userId === customerId));
  }

  count(): Observable<number> {
    return of(this.buildRawCustomers().length);
  }
}

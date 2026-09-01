import { Injectable } from '@angular/core';
import { Observable, of } from 'rxjs';
import { MOCK_AUDIT_LOGS, MOCK_CUSTOMERS, MOCK_ORDERS } from '../../data/mocks/orders.mock';
import { MOCK_PRODUCTS } from '../../data/mocks/catalog.mock';
import { Order } from '../models/order.model';
import { AdminRepository, AuthRepository, OrderRepository } from './repository.tokens';
import { AuditLog, Customer, User } from '../models/user.model';

@Injectable({ providedIn: 'root' })
export class MockOrderRepository implements OrderRepository {
  private orders = [...MOCK_ORDERS];

  list(userId?: string): Observable<Order[]> {
    const data = userId ? this.orders.filter((o) => o.userId === userId) : this.orders;
    return of(data);
  }

  byId(id: string): Observable<Order | undefined> {
    return of(this.orders.find((o) => o.id === id));
  }

  create(order: Omit<Order, 'id' | 'createdAt'>): Observable<Order> {
    const created: Order = {
      ...order,
      id: `ord-${Date.now()}`,
      createdAt: new Date().toISOString().split('T')[0],
    };
    this.orders = [created, ...this.orders];
    return of(created);
  }
}

@Injectable({ providedIn: 'root' })
export class MockAuthRepository implements AuthRepository {
  private user: User | null = null;

  login(email: string): Observable<User> {
    const isAdmin = email.toLowerCase().includes('admin');
    this.user = {
      id: isAdmin ? 'admin-1' : 'user-1',
      email,
      name: isAdmin ? 'Admin User' : email.split('@')[0],
      role: isAdmin ? 'admin' : 'customer',
    };
    return of(this.user);
  }

  logout(): Observable<void> {
    this.user = null;
    return of(void 0);
  }

  currentUser(): Observable<User | null> {
    return of(this.user);
  }
}

@Injectable({ providedIn: 'root' })
export class MockAdminRepository implements AdminRepository {
  dashboardStats(): Observable<{ revenue: number; orders: number; customers: number; products: number }> {
    const revenue = MOCK_ORDERS.reduce((sum, o) => sum + o.total, 0);
    return of({
      revenue,
      orders: MOCK_ORDERS.length,
      customers: MOCK_CUSTOMERS.length,
      products: MOCK_PRODUCTS.length,
    });
  }

  customers(): Observable<Customer[]> {
    return of(MOCK_CUSTOMERS);
  }

  auditLogs(): Observable<AuditLog[]> {
    return of(MOCK_AUDIT_LOGS);
  }
}

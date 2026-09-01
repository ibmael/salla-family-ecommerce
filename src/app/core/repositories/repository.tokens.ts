import { InjectionToken } from '@angular/core';
import { Observable } from 'rxjs';
import { Category, PagedResult, Product, ProductFilters, Review } from '../models/product.model';
import { Order, OrderStatus } from '../models/order.model';
import {
  AuditLog,
  ChangePasswordPayload,
  Customer,
  LoginCredentials,
  ProfileUpdatePayload,
  SignUpPayload,
  User,
} from '../models/user.model';

/**
 * Sanitized customer profile for Admin views.
 * Never includes auth credentials (passwordHash, tokens etc.)
 * All order metrics are DERIVED in-memory from OrderRepository data.
 */
export interface CustomerProfile {
  id:           string;
  name:         string;
  email:        string;
  username:     string;
  phoneNumber?: string;
  avatar?:      string;
  createdAt?:   string;
  /** Derived segment based on order count — NOT persisted */
  segment:      'new' | 'repeat';
  /** All historical orders count (including cancelled) */
  orderCount:   number;
  /** Revenue from non-cancelled orders only */
  totalSpent:   number;
  /** ISO string of last order createdAt, or undefined */
  lastOrderAt?: string;
}

export interface ProductRepository {
  list(filters?: ProductFilters): Observable<PagedResult<Product>>;
  byId(id: string): Observable<Product | undefined>;
  bySlug(slug: string): Observable<Product | undefined>;
  featured(): Observable<Product[]>;
  trending(): Observable<Product[]>;
  deals(): Observable<Product[]>;
  related(productId: string): Observable<Product[]>;
  reviews(productId: string): Observable<Review[]>;
  create(product: Omit<Product, 'id' | 'rating' | 'reviews'>): Observable<Product>;
  update(id: string, updates: Partial<Product>): Observable<Product>;
  delete(id: string): Observable<boolean>;
}

export interface CategoryRepository {
  list(): Observable<Category[]>;
  bySlug(slug: string): Observable<Category | undefined>;
  create(category: Omit<Category, 'id' | 'productCount'>): Observable<Category>;
  update(id: string, updates: Partial<Category>): Observable<Category>;
  delete(id: string): Observable<boolean>;
}

export interface OrderRepository {
  list(userId?: string): Observable<Order[]>;
  byId(id: string): Observable<Order | undefined>;
  create(order: Omit<Order, 'id' | 'createdAt'>): Observable<Order>;
  updateStatus(id: string, status: OrderStatus, note?: string): Observable<Order>;
  cancelOrder(id: string, reason?: string): Observable<Order>;
}

export interface AuthRepository {
  login(credentials: LoginCredentials): Observable<User>;
  signUp(payload: SignUpPayload): Observable<User>;
  updateProfile(userId: string, payload: ProfileUpdatePayload): Observable<User>;
  changePassword(userId: string, payload: ChangePasswordPayload): Observable<void>;
  logout(): Observable<void>;
  currentUser(): Observable<User | null>;
}

export interface AdminRepository {
  dashboardStats(): Observable<{ revenue: number; orders: number; customers: number; products: number }>;
  customers(): Observable<Customer[]>;
  auditLogs(): Observable<AuditLog[]>;
}

export interface CustomerRepository {
  /** All customer profiles with derived order metrics */
  list(): Observable<CustomerProfile[]>;
  /** Single customer by ID with derived metrics */
  byId(id: string): Observable<CustomerProfile | undefined>;
  /** All orders belonging to a customer */
  ordersByCustomer(customerId: string): Observable<Order[]>;
  /** Total customer count — used by dashboard KPI */
  count(): Observable<number>;
}

export const PRODUCT_REPOSITORY  = new InjectionToken<ProductRepository>('ProductRepository');
export const CATEGORY_REPOSITORY = new InjectionToken<CategoryRepository>('CategoryRepository');
export const ORDER_REPOSITORY    = new InjectionToken<OrderRepository>('OrderRepository');
export const AUTH_REPOSITORY     = new InjectionToken<AuthRepository>('AuthRepository');
export const ADMIN_REPOSITORY    = new InjectionToken<AdminRepository>('AdminRepository');
export const CUSTOMER_REPOSITORY = new InjectionToken<CustomerRepository>('CustomerRepository');

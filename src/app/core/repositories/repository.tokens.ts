import { InjectionToken } from '@angular/core';
import { Observable } from 'rxjs';
import { Category, PagedResult, Product, ProductFilters, Review } from '../models/product.model';
import { Order } from '../models/order.model';
import {
  AuditLog,
  ChangePasswordPayload,
  Customer,
  LoginCredentials,
  ProfileUpdatePayload,
  SignUpPayload,
  User,
} from '../models/user.model';

export interface ProductRepository {
  list(filters?: ProductFilters): Observable<PagedResult<Product>>;
  byId(id: string): Observable<Product | undefined>;
  bySlug(slug: string): Observable<Product | undefined>;
  featured(): Observable<Product[]>;
  trending(): Observable<Product[]>;
  deals(): Observable<Product[]>;
  related(productId: string): Observable<Product[]>;
  reviews(productId: string): Observable<Review[]>;
}

export interface CategoryRepository {
  list(): Observable<Category[]>;
  bySlug(slug: string): Observable<Category | undefined>;
}

export interface OrderRepository {
  list(userId?: string): Observable<Order[]>;
  byId(id: string): Observable<Order | undefined>;
  create(order: Omit<Order, 'id' | 'createdAt'>): Observable<Order>;
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

export const PRODUCT_REPOSITORY = new InjectionToken<ProductRepository>('ProductRepository');
export const CATEGORY_REPOSITORY = new InjectionToken<CategoryRepository>('CategoryRepository');
export const ORDER_REPOSITORY = new InjectionToken<OrderRepository>('OrderRepository');
export const AUTH_REPOSITORY = new InjectionToken<AuthRepository>('AuthRepository');
export const ADMIN_REPOSITORY = new InjectionToken<AdminRepository>('AdminRepository');

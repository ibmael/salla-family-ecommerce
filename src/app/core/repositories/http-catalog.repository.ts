import { Injectable } from '@angular/core';
import { Observable, throwError } from 'rxjs';
import { environment } from '../../../environments/environment';
import { Category, PagedResult, Product, ProductFilters, Review } from '../models/product.model';
import { CategoryRepository, ProductRepository } from './repository.tokens';

/** Placeholder HTTP implementation — swap in app.config when ASP.NET Core API is ready. */
@Injectable()
export class HttpProductRepository implements ProductRepository {
  private base = `${environment.apiUrl}/products`;

  list(_filters?: ProductFilters): Observable<PagedResult<Product>> {
    return throwError(() => new Error(`HttpProductRepository not implemented. Connect to ${this.base}`));
  }

  byId(_id: string): Observable<Product | undefined> {
    return throwError(() => new Error('HttpProductRepository not implemented'));
  }

  bySlug(_slug: string): Observable<Product | undefined> {
    return throwError(() => new Error('HttpProductRepository not implemented'));
  }

  featured(): Observable<Product[]> {
    return throwError(() => new Error('HttpProductRepository not implemented'));
  }

  trending(): Observable<Product[]> {
    return throwError(() => new Error('HttpProductRepository not implemented'));
  }

  deals(): Observable<Product[]> {
    return throwError(() => new Error('HttpProductRepository not implemented'));
  }

  related(_productId: string): Observable<Product[]> {
    return throwError(() => new Error('HttpProductRepository not implemented'));
  }

  reviews(_productId: string): Observable<Review[]> {
    return throwError(() => new Error('HttpProductRepository not implemented'));
  }

  create(_product: Omit<Product, 'id' | 'rating' | 'reviews'>): Observable<Product> {
    return throwError(() => new Error('HttpProductRepository not implemented'));
  }

  update(_id: string, _updates: Partial<Product>): Observable<Product> {
    return throwError(() => new Error('HttpProductRepository not implemented'));
  }

  delete(_id: string): Observable<boolean> {
    return throwError(() => new Error('HttpProductRepository not implemented'));
  }
}

@Injectable()
export class HttpCategoryRepository implements CategoryRepository {
  list(): Observable<Category[]> {
    return throwError(() => new Error('HttpCategoryRepository not implemented'));
  }

  bySlug(_slug: string): Observable<Category | undefined> {
    return throwError(() => new Error('HttpCategoryRepository not implemented'));
  }

  create(_category: Omit<Category, 'id' | 'productCount'>): Observable<Category> {
    return throwError(() => new Error('HttpCategoryRepository not implemented'));
  }

  update(_id: string, _updates: Partial<Category>): Observable<Category> {
    return throwError(() => new Error('HttpCategoryRepository not implemented'));
  }

  delete(_id: string): Observable<boolean> {
    return throwError(() => new Error('HttpCategoryRepository not implemented'));
  }
}

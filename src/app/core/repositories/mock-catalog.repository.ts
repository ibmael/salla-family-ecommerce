import { Injectable } from '@angular/core';
import { Observable, of } from 'rxjs';
import { MOCK_CATEGORIES, MOCK_PRODUCTS, MOCK_REVIEWS } from '../../data/mocks/catalog.mock';
import { Category, PagedResult, Product, ProductFilters, Review } from '../models/product.model';
import { CategoryRepository, ProductRepository } from './repository.tokens';

function applyFilters(products: Product[], filters: ProductFilters = {}): Product[] {
  let result = [...products];

  if (filters.query) {
    const q = filters.query.toLowerCase();
    result = result.filter(
      (p) =>
        p.name.toLowerCase().includes(q) ||
        p.description.toLowerCase().includes(q) ||
        p.category.toLowerCase().includes(q),
    );
  }

  if (filters.categoryId) {
    result = result.filter((p) => p.categoryId === filters.categoryId);
  }

  if (filters.onSale) {
    result = result.filter((p) => !!p.originalPrice);
  }

  if (filters.minPrice != null) {
    result = result.filter((p) => p.price >= filters.minPrice!);
  }

  if (filters.maxPrice != null) {
    result = result.filter((p) => p.price <= filters.maxPrice!);
  }

  switch (filters.sort) {
    case 'price-asc':
      result.sort((a, b) => a.price - b.price);
      break;
    case 'price-desc':
      result.sort((a, b) => b.price - a.price);
      break;
    case 'rating':
      result.sort((a, b) => b.rating - a.rating);
      break;
    case 'newest':
      result.reverse();
      break;
    default:
      result.sort((a, b) => Number(b.featured) - Number(a.featured));
  }

  return result;
}

function paginate<T>(items: T[], page = 1, pageSize = 12): PagedResult<T> {
  const total = items.length;
  const totalPages = Math.max(1, Math.ceil(total / pageSize));
  const start = (page - 1) * pageSize;
  return {
    items: items.slice(start, start + pageSize),
    total,
    page,
    pageSize,
    totalPages,
  };
}

@Injectable({ providedIn: 'root' })
export class MockProductRepository implements ProductRepository {
  list(filters: ProductFilters = {}): Observable<PagedResult<Product>> {
    const filtered = applyFilters(MOCK_PRODUCTS, filters);
    return of(paginate(filtered, filters.page ?? 1, filters.pageSize ?? 12));
  }

  byId(id: string): Observable<Product | undefined> {
    return of(MOCK_PRODUCTS.find((p) => p.id === id));
  }

  bySlug(slug: string): Observable<Product | undefined> {
    return of(MOCK_PRODUCTS.find((p) => p.slug === slug));
  }

  featured(): Observable<Product[]> {
    return of(MOCK_PRODUCTS.filter((p) => p.featured));
  }

  trending(): Observable<Product[]> {
    return of(MOCK_PRODUCTS.filter((p) => p.trending));
  }

  deals(): Observable<Product[]> {
    return of(MOCK_PRODUCTS.filter((p) => p.originalPrice));
  }

  related(productId: string): Observable<Product[]> {
    const product = MOCK_PRODUCTS.find((p) => p.id === productId);
    if (!product) return of([]);
    return of(
      MOCK_PRODUCTS.filter((p) => p.id !== productId && p.categoryId === product.categoryId).slice(0, 4),
    );
  }

  reviews(productId: string): Observable<Review[]> {
    return of(MOCK_REVIEWS.filter((r) => r.productId === productId));
  }
}

@Injectable({ providedIn: 'root' })
export class MockCategoryRepository implements CategoryRepository {
  list(): Observable<Category[]> {
    return of(MOCK_CATEGORIES);
  }

  bySlug(slug: string): Observable<Category | undefined> {
    return of(MOCK_CATEGORIES.find((c) => c.slug === slug));
  }
}

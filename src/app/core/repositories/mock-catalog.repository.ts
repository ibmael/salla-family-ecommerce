import { Injectable, inject } from '@angular/core';
import { Observable, of } from 'rxjs';
import { MOCK_CATEGORIES, MOCK_PRODUCTS, MOCK_REVIEWS } from '../../data/mocks/catalog.mock';
import { Category, PagedResult, Product, ProductFilters, Review } from '../models/product.model';
import { CategoryRepository, ProductRepository } from './repository.tokens';
import { BrowserStorageService } from '../services/browser-storage.service';
import { AuditLogService } from '../services/audit-log.service';

const CATEGORIES_STORAGE_KEY = 'salla-mock-categories';
const PRODUCTS_STORAGE_KEY = 'salla-mock-products';

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
    result = result.filter((p) => p.originalPrice != null && p.originalPrice > p.price);
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
  private readonly storage = inject(BrowserStorageService);
  private readonly audit   = inject(AuditLogService);
  private products: Product[] = this.loadProducts();

  private loadProducts(): Product[] {
    const saved = this.storage.read<Product[] | null>(PRODUCTS_STORAGE_KEY, null);
    if (saved && Array.isArray(saved) && saved.length > 0) {
      return saved;
    }
    this.storage.write(PRODUCTS_STORAGE_KEY, MOCK_PRODUCTS);
    return [...MOCK_PRODUCTS];
  }

  private save(): void {
    this.storage.write(PRODUCTS_STORAGE_KEY, this.products);
  }

  list(filters: ProductFilters = {}): Observable<PagedResult<Product>> {
    const filtered = applyFilters(this.products, filters);
    return of(paginate(filtered, filters.page ?? 1, filters.pageSize ?? 12));
  }

  byId(id: string): Observable<Product | undefined> {
    return of(this.products.find((p) => p.id === id));
  }

  bySlug(slug: string): Observable<Product | undefined> {
    return of(this.products.find((p) => p.slug === slug));
  }

  featured(): Observable<Product[]> {
    return of(this.products.filter((p) => p.featured));
  }

  trending(): Observable<Product[]> {
    return of(this.products.filter((p) => p.trending));
  }

  deals(): Observable<Product[]> {
    return of(this.products.filter((p) => p.originalPrice != null && p.originalPrice > p.price));
  }

  related(productId: string): Observable<Product[]> {
    const product = this.products.find((p) => p.id === productId);
    if (!product) return of([]);
    return of(
      this.products.filter((p) => p.id !== productId && p.categoryId === product.categoryId).slice(0, 4),
    );
  }

  reviews(productId: string): Observable<Review[]> {
    return of(MOCK_REVIEWS.filter((r) => r.productId === productId));
  }

  create(product: Omit<Product, 'id' | 'rating' | 'reviews'>): Observable<Product> {
    const newProduct: Product = {
      ...product,
      id: `p-${Date.now()}`,
      rating: 5.0,
      reviews: 0,
    };
    this.products = [newProduct, ...this.products];
    this.save();
    this.audit.record({
      action: 'Product Created',
      entityType: 'product',
      entityId: newProduct.id,
      entityLabel: newProduct.name,
      metadata: { category: newProduct.category, price: newProduct.price },
    });
    return of(newProduct);
  }

  update(id: string, updates: Partial<Product>): Observable<Product> {
    const index = this.products.findIndex((p) => p.id === id);
    if (index === -1) {
      throw new Error(`Product #${id} not found.`);
    }
    const prev = this.products[index];
    const updated: Product = { ...prev, ...updates, id };
    this.products[index] = updated;
    this.save();
    const changed: Record<string, string | number | boolean> = {};
    for (const key of Object.keys(updates) as (keyof Product)[]) {
      if (key !== 'id' && prev[key] !== updated[key]) {
        changed[`${key}_from`] = String(prev[key] ?? '');
        changed[`${key}_to`]   = String(updated[key] ?? '');
      }
    }
    this.audit.record({
      action: 'Product Updated',
      entityType: 'product',
      entityId: id,
      entityLabel: updated.name,
      metadata: Object.keys(changed).length ? changed : undefined,
    });
    return of(updated);
  }

  delete(id: string): Observable<boolean> {
    const target = this.products.find((p) => p.id === id);
    const initLen = this.products.length;
    this.products = this.products.filter((p) => p.id !== id);
    if (this.products.length !== initLen) {
      this.save();
      this.audit.record({
        action: 'Product Deleted',
        entityType: 'product',
        entityId: id,
        entityLabel: target?.name,
      });
      return of(true);
    }
    return of(false);
  }
}

@Injectable({ providedIn: 'root' })
export class MockCategoryRepository implements CategoryRepository {
  private readonly storage = inject(BrowserStorageService);
  private readonly audit   = inject(AuditLogService);
  private categories: Category[] = this.loadCategories();

  private loadCategories(): Category[] {
    const saved = this.storage.read<Category[] | null>(CATEGORIES_STORAGE_KEY, null);
    if (saved && Array.isArray(saved) && saved.length > 0) {
      return saved;
    }
    this.storage.write(CATEGORIES_STORAGE_KEY, MOCK_CATEGORIES);
    return [...MOCK_CATEGORIES];
  }

  private save(): void {
    this.storage.write(CATEGORIES_STORAGE_KEY, this.categories);
  }

  private getLiveProducts(): Product[] {
    const saved = this.storage.read<Product[] | null>(PRODUCTS_STORAGE_KEY, null);
    return saved && Array.isArray(saved) ? saved : MOCK_PRODUCTS;
  }

  list(): Observable<Category[]> {
    const products = this.getLiveProducts();
    const items = this.categories.map((c) => {
      const count = products.filter(
        (p) => p.categoryId === c.id || p.category.toLowerCase() === c.name.toLowerCase(),
      ).length;
      return { ...c, productCount: count };
    });
    return of(items);
  }

  bySlug(slug: string): Observable<Category | undefined> {
    const found = this.categories.find((c) => c.slug === slug);
    if (!found) return of(undefined);
    const products = this.getLiveProducts();
    const count = products.filter(
      (p) => p.categoryId === found.id || p.category.toLowerCase() === found.name.toLowerCase(),
    ).length;
    return of({ ...found, productCount: count });
  }

  create(category: Omit<Category, 'id' | 'productCount'>): Observable<Category> {
    const newCat: Category = {
      ...category,
      id: `cat-${Date.now()}`,
      productCount: 0,
    };
    this.categories = [...this.categories, newCat];
    this.save();
    this.audit.record({
      action: 'Category Created',
      entityType: 'category',
      entityId: newCat.id,
      entityLabel: newCat.name,
    });
    return of(newCat);
  }

  update(id: string, updates: Partial<Category>): Observable<Category> {
    const index = this.categories.findIndex((c) => c.id === id);
    if (index === -1) {
      throw new Error(`Category with ID ${id} not found.`);
    }
    const updated: Category = { ...this.categories[index], ...updates, id };
    this.categories[index] = updated;
    this.save();
    this.audit.record({
      action: 'Category Updated',
      entityType: 'category',
      entityId: id,
      entityLabel: updated.name,
    });
    return of(updated);
  }

  delete(id: string): Observable<boolean> {
    const target = this.categories.find((c) => c.id === id);
    const initialLen = this.categories.length;
    this.categories = this.categories.filter((c) => c.id !== id);
    if (this.categories.length !== initialLen) {
      this.save();
      this.audit.record({
        action: 'Category Deleted',
        entityType: 'category',
        entityId: id,
        entityLabel: target?.name,
      });
      return of(true);
    }
    return of(false);
  }
}

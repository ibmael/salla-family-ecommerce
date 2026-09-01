import {
  ChangeDetectionStrategy,
  Component,
  computed,
  inject,
  signal,
} from '@angular/core';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { toSignal } from '@angular/core/rxjs-interop';
import {
  LucideAngularModule,
  Plus,
  Search,
  Edit2,
  Trash2,
  Package,
  Upload,
  X,
  AlertTriangle,
  Star,
  Tag,
  Check,
  Image,
  ChevronDown,
} from 'lucide-angular';
import {
  CATEGORY_REPOSITORY,
  PRODUCT_REPOSITORY,
} from '../../../core/repositories/repository.tokens';
import { Category, Product } from '../../../core/models/product.model';
import { ToastService } from '../../../core/services/toast.service';

type ProductSortOption = 'name-asc' | 'name-desc' | 'price-asc' | 'price-desc' | 'rating-desc';

@Component({
  selector: 'app-admin-products',
  standalone: true,
  imports: [ReactiveFormsModule, LucideAngularModule],
  templateUrl: './products.component.html',
  styleUrl: './products.component.css',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class AdminProductsComponent {
  private readonly productRepo = inject(PRODUCT_REPOSITORY);
  private readonly catRepo = inject(CATEGORY_REPOSITORY);
  private readonly fb = inject(FormBuilder);
  private readonly toast = inject(ToastService);

  private readonly refreshTrigger = signal<number>(0);

  readonly searchQuery = signal<string>('');
  readonly selectedCategory = signal<string>('all');
  readonly dealsOnly = signal<boolean>(false);
  readonly selectedSort = signal<ProductSortOption>('name-asc');

  readonly isModalOpen = signal<boolean>(false);
  readonly isDeleteModalOpen = signal<boolean>(false);
  readonly editingProduct = signal<Product | null>(null);
  readonly productToDelete = signal<Product | null>(null);
  readonly imagePreview = signal<string>('');

  readonly categories = toSignal(this.catRepo.list(), { initialValue: [] });
  readonly rawProductResult = toSignal(this.productRepo.list({ pageSize: 100 }), {
    initialValue: { items: [], total: 0, page: 1, pageSize: 100, totalPages: 1 },
  });

  readonly allProducts = computed<Product[]>(() => {
    this.refreshTrigger();
    return this.rawProductResult().items;
  });

  readonly filteredProducts = computed<Product[]>(() => {
    let list = [...this.allProducts()];
    const query = this.searchQuery().trim().toLowerCase();
    const catId = this.selectedCategory();
    const isDeals = this.dealsOnly();
    const sort = this.selectedSort();

    // 1. Filter by Category
    if (catId !== 'all') {
      list = list.filter((p) => p.categoryId === catId || p.category.toLowerCase() === catId.toLowerCase());
    }

    // 2. Filter by Deals Only (compare-at price > price)
    if (isDeals) {
      list = list.filter((p) => p.originalPrice != null && p.originalPrice > p.price);
    }

    // 3. Filter by Search Query
    if (query) {
      list = list.filter(
        (p) =>
          p.name.toLowerCase().includes(query) ||
          p.slug.toLowerCase().includes(query) ||
          p.category.toLowerCase().includes(query) ||
          p.description?.toLowerCase().includes(query),
      );
    }

    // 4. Sort
    switch (sort) {
      case 'name-asc':
        list.sort((a, b) => a.name.localeCompare(b.name));
        break;
      case 'name-desc':
        list.sort((a, b) => b.name.localeCompare(a.name));
        break;
      case 'price-asc':
        list.sort((a, b) => a.price - b.price);
        break;
      case 'price-desc':
        list.sort((a, b) => b.price - a.price);
        break;
      case 'rating-desc':
        list.sort((a, b) => b.rating - a.rating);
        break;
    }

    return list;
  });

  readonly form = this.fb.group({
    name: ['', [Validators.required, Validators.minLength(2)]],
    slug: ['', [Validators.required, Validators.minLength(2)]],
    description: ['', [Validators.required]],
    categoryId: ['', [Validators.required]],
    price: [0, [Validators.required, Validators.min(0.01)]],
    originalPrice: [null as number | null],
    image: ['', [Validators.required]],
    sizes: ['XS, S, M, L, XL'],
    colors: ['Sand, Oat, Charcoal'],
    inStock: [true],
    featured: [false],
    trending: [false],
  });

  readonly icons = {
    Plus,
    Search,
    Edit2,
    Trash2,
    Package,
    Upload,
    X,
    AlertTriangle,
    Star,
    Tag,
    Check,
    Image,
    ChevronDown,
  };

  onSearch(event: Event): void {
    const input = event.target as HTMLInputElement;
    this.searchQuery.set(input.value);
  }

  setCategoryFilter(event: Event): void {
    const select = event.target as HTMLSelectElement;
    this.selectedCategory.set(select.value);
  }

  toggleDealsOnly(): void {
    this.dealsOnly.update((v) => !v);
  }

  setSort(event: Event): void {
    const select = event.target as HTMLSelectElement;
    this.selectedSort.set(select.value as ProductSortOption);
  }

  generateSlug(name: string): string {
    const base = name
      .toLowerCase()
      .trim()
      .replace(/[^a-z0-9]+/g, '-')
      .replace(/^-+|-+$/g, '');

    const editing = this.editingProduct();
    const existing = this.allProducts();

    // Check collision with other products
    let slug = base;
    let counter = 2;
    while (existing.some((p) => p.slug === slug && (!editing || p.id !== editing.id))) {
      slug = `${base}-${counter++}`;
    }
    return slug;
  }

  onNameChange(): void {
    if (!this.editingProduct()) {
      const name = this.form.get('name')?.value || '';
      this.form.patchValue({ slug: this.generateSlug(name) });
    }
  }

  openAddModal(): void {
    this.editingProduct.set(null);
    this.imagePreview.set('');
    const firstCat = this.categories()[0];
    this.form.reset({
      name: '',
      slug: '',
      description: '',
      categoryId: firstCat?.id || '',
      price: 0,
      originalPrice: null,
      image: '',
      sizes: 'XS, S, M, L, XL',
      colors: 'Sand, Oatmeal, Charcoal',
      inStock: true,
      featured: false,
      trending: false,
    });
    this.isModalOpen.set(true);
  }

  openEditModal(product: Product): void {
    this.editingProduct.set(product);
    this.imagePreview.set(product.image || '');
    this.form.reset({
      name: product.name,
      slug: product.slug,
      description: product.description || '',
      categoryId: product.categoryId || '',
      price: product.price,
      originalPrice: product.originalPrice ?? null,
      image: product.image,
      sizes: product.sizes?.join(', ') || 'One Size',
      colors: product.colors?.join(', ') || 'Neutral',
      inStock: product.inStock ?? true,
      featured: product.featured ?? false,
      trending: product.trending ?? false,
    });
    this.isModalOpen.set(true);
  }

  closeModal(): void {
    this.isModalOpen.set(false);
    this.editingProduct.set(null);
    this.imagePreview.set('');
  }

  onImageFileSelected(event: Event): void {
    const file = (event.target as HTMLInputElement).files?.[0];
    if (!file) return;

    if (file.size > 4 * 1024 * 1024) {
      this.toast.error('Image must be under 4MB in size.', 'File too large');
      return;
    }

    const reader = new FileReader();
    reader.onload = () => {
      const base64 = reader.result as string;
      this.imagePreview.set(base64);
      this.form.patchValue({ image: base64 });
      this.form.get('image')?.markAsDirty();
    };
    reader.readAsDataURL(file);
  }

  saveProduct(): void {
    if (this.form.invalid) {
      this.form.markAllAsTouched();
      return;
    }

    const val = this.form.getRawValue();
    const editing = this.editingProduct();

    const selectedCat = this.categories().find((c) => c.id === val.categoryId);
    const categoryName = selectedCat?.name || 'Curated';

    const sizesArr = (val.sizes || '')
      .split(',')
      .map((s) => s.trim())
      .filter(Boolean);
    const colorsArr = (val.colors || '')
      .split(',')
      .map((c) => c.trim())
      .filter(Boolean);

    const price = Number(val.price);
    const originalPrice = val.originalPrice ? Number(val.originalPrice) : undefined;

    const payload: Omit<Product, 'id' | 'rating' | 'reviews'> = {
      name: val.name!,
      slug: val.slug!,
      description: val.description || '',
      category: categoryName,
      categoryId: val.categoryId!,
      price,
      originalPrice: originalPrice && originalPrice > price ? originalPrice : undefined,
      image: val.image!,
      images: [val.image!],
      sizes: sizesArr.length ? sizesArr : ['One Size'],
      colors: colorsArr.length ? colorsArr : ['Neutral'],
      inStock: val.inStock ?? true,
      featured: val.featured ?? false,
      trending: val.trending ?? false,
      tags: [
        ...(val.featured ? ['featured'] : []),
        ...(val.trending ? ['trending'] : []),
        ...(originalPrice && originalPrice > price ? ['sale', 'deal'] : []),
      ],
    };

    if (editing) {
      this.productRepo.update(editing.id, payload).subscribe({
        next: () => {
          this.toast.success(`Product "${payload.name}" updated successfully.`, 'Product Updated');
          this.refreshProducts();
          this.closeModal();
        },
        error: (err) => {
          this.toast.error(err.message || 'Failed to update product.', 'Error');
        },
      });
    } else {
      this.productRepo.create(payload).subscribe({
        next: (created) => {
          this.toast.success(`Product "${created.name}" created successfully.`, 'Product Created');
          this.refreshProducts();
          this.closeModal();
        },
        error: (err) => {
          this.toast.error(err.message || 'Failed to create product.', 'Error');
        },
      });
    }
  }

  confirmDelete(product: Product): void {
    this.productToDelete.set(product);
    this.isDeleteModalOpen.set(true);
  }

  closeDeleteModal(): void {
    this.isDeleteModalOpen.set(false);
    this.productToDelete.set(null);
  }

  deleteProduct(): void {
    const p = this.productToDelete();
    if (!p) return;

    this.productRepo.delete(p.id).subscribe({
      next: () => {
        this.toast.success(`Product "${p.name}" deleted.`, 'Product Deleted');
        this.refreshProducts();
        this.closeDeleteModal();
      },
      error: () => {
        this.toast.error('Failed to delete product.', 'Error');
      },
    });
  }

  private refreshProducts(): void {
    this.productRepo.list({ pageSize: 100 }).subscribe();
    this.refreshTrigger.update((v) => v + 1);
  }
}

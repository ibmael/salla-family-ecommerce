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
  FolderTree,
  Upload,
  X,
  AlertTriangle,
  Image,
} from 'lucide-angular';
import { CATEGORY_REPOSITORY } from '../../../core/repositories/repository.tokens';
import { Category } from '../../../core/models/product.model';
import { ToastService } from '../../../core/services/toast.service';

@Component({
  selector: 'app-admin-categories',
  standalone: true,
  imports: [ReactiveFormsModule, LucideAngularModule],
  templateUrl: './categories.component.html',
  styleUrl: './categories.component.css',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class AdminCategoriesComponent {
  private readonly catRepo = inject(CATEGORY_REPOSITORY);
  private readonly fb = inject(FormBuilder);
  private readonly toast = inject(ToastService);

  private readonly refreshTrigger = signal<number>(0);

  readonly searchQuery = signal<string>('');
  readonly isModalOpen = signal<boolean>(false);
  readonly isDeleteModalOpen = signal<boolean>(false);
  readonly editingCategory = signal<Category | null>(null);
  readonly categoryToDelete = signal<Category | null>(null);
  readonly imagePreview = signal<string>('');

  readonly categories = toSignal(this.catRepo.list(), { initialValue: [] });

  readonly filteredCategories = computed<Category[]>(() => {
    this.refreshTrigger();
    const list = this.categories();
    const query = this.searchQuery().trim().toLowerCase();
    if (!query) return list;
    return list.filter(
      (c) =>
        c.name.toLowerCase().includes(query) ||
        c.slug.toLowerCase().includes(query) ||
        c.description?.toLowerCase().includes(query),
    );
  });

  readonly form = this.fb.group({
    name: ['', [Validators.required, Validators.minLength(2)]],
    slug: ['', [Validators.required, Validators.minLength(2)]],
    description: [''],
    image: ['', [Validators.required]],
  });

  readonly icons = {
    Plus,
    Search,
    Edit2,
    Trash2,
    FolderTree,
    Upload,
    X,
    AlertTriangle,
    Image,
  };

  onSearch(event: Event): void {
    const input = event.target as HTMLInputElement;
    this.searchQuery.set(input.value);
  }

  generateSlug(name: string): string {
    return name
      .toLowerCase()
      .trim()
      .replace(/[^a-z0-9]+/g, '-')
      .replace(/^-+|-+$/g, '');
  }

  onNameChange(): void {
    if (!this.editingCategory()) {
      const name = this.form.get('name')?.value || '';
      this.form.patchValue({ slug: this.generateSlug(name) });
    }
  }

  openAddModal(): void {
    this.editingCategory.set(null);
    this.imagePreview.set('');
    this.form.reset({
      name: '',
      slug: '',
      description: '',
      image: '',
    });
    this.isModalOpen.set(true);
  }

  openEditModal(category: Category): void {
    this.editingCategory.set(category);
    this.imagePreview.set(category.image || '');
    this.form.reset({
      name: category.name,
      slug: category.slug,
      description: category.description || '',
      image: category.image,
    });
    this.isModalOpen.set(true);
  }

  closeModal(): void {
    this.isModalOpen.set(false);
    this.editingCategory.set(null);
    this.imagePreview.set('');
  }

  onImageFileSelected(event: Event): void {
    const file = (event.target as HTMLInputElement).files?.[0];
    if (!file) return;

    // Validate size (max 4MB)
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

  saveCategory(): void {
    if (this.form.invalid) {
      this.form.markAllAsTouched();
      return;
    }

    const val = this.form.getRawValue();
    const editing = this.editingCategory();

    if (editing) {
      this.catRepo
        .update(editing.id, {
          name: val.name!,
          slug: val.slug!,
          description: val.description || '',
          image: val.image!,
        })
        .subscribe({
          next: () => {
            this.toast.success(`Category "${val.name}" updated successfully.`, 'Category Updated');
            this.refreshCategories();
            this.closeModal();
          },
          error: (err) => {
            this.toast.error(err.message || 'Failed to update category.', 'Error');
          },
        });
    } else {
      this.catRepo
        .create({
          name: val.name!,
          slug: val.slug!,
          description: val.description || '',
          image: val.image!,
        })
        .subscribe({
          next: (created) => {
            this.toast.success(`Category "${created.name}" created successfully.`, 'Category Created');
            this.refreshCategories();
            this.closeModal();
          },
          error: (err) => {
            this.toast.error(err.message || 'Failed to create category.', 'Error');
          },
        });
    }
  }

  confirmDelete(category: Category): void {
    if (category.productCount > 0) {
      this.toast.error(
        `"${category.name}" contains ${category.productCount} products and cannot be deleted until those products are moved or removed.`,
        'Category in Use',
      );
      return;
    }
    this.categoryToDelete.set(category);
    this.isDeleteModalOpen.set(true);
  }

  closeDeleteModal(): void {
    this.isDeleteModalOpen.set(false);
    this.categoryToDelete.set(null);
  }

  deleteCategory(): void {
    const cat = this.categoryToDelete();
    if (!cat) return;

    this.catRepo.delete(cat.id).subscribe({
      next: () => {
        this.toast.success(`Category "${cat.name}" deleted.`, 'Category Deleted');
        this.refreshCategories();
        this.closeDeleteModal();
      },
      error: () => {
        this.toast.error('Failed to delete category.', 'Error');
      },
    });
  }

  private refreshCategories(): void {
    this.catRepo.list().subscribe();
    this.refreshTrigger.update((v) => v + 1);
  }
}

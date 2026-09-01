import { ChangeDetectionStrategy, Component, inject } from '@angular/core';
import { RouterLink } from '@angular/router';
import { toSignal } from '@angular/core/rxjs-interop';
import { LucideAngularModule, ArrowRight } from 'lucide-angular';
import { CATEGORY_REPOSITORY } from '../../../core/repositories/repository.tokens';
import { BreadcrumbsComponent, BreadcrumbItem } from '../../../shared/ui/breadcrumbs/breadcrumbs.component';

@Component({
  selector: 'app-categories',
  imports: [RouterLink, LucideAngularModule, BreadcrumbsComponent],
  templateUrl: './categories.component.html',
  styleUrl: './categories.component.css',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class CategoriesComponent {
  private readonly categoryRepo = inject(CATEGORY_REPOSITORY);

  readonly categories = toSignal(this.categoryRepo.list(), { initialValue: [] });
  readonly icons = { ArrowRight };

  readonly breadcrumbs: BreadcrumbItem[] = [
    { label: 'Home', url: '/' },
    { label: 'Categories' },
  ];
}

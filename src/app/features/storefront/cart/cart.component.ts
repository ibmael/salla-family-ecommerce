import { ChangeDetectionStrategy, Component, inject } from '@angular/core';
import { RouterLink } from '@angular/router';
import { LucideAngularModule, Trash2 } from 'lucide-angular';
import { CartStore } from '../../../core/state/cart.store';
import { BreadcrumbsComponent, BreadcrumbItem } from '../../../shared/ui/breadcrumbs/breadcrumbs.component';

@Component({
  selector: 'app-cart',
  imports: [RouterLink, BreadcrumbsComponent, LucideAngularModule],
  templateUrl: './cart.component.html',
  styleUrl: './cart.component.css',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class CartComponent {
  readonly cart = inject(CartStore);
  readonly icons = { Trash2 };

  readonly breadcrumbs: BreadcrumbItem[] = [
    { label: 'Home', url: '/' },
    { label: 'Cart' },
  ];
}

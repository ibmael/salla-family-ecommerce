import { ChangeDetectionStrategy, Component, inject } from '@angular/core';
import { toSignal } from '@angular/core/rxjs-interop';
import { PRODUCT_REPOSITORY } from '../../../core/repositories/repository.tokens';

@Component({
  selector: 'app-admin-products',
  templateUrl: './products.component.html',
  styleUrl: './products.component.css',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class AdminProductsComponent {
  private readonly productRepo = inject(PRODUCT_REPOSITORY);
  readonly products = toSignal(this.productRepo.list({ pageSize: 50 }), {
    initialValue: { items: [], total: 0, page: 1, pageSize: 50, totalPages: 1 },
  });
}

import { ChangeDetectionStrategy, Component, inject } from '@angular/core';
import { toSignal } from '@angular/core/rxjs-interop';
import { ADMIN_REPOSITORY } from '../../../core/repositories/repository.tokens';

@Component({
  selector: 'app-admin-customers',
  templateUrl: './customers.component.html',
  styleUrl: './customers.component.css',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class AdminCustomersComponent {
  private readonly adminRepo = inject(ADMIN_REPOSITORY);
  readonly customers = toSignal(this.adminRepo.customers(), { initialValue: [] });
}

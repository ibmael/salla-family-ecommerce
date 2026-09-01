import { ChangeDetectionStrategy, Component, inject } from '@angular/core';
import { Router, RouterLink } from '@angular/router';
import { MockAuthStore } from '../../../core/state/auth.store';

@Component({
  selector: 'app-account',
  imports: [RouterLink],
  templateUrl: './account.component.html',
  styleUrl: './account.component.css',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class AccountComponent {
  private readonly router = inject(Router);
  readonly auth = inject(MockAuthStore);

  signOut(): void {
    this.auth.logout();
    this.router.navigate(['/auth']);
  }
}

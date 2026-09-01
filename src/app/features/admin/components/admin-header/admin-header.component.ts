import {
  ChangeDetectionStrategy,
  Component,
  computed,
  inject,
  output,
} from '@angular/core';
import { RouterLink } from '@angular/router';
import {
  LucideAngularModule,
  Menu,
  Bell,
  Store,
  ExternalLink,
  Shield,
} from 'lucide-angular';
import { MockAuthStore } from '../../../../core/state/auth.store';

@Component({
  selector: 'app-admin-header',
  standalone: true,
  imports: [RouterLink, LucideAngularModule],
  templateUrl: './admin-header.component.html',
  styleUrl: './admin-header.component.css',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class AdminHeaderComponent {
  readonly auth = inject(MockAuthStore);
  readonly toggleSidebar = output<void>();

  readonly icons = {
    Menu,
    Bell,
    Store,
    ExternalLink,
    Shield,
  };

  readonly userInitials = computed<string>(() => {
    const user = this.auth.user();
    if (!user) return 'AD';
    if (user.name) {
      const parts = user.name.trim().split(/\s+/);
      if (parts.length >= 2) {
        return `${parts[0][0]}${parts[1][0]}`.toUpperCase();
      }
      return user.name.slice(0, 2).toUpperCase();
    }
    return user.username.slice(0, 2).toUpperCase();
  });
}

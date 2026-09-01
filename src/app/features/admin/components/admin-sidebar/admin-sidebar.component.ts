import {
  ChangeDetectionStrategy,
  Component,
  inject,
  output,
} from '@angular/core';
import { Router, RouterLink, RouterLinkActive } from '@angular/router';
import {
  LucideAngularModule,
  LayoutDashboard,
  Package,
  ShoppingBag,
  Users,
  Tags,
  Store,
  User,
  LogOut,
  X,
  FileText,
} from 'lucide-angular';
import { MockAuthStore } from '../../../../core/state/auth.store';
import { ASSETS } from '../../../../core/constants/assets';

@Component({
  selector: 'app-admin-sidebar',
  standalone: true,
  imports: [RouterLink, RouterLinkActive, LucideAngularModule],
  templateUrl: './admin-sidebar.component.html',
  styleUrl: './admin-sidebar.component.css',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class AdminSidebarComponent {
  readonly auth = inject(MockAuthStore);
  private readonly router = inject(Router);

  readonly closeDrawer = output<void>();

  readonly logoUrl = ASSETS.logo;

  readonly icons = {
    LayoutDashboard,
    Package,
    ShoppingBag,
    Users,
    Tags,
    Store,
    User,
    LogOut,
    X,
    FileText,
  };

  onNavClick(): void {
    this.closeDrawer.emit();
  }

  onSignOut(): void {
    this.auth.logout();
    this.closeDrawer.emit();
    this.router.navigate(['/auth']);
  }
}

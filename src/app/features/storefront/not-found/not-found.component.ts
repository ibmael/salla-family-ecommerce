import { ChangeDetectionStrategy, Component } from '@angular/core';
import { RouterLink } from '@angular/router';
import {
  LucideAngularModule,
  ShoppingBag,
  Package,
  Search,
  ArrowRight,
  Sparkles,
  ArrowLeft,
} from 'lucide-angular';

@Component({
  selector: 'app-not-found',
  imports: [RouterLink, LucideAngularModule],
  templateUrl: './not-found.component.html',
  styleUrl: './not-found.component.css',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class NotFoundComponent {
  readonly icons = {
    ShoppingBag,
    Package,
    Search,
    ArrowRight,
    ArrowLeft,
    Sparkles,
  };
}

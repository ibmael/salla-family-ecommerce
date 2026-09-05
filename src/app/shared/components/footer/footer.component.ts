import { ChangeDetectionStrategy, Component, inject } from '@angular/core';
import { RouterLink } from '@angular/router';
import { LucideAngularModule, Compass, ArrowRight } from 'lucide-angular';
import { ASSETS } from '../../../core/constants/assets';
import { MockAuthStore } from '../../../core/state/auth.store';

@Component({
  selector: 'app-footer',
  imports: [RouterLink, LucideAngularModule],
  templateUrl: './footer.component.html',
  styleUrl: './footer.component.css',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class FooterComponent {
  readonly auth = inject(MockAuthStore);
  readonly wordmark = ASSETS.wordmark;
  readonly icons = { Compass, ArrowRight };
}

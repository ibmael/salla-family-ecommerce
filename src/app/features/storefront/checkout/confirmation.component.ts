import { ChangeDetectionStrategy, Component, inject } from '@angular/core';
import { ActivatedRoute, RouterLink } from '@angular/router';
import { toSignal } from '@angular/core/rxjs-interop';
import { map } from 'rxjs';
import { LucideAngularModule, Check, Package, ArrowRight } from 'lucide-angular';

@Component({
  selector: 'app-confirmation',
  imports: [RouterLink, LucideAngularModule],
  templateUrl: './confirmation.component.html',
  styleUrl: './confirmation.component.css',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class ConfirmationComponent {
  private readonly route = inject(ActivatedRoute);
  readonly orderId = toSignal(this.route.queryParamMap.pipe(map((p) => p.get('id'))));

  readonly icons = { Check, Package, ArrowRight };
}

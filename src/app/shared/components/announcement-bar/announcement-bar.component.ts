import { ChangeDetectionStrategy, Component, signal } from '@angular/core';
import { LucideAngularModule, X } from 'lucide-angular';

@Component({
  selector: 'app-announcement-bar',
  imports: [LucideAngularModule],
  templateUrl: './announcement-bar.component.html',
  styleUrl: './announcement-bar.component.css',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class AnnouncementBarComponent {
  readonly icons = { X };
  readonly isDismissed = signal<boolean>(false);
  readonly isClosing = signal<boolean>(false);

  dismiss(): void {
    if (this.isClosing() || this.isDismissed()) return;
    this.isClosing.set(true);
    setTimeout(() => {
      this.isDismissed.set(true);
    }, 200);
  }
}

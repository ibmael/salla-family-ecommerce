import { ChangeDetectionStrategy, Component, computed, input, output } from '@angular/core';
import { LucideAngularModule, ChevronLeft, ChevronRight } from 'lucide-angular';

@Component({
  selector: 'app-pagination',
  imports: [LucideAngularModule],
  templateUrl: './pagination.component.html',
  styleUrl: './pagination.component.css',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class PaginationComponent {
  readonly page = input<number>(1);
  readonly totalPages = input<number>(1);
  readonly pageChange = output<number>();

  readonly icons = { ChevronLeft, ChevronRight };

  readonly pages = computed<number[]>(() => {
    return Array.from({ length: this.totalPages() }, (_, i) => i + 1);
  });

  onPageSelect(p: number): void {
    if (p >= 1 && p <= this.totalPages() && p !== this.page()) {
      this.pageChange.emit(p);
    }
  }
}

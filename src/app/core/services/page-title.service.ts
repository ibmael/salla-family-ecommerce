import { Injectable, inject } from '@angular/core';
import { Title } from '@angular/platform-browser';

@Injectable({ providedIn: 'root' })
export class PageTitleService {
  static readonly default = 'Salla — Premium Marketplace';
  static readonly suffix = ' | Salla';

  private readonly title = inject(Title);

  set(pageTitle: string | null | undefined): void {
    if (!pageTitle?.trim()) {
      this.title.setTitle(PageTitleService.default);
      return;
    }

    this.title.setTitle(`${pageTitle.trim()}${PageTitleService.suffix}`);
  }
}

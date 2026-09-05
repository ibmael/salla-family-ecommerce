import {
  ChangeDetectionStrategy,
  Component,
  ElementRef,
  HostListener,
  computed,
  inject,
  input,
  model,
  signal,
} from '@angular/core';
import { CommonModule } from '@angular/common';
import { LucideAngularModule, ChevronDown, Check } from 'lucide-angular';

export type LucideIcon = typeof ChevronDown;

export interface SelectOption<T = string> {
  value: T;
  label: string;
  icon?: LucideIcon;
}

@Component({
  selector: 'app-custom-select',
  standalone: true,
  imports: [CommonModule, LucideAngularModule],
  templateUrl: './custom-select.component.html',
  styleUrl: './custom-select.component.css',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class CustomSelectComponent<T = string> {
  private readonly elementRef = inject(ElementRef);

  readonly options = input.required<SelectOption<T>[]>();
  readonly value = model<T>();
  readonly placeholder = input<string>('Select...');
  readonly ariaLabel = input<string>('Select option');
  readonly icon = input<LucideIcon>();
  readonly showCheckmark = input<boolean>(true);
  readonly panelWidthClass = input<string>('min-w-[180px]');
  readonly alignRight = input<boolean>(false);
  readonly disabled = input<boolean>(false);

  readonly isOpen = signal<boolean>(false);
  readonly focusedIndex = signal<number>(0);

  readonly icons = {
    ChevronDown,
    Check,
  };

  readonly selectedOption = computed(() => {
    const current = this.value();
    return this.options().find((o) => o.value === current);
  });

  readonly displayLabel = computed(() => {
    return this.selectedOption()?.label ?? this.placeholder();
  });

  toggle(): void {
    if (this.disabled()) return;
    const next = !this.isOpen();
    this.isOpen.set(next);
    if (next) {
      const idx = this.options().findIndex((o) => o.value === this.value());
      this.focusedIndex.set(idx >= 0 ? idx : 0);
    }
  }

  close(): void {
    this.isOpen.set(false);
  }

  selectOption(opt: SelectOption<T>): void {
    this.value.set(opt.value);
    this.close();
  }

  onKeydown(event: KeyboardEvent): void {
    if (this.disabled()) return;

    if (!this.isOpen()) {
      if (event.key === 'ArrowDown' || event.key === 'Enter' || event.key === ' ') {
        event.preventDefault();
        this.toggle();
      }
      return;
    }

    const opts = this.options();
    if (event.key === 'ArrowDown') {
      event.preventDefault();
      this.focusedIndex.update((i) => (i < opts.length - 1 ? i + 1 : 0));
    } else if (event.key === 'ArrowUp') {
      event.preventDefault();
      this.focusedIndex.update((i) => (i > 0 ? i - 1 : opts.length - 1));
    } else if (event.key === 'Enter' || event.key === ' ') {
      event.preventDefault();
      const selected = opts[this.focusedIndex()];
      if (selected) {
        this.selectOption(selected);
      }
    } else if (event.key === 'Escape') {
      event.preventDefault();
      this.close();
    } else if (event.key === 'Tab') {
      this.close();
    }
  }

  @HostListener('document:click', ['$event'])
  onDocumentClick(event: MouseEvent): void {
    if (!this.elementRef.nativeElement.contains(event.target)) {
      this.close();
    }
  }

  @HostListener('document:keydown.escape')
  onEscape(): void {
    this.close();
  }
}

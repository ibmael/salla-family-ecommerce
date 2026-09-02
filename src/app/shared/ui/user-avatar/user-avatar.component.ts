import {
  ChangeDetectionStrategy,
  Component,
  computed,
  effect,
  HostBinding,
  input,
  signal,
} from '@angular/core';

export type AvatarSize = 'xs' | 'sm' | 'md' | 'lg' | 'xl';

@Component({
  selector: 'app-user-avatar',
  standalone: true,
  template: `
    <div
      class="avatar-frame border border-black/10 dark:border-white/10"
      [class.bg-sand]="!showImage()"
      [class.dark:bg-white/10]="!showImage()"
      [class.text-ink]="!showImage()"
      [class.dark:text-white]="!showImage()"
      [class]="customClass()"
      [attr.aria-label]="altText()"
    >
      @if (showImage()) {
        <img
          [src]="imageUrl()"
          [alt]="altText()"
          (error)="onImageError()"
          class="avatar-img"
          loading="lazy"
        />
      } @else {
        <span class="avatar-initials">
          {{ initials() }}
        </span>
      }
    </div>
  `,
  styleUrl: './user-avatar.component.css',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class UserAvatarComponent {
  readonly name = input<string>('');
  readonly imageUrl = input<string | undefined | null>(undefined);
  readonly size = input<AvatarSize>('md');
  readonly customClass = input<string>('');

  readonly hasError = signal<boolean>(false);

  @HostBinding('class')
  get hostClass(): string {
    switch (this.size()) {
      case 'xs':
        return 'avatar-xs';
      case 'sm':
        return 'avatar-sm';
      case 'md':
        return 'avatar-md';
      case 'lg':
        return 'avatar-lg';
      case 'xl':
        return 'avatar-xl';
      default:
        return 'avatar-md';
    }
  }

  constructor() {
    effect(() => {
      this.imageUrl();
      this.hasError.set(false);
    });
  }

  readonly showImage = computed<boolean>(() => {
    const url = this.imageUrl();
    return !!url && typeof url === 'string' && url.trim().length > 0 && !this.hasError();
  });

  readonly initials = computed<string>(() => {
    const val = (this.name() || '').trim();
    if (!val) return 'U';
    const parts = val.split(/\s+/).filter(Boolean);
    if (parts.length >= 2) {
      return `${parts[0][0]}${parts[1][0]}`.toUpperCase();
    }
    return val.slice(0, 2).toUpperCase();
  });

  readonly altText = computed<string>(() => {
    const n = (this.name() || '').trim();
    return n ? `${n}'s avatar` : 'User avatar';
  });

  onImageError(): void {
    this.hasError.set(true);
  }
}

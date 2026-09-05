import {
  ChangeDetectionStrategy,
  Component,
  PLATFORM_ID,
  effect,
  inject,
  signal,
} from '@angular/core';
import { isPlatformBrowser } from '@angular/common';
import {
  AbstractControl,
  FormBuilder,
  ReactiveFormsModule,
  ValidationErrors,
  ValidatorFn,
  Validators,
} from '@angular/forms';
import { Router, RouterLink } from '@angular/router';
import {
  LucideAngularModule,
  Camera,
  Trash2,
  Lock,
  User as UserIcon,
  CheckCircle2,
  AlertCircle,
  ShieldCheck,
  KeyRound,
  LogOut,
} from 'lucide-angular';
import { ASSETS } from '../../../core/constants/assets';
import { MockAuthStore } from '../../../core/state/auth.store';
import { ToastService } from '../../../core/services/toast.service';
import { BreadcrumbsComponent, BreadcrumbItem } from '../../../shared/ui/breadcrumbs/breadcrumbs.component';

function passwordMatchValidator(): ValidatorFn {
  return (control: AbstractControl): ValidationErrors | null => {
    const newPassword = control.get('newPassword')?.value;
    const confirmNewPassword = control.get('confirmNewPassword')?.value;
    if (newPassword && confirmNewPassword && newPassword !== confirmNewPassword) {
      return { passwordMismatch: true };
    }
    return null;
  };
}

export type AccountTab = 'personal' | 'security';

@Component({
  selector: 'app-account',
  imports: [ReactiveFormsModule, LucideAngularModule, BreadcrumbsComponent],
  templateUrl: './account.component.html',
  styleUrl: './account.component.css',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class AccountComponent {
  private readonly fb = inject(FormBuilder);
  private readonly router = inject(Router);
  readonly auth = inject(MockAuthStore);
  private readonly toast = inject(ToastService);
  private readonly platformId = inject(PLATFORM_ID);

  readonly heroImage = ASSETS.categories.home;

  readonly breadcrumbs: BreadcrumbItem[] = [
    { label: 'Home', url: '/' },
    { label: 'Account' },
  ];

  readonly icons = {
    Camera,
    Trash2,
    Lock,
    User: UserIcon,
    CheckCircle2,
    AlertCircle,
    ShieldCheck,
    KeyRound,
    LogOut,
  };

  activeTab = signal<AccountTab>('personal');

  isSavingProfile = signal<boolean>(false);
  profileError = signal<string | null>(null);
  profileSuccess = signal<boolean>(false);

  isChangingPassword = signal<boolean>(false);
  passwordError = signal<string | null>(null);
  passwordSuccess = signal<boolean>(false);

  readonly profileForm = this.fb.group({
    name: ['', [Validators.required, Validators.minLength(2)]],
    username: [
      '',
      [
        Validators.required,
        Validators.minLength(3),
        Validators.pattern(/^[a-zA-Z0-9_.-]+$/),
      ],
    ],
    email: ['', [Validators.required, Validators.email]],
    phoneNumber: [
      '',
      [Validators.pattern(/^[+]?[(]?[0-9]{1,4}[)]?[-\s./0-9]*$/)],
    ],
  });

  readonly passwordForm = this.fb.group(
    {
      currentPassword: ['', [Validators.required, Validators.minLength(8)]],
      newPassword: ['', [Validators.required, Validators.minLength(8)]],
      confirmNewPassword: ['', [Validators.required, Validators.minLength(8)]],
    },
    { validators: passwordMatchValidator() }
  );

  constructor() {
    effect(() => {
      const user = this.auth.user();
      if (user) {
        this.profileForm.patchValue(
          {
            name: user.name,
            username: user.username,
            email: user.email,
            phoneNumber: user.phoneNumber ?? '',
          },
          { emitEvent: false }
        );
      }
    });
  }

  get userInitials(): string {
    const name = this.auth.user()?.name?.trim() || '';
    if (!name) return 'U';
    const parts = name.split(' ');
    if (parts.length >= 2) {
      return (parts[0][0] + parts[1][0]).toUpperCase();
    }
    return name.slice(0, 2).toUpperCase();
  }

  setTab(tab: AccountTab): void {
    this.activeTab.set(tab);
  }

  onTabKeydown(event: KeyboardEvent): void {
    if (event.key === 'ArrowRight' || event.key === 'ArrowLeft') {
      event.preventDefault();
      this.activeTab.update((current) => (current === 'personal' ? 'security' : 'personal'));
    }
  }

  onAvatarSelected(event: Event): void {
    if (!isPlatformBrowser(this.platformId)) return;
    const input = event.target as HTMLInputElement;
    if (!input.files || input.files.length === 0) return;

    const file = input.files[0];
    if (!file.type.startsWith('image/')) {
      this.toast.info('Please select a valid image file');
      return;
    }

    if (file.size > 2 * 1024 * 1024) {
      this.toast.info('Image size should be under 2MB');
      return;
    }

    const reader = new FileReader();
    reader.onload = () => {
      const base64 = reader.result as string;
      this.auth.uploadAvatar(base64).subscribe({
        next: () => {
          this.toast.success('Profile picture updated successfully.');
        },
        error: (err) => {
          this.toast.error(err.message || 'Failed to update avatar.');
        },
      });
    };
    reader.readAsDataURL(file);
  }

  removeAvatar(): void {
    this.auth.removeAvatar().subscribe({
      next: () => {
        this.toast.success('Profile picture removed.');
      },
    });
  }

  saveProfile(): void {
    this.profileError.set(null);
    this.profileSuccess.set(false);

    if (this.profileForm.invalid) {
      this.profileForm.markAllAsTouched();
      return;
    }

    const { name, username, email, phoneNumber } = this.profileForm.getRawValue();
    if (!name || !username || !email) return;

    this.isSavingProfile.set(true);
    this.auth
      .updateProfile({
        name,
        username,
        email,
        phoneNumber: phoneNumber || undefined,
      })
      .subscribe({
        next: () => {
          this.isSavingProfile.set(false);
          this.profileSuccess.set(true);
          this.toast.success('Profile updated successfully.');
          setTimeout(() => this.profileSuccess.set(false), 4000);
        },
        error: (err) => {
          this.isSavingProfile.set(false);
          this.profileError.set(err.message || 'Failed to update profile.');
          this.toast.error(err.message || 'Failed to update profile.');
        },
      });
  }

  savePassword(): void {
    this.passwordError.set(null);
    this.passwordSuccess.set(false);

    if (this.passwordForm.invalid) {
      this.passwordForm.markAllAsTouched();
      return;
    }

    const { currentPassword, newPassword } = this.passwordForm.getRawValue();
    if (!currentPassword || !newPassword) return;

    this.isChangingPassword.set(true);
    this.auth
      .changePassword({
        currentPassword,
        newPassword,
      })
      .subscribe({
        next: () => {
          this.isChangingPassword.set(false);
          this.passwordSuccess.set(true);
          this.passwordForm.reset();
          this.toast.success('Password changed successfully.');
          setTimeout(() => this.passwordSuccess.set(false), 4000);
        },
        error: (err) => {
          this.isChangingPassword.set(false);
          this.passwordError.set(err.message || 'Failed to change password.');
          this.toast.error(err.message || 'Failed to change password.');
        },
      });
  }

  signOut(): void {
    this.auth.logout();
    this.router.navigate(['/auth']);
  }
}

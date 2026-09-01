import {
  ChangeDetectionStrategy,
  Component,
  inject,
  signal,
} from '@angular/core';
import {
  AbstractControl,
  FormBuilder,
  ReactiveFormsModule,
  ValidationErrors,
  ValidatorFn,
  Validators,
} from '@angular/forms';
import { Router } from '@angular/router';
import {
  LucideAngularModule,
  AlertCircle,
  Eye,
  EyeOff,
  Lock,
  Mail,
  Phone,
  User,
  CheckCircle2,
  Sparkles,
  Clock,
  ShieldCheck,
} from 'lucide-angular';
import { ASSETS } from '../../../core/constants/assets';
import { MockAuthStore } from '../../../core/state/auth.store';
import { ToastService } from '../../../core/services/toast.service';

function passwordMatchValidator(): ValidatorFn {
  return (control: AbstractControl): ValidationErrors | null => {
    const password = control.get('password')?.value;
    const confirmPassword = control.get('confirmPassword')?.value;
    if (password && confirmPassword && password !== confirmPassword) {
      return { passwordMismatch: true };
    }
    return null;
  };
}

@Component({
  selector: 'app-auth',
  imports: [ReactiveFormsModule, LucideAngularModule],
  templateUrl: './auth.component.html',
  styleUrl: './auth.component.css',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class AuthComponent {
  private readonly fb = inject(FormBuilder);
  private readonly router = inject(Router);
  readonly auth = inject(MockAuthStore);
  private readonly toast = inject(ToastService);

  readonly heroImage = ASSETS.hero;

  readonly icons = {
    User,
    Mail,
    Lock,
    Phone,
    Eye,
    EyeOff,
    AlertCircle,
    CheckCircle2,
    Sparkles,
    Clock,
    ShieldCheck,
  };

  activeTab = signal<'signin' | 'signup'>('signin');
  showLoginPassword = signal<boolean>(false);
  showSignUpPassword = signal<boolean>(false);
  showSignUpConfirmPassword = signal<boolean>(false);
  errorMessage = signal<string | null>(null);
  isLoading = signal<boolean>(false);

  readonly loginForm = this.fb.group({
    identifier: ['hello@salla.studio', [Validators.required, Validators.minLength(3)]],
    password: ['password123', [Validators.required, Validators.minLength(8)]],
  });

  readonly signUpForm = this.fb.group(
    {
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
        [
          Validators.required,
          Validators.pattern(/^[+]?[(]?[0-9]{1,4}[)]?[-\s./0-9]*$/),
        ],
      ],
      password: ['', [Validators.required, Validators.minLength(8)]],
      confirmPassword: ['', [Validators.required, Validators.minLength(8)]],
    },
    { validators: passwordMatchValidator() }
  );

  switchTab(tab: 'signin' | 'signup'): void {
    this.activeTab.set(tab);
    this.errorMessage.set(null);
  }

  toggleLoginPassword(): void {
    this.showLoginPassword.update((v) => !v);
  }

  toggleSignUpPassword(): void {
    this.showSignUpPassword.update((v) => !v);
  }

  toggleSignUpConfirmPassword(): void {
    this.showSignUpConfirmPassword.update((v) => !v);
  }

  fillDemo(type: 'admin' | 'customer'): void {
    this.activeTab.set('signin');
    this.errorMessage.set(null);
    if (type === 'admin') {
      this.loginForm.setValue({
        identifier: 'admin@salla.studio',
        password: 'admin123!',
      });
    } else {
      this.loginForm.setValue({
        identifier: 'sarah',
        password: 'password123',
      });
    }
  }

  onLogin(): void {
    this.errorMessage.set(null);
    if (this.loginForm.invalid) {
      this.loginForm.markAllAsTouched();
      return;
    }

    const { identifier, password } = this.loginForm.getRawValue();
    if (!identifier || !password) return;

    this.isLoading.set(true);
    this.auth.login({ identifier, password }).subscribe({
      next: (user) => {
        this.isLoading.set(false);
        this.toast.success(`Welcome back, ${user.name}!`);
        if (user.role === 'admin') {
          this.router.navigate(['/admin']);
        } else {
          this.router.navigate(['/account']);
        }
      },
      error: (err) => {
        this.isLoading.set(false);
        this.errorMessage.set(err.message || 'Login failed. Please check your credentials.');
      },
    });
  }

  onSignUp(): void {
    this.errorMessage.set(null);
    if (this.signUpForm.invalid) {
      this.signUpForm.markAllAsTouched();
      return;
    }

    const formVal = this.signUpForm.getRawValue();
    this.isLoading.set(true);

    this.auth
      .signUp({
        name: formVal.name!,
        username: formVal.username!,
        email: formVal.email!,
        phoneNumber: formVal.phoneNumber!,
        password: formVal.password!,
      })
      .subscribe({
        next: (user) => {
          this.isLoading.set(false);
          this.toast.success(`Account created successfully. Welcome, ${user.name}!`);
          if (user.role === 'admin') {
            this.router.navigate(['/admin']);
          } else {
            this.router.navigate(['/account']);
          }
        },
        error: (err) => {
          this.isLoading.set(false);
          this.errorMessage.set(err.message || 'Registration failed. Please try again.');
        },
      });
  }
}

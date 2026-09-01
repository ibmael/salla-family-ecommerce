import {
  ChangeDetectionStrategy,
  Component,
  OnInit,
  computed,
  inject,
  signal,
} from '@angular/core';
import { Router, RouterLink } from '@angular/router';
import {
  FormBuilder,
  ReactiveFormsModule,
  Validators,
} from '@angular/forms';
import {
  LucideAngularModule,
  ShieldCheck,
  Lock,
  Truck,
  CreditCard,
  Banknote,
  ShoppingBag,
  ArrowLeft,
  CheckCircle2,
} from 'lucide-angular';
import { CartStore } from '../../../core/state/cart.store';
import { MockAuthStore } from '../../../core/state/auth.store';
import { ORDER_REPOSITORY } from '../../../core/repositories/repository.tokens';
import { ToastService } from '../../../core/services/toast.service';
import { BreadcrumbsComponent, BreadcrumbItem } from '../../../shared/ui/breadcrumbs/breadcrumbs.component';

@Component({
  selector: 'app-checkout',
  imports: [ReactiveFormsModule, RouterLink, LucideAngularModule, BreadcrumbsComponent],
  templateUrl: './checkout.component.html',
  styleUrl: './checkout.component.css',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class CheckoutComponent implements OnInit {
  private readonly fb = inject(FormBuilder);
  private readonly router = inject(Router);
  private readonly orderRepo = inject(ORDER_REPOSITORY);
  private readonly toast = inject(ToastService);
  readonly cart = inject(CartStore);
  readonly auth = inject(MockAuthStore);

  readonly breadcrumbs: BreadcrumbItem[] = [
    { label: 'Home', url: '/' },
    { label: 'Cart', url: '/cart' },
    { label: 'Checkout' },
  ];

  readonly icons = {
    ShieldCheck,
    Lock,
    Truck,
    CreditCard,
    Banknote,
    ShoppingBag,
    ArrowLeft,
    CheckCircle2,
  };

  deliveryMethod = signal<'standard' | 'express'>('standard');
  paymentMethod = signal<'card' | 'cod'>('card');
  isSubmitting = signal<boolean>(false);

  readonly shippingCost = computed(() => (this.deliveryMethod() === 'express' ? 12 : 0));
  readonly orderTotal = computed(() => this.cart.total() + this.shippingCost());

  readonly form = this.fb.group({
    // Contact information
    email: ['', [Validators.required, Validators.email]],
    phoneNumber: ['', [Validators.required, Validators.minLength(6)]],

    // Delivery address
    name: ['', [Validators.required, Validators.minLength(2)]],
    country: ['United States', [Validators.required]],
    city: ['', [Validators.required, Validators.minLength(2)]],
    address: ['', [Validators.required, Validators.minLength(4)]],
    apartment: [''],
    postalCode: ['', [Validators.required, Validators.minLength(3)]],

    // UI-only card mock fields
    cardNumber: [''],
    cardName: [''],
    cardExpiry: [''],
    cardCvv: [''],
  });

  ngOnInit(): void {
    const user = this.auth.user();
    if (user) {
      this.form.patchValue({
        email: user.email || '',
        phoneNumber: user.phoneNumber || '',
        name: user.name || '',
      });
    }
  }

  setDeliveryMethod(method: 'standard' | 'express'): void {
    this.deliveryMethod.set(method);
  }

  setPaymentMethod(method: 'card' | 'cod'): void {
    this.paymentMethod.set(method);
  }

  submitOrder(): void {
    if (this.cart.count() === 0 || this.isSubmitting()) {
      return;
    }

    if (this.form.invalid) {
      this.form.markAllAsTouched();
      return;
    }

    // Additional mock validation if credit card is selected
    if (this.paymentMethod() === 'card') {
      const { cardNumber, cardName, cardExpiry, cardCvv } = this.form.getRawValue();
      if (!cardNumber?.trim() || !cardName?.trim() || !cardExpiry?.trim() || !cardCvv?.trim()) {
        this.form.get('cardNumber')?.markAsTouched();
        this.form.get('cardName')?.markAsTouched();
        this.form.get('cardExpiry')?.markAsTouched();
        this.form.get('cardCvv')?.markAsTouched();
        return;
      }
    }

    this.isSubmitting.set(true);

    const formVal = this.form.getRawValue();
    const shippingAddress = `${formVal.address}${
      formVal.apartment ? ', ' + formVal.apartment : ''
    }, ${formVal.city}, ${formVal.postalCode}, ${formVal.country}`;

    const lines = this.cart.lines().map((l) => ({
      productId: l.product.id,
      productName: l.product.name,
      productImage: l.product.image,
      price: l.product.price,
      quantity: l.quantity,
      size: l.size,
      color: l.color,
    }));

    // Create mock order without persisting raw card details
    this.orderRepo
      .create({
        userId: this.auth.user()?.id ?? 'user-1',
        status: 'pending',
        lines,
        subtotal: this.cart.total(),
        shipping: this.shippingCost(),
        total: this.orderTotal(),
        shippingAddress,
      })
      .subscribe({
        next: () => {
          this.cart.clear();
          this.isSubmitting.set(false);
          this.toast.success('Your order has been placed successfully.', 'Order Placed');
          this.router.navigate(['/order/confirmed']);
        },
        error: () => {
          this.cart.clear();
          this.isSubmitting.set(false);
          this.router.navigate(['/order/confirmed']);
        },
      });
  }
}

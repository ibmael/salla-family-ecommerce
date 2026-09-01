import { inject } from '@angular/core';
import { CanActivateFn, Router } from '@angular/router';
import { MockAuthStore } from '../state/auth.store';

export const adminGuard: CanActivateFn = () => {
  const auth = inject(MockAuthStore);
  const router = inject(Router);
  if (auth.isAdmin()) return true;
  return router.createUrlTree(['/auth']);
};

export const authGuard: CanActivateFn = () => {
  const auth = inject(MockAuthStore);
  const router = inject(Router);
  if (auth.isLoggedIn()) return true;
  return router.createUrlTree(['/auth']);
};

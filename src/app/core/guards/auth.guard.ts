import { inject } from '@angular/core';
import { CanActivateFn, Router } from '@angular/router';
import { MockAuthStore } from '../state/auth.store';

export const adminGuard: CanActivateFn = (route, state) => {
  const auth = inject(MockAuthStore);
  const router = inject(Router);
  if (auth.isAdmin()) return true;
  return router.createUrlTree(['/auth'], {
    queryParams: { returnUrl: state.url },
  });
};

export const authGuard: CanActivateFn = (route, state) => {
  const auth = inject(MockAuthStore);
  const router = inject(Router);
  if (auth.isLoggedIn()) return true;
  return router.createUrlTree(['/auth'], {
    queryParams: { returnUrl: state.url },
  });
};

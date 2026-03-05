import { CanActivateFn, Router } from '@angular/router';
import { AuthService } from '../services/auth.service';
import { inject } from '@angular/core';
import { Path } from '@gofish/shared/constants';

export const authGuard: CanActivateFn = (route, state) => {
  const authService: AuthService = inject(AuthService);
  const router: Router = inject(Router)
  if (authService.isAuthenticated()) return true;
  router.navigate([Path.SIGN_IN]);
  return false;
};

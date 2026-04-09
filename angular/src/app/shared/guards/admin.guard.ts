import { inject } from '@angular/core';
import { CanActivateFn } from '@angular/router';
import { AuthService } from '@gofish/shared/services/auth.service';

export const adminGuard: CanActivateFn = (route, state) => {
  const authService: AuthService = inject(AuthService);
  return authService.isAdmin();
};

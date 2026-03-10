import { inject } from '@angular/core';
import { CanActivateFn, Router } from '@angular/router';
import { map, catchError, of } from 'rxjs';
import { UserSecurityService } from '@gofish/shared/services/user-security.service';
import { Path } from '@gofish/shared/constants';
import { TwoFactorMethod } from '@gofish/shared/models/user-security.models';

export const noTotpGuard: CanActivateFn = () => {
  const userSecurityService = inject(UserSecurityService);
  const router = inject(Router);
  return userSecurityService.getSecurityInfo().pipe(
    map(res => res.twoFactorMethod === TwoFactorMethod.Totp ? router.createUrlTree([Path.SECURITY_SETTINGS]) : true ),
    catchError(() => of(true)) // On error, let the route through (setup-totp handles its own error state)
  );
};

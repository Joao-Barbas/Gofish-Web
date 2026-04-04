import { inject } from '@angular/core';
import { CanActivateFn, Router } from '@angular/router';
import { map, catchError, of } from 'rxjs';
import { Path } from '@gofish/shared/constants';
import { TwoFactorMethod } from '@gofish/shared/models/user-security.models';
import { UserSecurityApi } from '@gofish/shared/api/user-security.api';

export const noTotpGuard: CanActivateFn = () => {
  const userSecurityApi = inject(UserSecurityApi);
  const router = inject(Router);
  return userSecurityApi.getSecurityInfo().pipe(
    map(res => res.twoFactorMethod === TwoFactorMethod.Totp ? router.createUrlTree([Path.SECURITY_SETTINGS]) : true ),
    catchError(() => of(true)) // On error, let the route through (setup-totp handles its own error state)
  );
};

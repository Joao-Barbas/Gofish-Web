import { HttpInterceptorFn } from '@angular/common/http';
import { inject } from '@angular/core';
import { Router } from '@angular/router';
import { Path } from '@gofish/shared/constants';
import { AuthService } from '@gofish/shared/services/auth.service';
import { catchError, throwError } from 'rxjs';

export const authInterceptor: HttpInterceptorFn = (req, next) => {
  const authService: AuthService = inject(AuthService);
  const router = inject(Router);

  if (authService.isAuthenticated()) {
    req = req.clone({
      headers: req.headers.set('Authorization', `Bearer ${authService.getEncodedToken()}`)
    });
  }

  return next(req).pipe(catchError(err => {
    switch (err.status) {
    case 401: {
      // authService.removeToken();
      // router.navigate([Path.SIGN_IN]);
      break;
    }
    case 403: {
      // router.navigate([Path.HOME]);
      break;
    }}
    return throwError(() => err);
  }));
};

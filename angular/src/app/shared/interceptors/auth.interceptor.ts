import { HttpInterceptorFn } from '@angular/common/http';
import { inject } from '@angular/core';
import { Router } from '@angular/router';
import { AuthService } from '@gofish/shared/services/auth.service';
import { catchError, throwError } from 'rxjs';

export const authInterceptor: HttpInterceptorFn = (req, next) => {
  const authService: AuthService = inject(AuthService);
  const router = inject(Router);

  if (authService.isSignedIn()) {
    req = req.clone({
      headers: req.headers.set('Authorization', `Bearer ${authService.getEncodedToken()}`)
    });
  }

  return next(req).pipe(catchError(err => {
    if (err.status === 401) {
      authService.removeToken();
      router.navigate(['/user/signin']);
    }
    return throwError(() => err);
  }));
};

import { HttpInterceptorFn } from '@angular/common/http';
import { inject } from '@angular/core';
import { AuthService } from '@gofish/shared/services/auth.service';

export const authInterceptor: HttpInterceptorFn = (req, next) => {
  const authService: AuthService = inject(AuthService);
  if (!authService.isSignedIn()) return next(req);
  var clonedReq = req.clone({
    headers: req.headers.set('Authorization', `Bearer ${authService.getToken()}`)
  });
  return next(clonedReq);
};

/*export const authInterceptor: HttpInterceptorFn = (req, next) => {
  const authService: AuthService = inject(AuthService);
  const router = inject(Router);

  if (!authService.isSignedIn()) {
    return next(req).pipe(
      catchError(err => {
        if (err.status === 401) {
          authService.deleteToken();
          router.navigate(['/users/signin']);
        }
        return throwError(() => err);
      })
    );
  }

  var newReq = req.clone({
    headers: req.headers.set('Authorization', `Bearer ${authService.getToken()}`)
  });
  return next(newReq);
};*/

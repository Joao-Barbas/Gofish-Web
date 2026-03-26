import { Component, inject, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { AuthService } from '@gofish/shared/services/auth.service';

@Component({
  selector: 'app-auth-callback',
  template: '',
  styles: '',
})
export class AuthCallbackComponent implements OnInit {
  private readonly route = inject(ActivatedRoute);
  private readonly authService = inject(AuthService);
  private readonly router = inject(Router);

  ngOnInit() {
    let token = this.route.snapshot.queryParamMap.get('token');
    let error = this.route.snapshot.queryParamMap.get('error');

    if (!token) {
      // Pass error to signin page to display a message
      this.router.navigate(['/signin'], { queryParams: { error } });
      return;
    }

    this.authService.insertToken(token);
    this.router.navigate(['/map']);
  }
}

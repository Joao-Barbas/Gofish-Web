// signin-verify.component.ts

import { HttpErrorResponse } from '@angular/common/http';
import { Component, inject, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { ActivatedRoute, Router, RouterLink } from '@angular/router';
import { Path } from '@gofish/shared/constants';
import { getFirstError, ProblemDetails } from '@gofish/shared/core/problem-details';
import { TwoFactorSignInReqDTO } from '@gofish/shared/dtos/signin.dto';
import { AuthService } from '@gofish/shared/services/auth.service';
import { BusyState } from '@gofish/shared/core/busy-state';

@Component({
  selector: 'app-signin-verify',
  imports: [ ReactiveFormsModule, RouterLink ],
  templateUrl: './signin-verify.component.html',
  styles: ``
})
export class SigninVerifyComponent implements OnInit {
  private readonly authService = inject(AuthService);
  private readonly router      = inject(Router);
  private readonly route       = inject(ActivatedRoute);
  private readonly formBuilder = inject(FormBuilder);

  readonly busyState = new BusyState();

  errorText: string | null = null;
  private twoFactorToken: string = '';

  readonly Path = Path;

  form: FormGroup = this.formBuilder.group({
    code: [ '', [ Validators.required, Validators.pattern('^[0-9]*$') ]]
  });

  ngOnInit(): void {
    if (this.authService.isAuthenticated()) {
      this.router.navigate([Path.HOME]);
      return;
    }

    const token = this.route.snapshot.queryParamMap.get('token');
    if (!token) {
      this.router.navigate([Path.SIGN_IN]);
      return;
    }

    this.twoFactorToken = token;
  }

  onSubmit(): void {
    this.form.markAllAsTouched();
    this.errorText = null;

    if (this.form.invalid) return;

    const dto: TwoFactorSignInReqDTO = {
      twoFactorToken: this.twoFactorToken,
      twoFactorCode:  this.form.value.code,
    };

    const endBusy = this.busyState.beginBusy();

    this.authService.signIn2fa(dto).subscribe({
      next: (res) => {
        endBusy();
        this.authService.insertToken(res.token);
        this.router.navigate([Path.MAP]);
      },
      error: (err: HttpErrorResponse) => {
        endBusy();
        const problem = err.error as ProblemDetails;
        this.errorText = getFirstError(problem) ?? 'Incorrect code. Try again.';
      }
    });
  }
}

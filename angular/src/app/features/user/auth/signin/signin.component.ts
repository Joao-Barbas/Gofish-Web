// signin.component.ts

import { CommonModule } from '@angular/common';
import { HttpErrorResponse } from '@angular/common/http';
import { Component, inject, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, ReactiveFormsModule, ValidationErrors, Validators } from '@angular/forms';
import { ActivatedRoute, Router, RouterLink } from '@angular/router';
import { Api, Path } from '@gofish/shared/constants';
import { ValidationProblemDetails } from '@gofish/shared/core/problem-details';
import { SignInReqDTO, SignInResDTO } from '@gofish/shared/dtos/auth.dto';
import { AuthService } from '@gofish/shared/services/auth.service';
import { AsyncButtonComponent } from "@gofish/shared/components/async-button/async-button.component";
import { BusyState } from '@gofish/shared/core/busy-state';
import { LoadingState } from '@gofish/shared/core/loading-state';
import { environment } from 'environments/environment';
import { AuthApi } from '@gofish/shared/api/auth.api';

@Component({
  selector: 'app-signin',
  imports: [
    ReactiveFormsModule,
    CommonModule,
    RouterLink,
    AsyncButtonComponent
  ],
  templateUrl: './signin.component.html',
  styleUrl: './signin.component.css',
})
export class SigninComponent implements OnInit {
  private readonly router      = inject(Router);
  private readonly authService = inject(AuthService);
  private readonly authApi     = inject(AuthApi);

  readonly route       = inject(ActivatedRoute);
  readonly formBuilder = inject(FormBuilder);

  readonly loadingState: LoadingState = new LoadingState();
  readonly busyState: BusyState       = new BusyState();

  readonly Path = Path;
  readonly Api  = Api;

  signInForm: FormGroup = this.formBuilder.group({
    emailOrUserName: [ '', [ Validators.required ]],
    password: [ '', [ Validators.required ]],
  });

  apiProblems: ValidationProblemDetails | null = null;
  formErrors: ValidationErrors | null = this.signInForm.errors;
  signInSuccess: boolean = false;
  showPwd: boolean = false;

  ngOnInit() {
    if (!this.authService.isAuthenticated()) return;
    this.router.navigate([Path.HOME]);
  }

  private controlError(name: string): ValidationErrors | null {
    let control = this.signInForm.get(name);
    if (!control) return null;
    if (!control.invalid || (!control.touched && !control.dirty)) return null;
    return control.errors;
  }

  getError(): string | null {
    const e = (field: string) => this.controlError(field);
    const g = this.signInForm.errors;
    const s = this.apiProblems;
    // Field-level
    if (e('emailOrUserName')?.['required']) return 'Enter an email or username.';
    if (e('password')?.['required']) return 'Enter your password.';
    // Api errors
    return s?.detail ?? null;
  }

  onSubmit() {
    this.signInForm.markAllAsTouched();
    this.apiProblems = null;
    if (this.signInForm.invalid) return;
    this.busyState.setBusy(true);
    this.signInSuccess = false;

    this.authApi.signIn(this.signInForm.value as SignInReqDTO).subscribe({
      next: (res: SignInResDTO) => {
        this.busyState.setBusy(false);
        this.signInSuccess = true;
        setTimeout(() => {
          this.signInSuccess = false;
          this.signInForm.reset();
          if (res.requiresTwoFactor && res.twoFactorToken) {
            this.router.navigate([Path.SIGN_IN_VERIFY], { queryParams: { token: res.twoFactorToken } });
          } else {
            this.authService.insertToken(res.token!);
            this.router.navigate([Path.MAP]);
          }
        }, 1000);
      },
      error: (err: HttpErrorResponse) => {
        this.busyState.setBusy(false);
        let problem = err.error as ValidationProblemDetails;
        problem.detail = problem.detail ?? problem.status === 401 ? 'Invalid credentials.' : 'Server Error. Try again later.';
        this.apiProblems = problem;
      }
    });
  }

  onGoogle() {
    window.location.href = Api.Auth.action('ExternalLogin?provider=Google');
  }
}

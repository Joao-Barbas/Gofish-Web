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

/**
 * Sign-in page component responsible for authenticating users.
 *
 * Responsibilities:
 * - Validate sign-in form input
 * - Submit authentication requests to the backend
 * - Handle API validation and authentication errors
 * - Redirect authenticated users to the appropriate destination
 * - Trigger external authentication flows
 */
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
  private readonly router = inject(Router);
  private readonly authService = inject(AuthService);
  private readonly authApi = inject(AuthApi);

  /** Current activated route. */
  readonly route = inject(ActivatedRoute);

  /** Form builder used to create the sign-in form. */
  readonly formBuilder = inject(FormBuilder);

  /** Loading state used for UI feedback. */
  readonly loadingState: LoadingState = new LoadingState();

  /** Busy state used to prevent duplicate submissions. */
  readonly busyState: BusyState = new BusyState();

  /** Shared route path constants used in templates. */
  readonly Path = Path;

  /** Shared API constants used in templates and actions. */
  readonly Api = Api;

  /**
   * Reactive form used to collect user credentials.
   */
  signInForm: FormGroup = this.formBuilder.group({
    emailOrUserName: ['', [Validators.required]],
    password: ['', [Validators.required]],
  });

  /** API validation or authentication problems returned by the backend. */
  apiProblems: ValidationProblemDetails | null = null;

  /** Current form-level validation errors. */
  formErrors: ValidationErrors | null = this.signInForm.errors;

  /** Indicates whether sign-in completed successfully. */
  signInSuccess: boolean = false;

  /** Controls password visibility in the UI. */
  showPwd: boolean = false;

  /**
   * Redirects the user if already authenticated.
   */
  ngOnInit() {
    if (!this.authService.isAuthenticated()) return;
    this.router.navigate([Path.HOME]);
  }

  /**
   * Returns the current validation errors for a specific form control,
   * only when the control is invalid and has been interacted with.
   *
   * @param name Control name
   * @returns Validation errors for the specified control or null
   */
  private controlError(name: string): ValidationErrors | null {
    let control = this.signInForm.get(name);
    if (!control) return null;
    if (!control.invalid || (!control.touched && !control.dirty)) return null;
    return control.errors;
  }

  /**
   * Returns the most relevant validation or API error message
   * to display to the user.
   *
   * @returns Error message or null when no error should be shown
   */
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

  /**
   * Validates the sign-in form and submits the sign-in request.
   *
   * Behavior:
   * - Marks the form as touched
   * - Clears previous API errors
   * - Stops when the form is invalid
   * - Handles both regular sign-in and two-factor authentication flows
   */
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
            this.router.navigate([Path.FORUM]);
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

  /**
   * Starts the Google external authentication flow.
   */
  onGoogle() {
    window.location.href = Api.Auth.action('ExternalLogin?provider=Google');
  }
}

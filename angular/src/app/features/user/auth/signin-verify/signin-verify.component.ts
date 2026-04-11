// signin-verify.component.ts

import { HttpErrorResponse } from '@angular/common/http';
import { Component, inject, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, ReactiveFormsModule, ValidationErrors, Validators } from '@angular/forms';
import { ActivatedRoute, Router, RouterLink } from '@angular/router';
import { Api, Path } from '@gofish/shared/constants';
import { ValidationProblemDetails } from '@gofish/shared/core/problem-details';
import { TwoFactorSignInReqDTO } from '@gofish/shared/dtos/auth.dto';
import { AuthService } from '@gofish/shared/services/auth.service';
import { BusyState } from '@gofish/shared/core/busy-state';
import { NumbersOnlyDirective } from '@gofish/shared/directives/numbers-only.directive';
import { AsyncButtonComponent } from "@gofish/shared/components/async-button/async-button.component";
import { LoadingState } from '@gofish/shared/core/loading-state';
import { AuthApi } from '@gofish/shared/api/auth.api';

/**
 * Two-factor verification page component used after the initial sign-in step.
 *
 * Responsibilities:
 * - Validate the two-factor verification code
 * - Read the temporary two-factor token from the query string
 * - Submit the verification request to the backend
 * - Authenticate the user after successful verification
 */
@Component({
  selector: 'app-signin-verify',
  imports: [ReactiveFormsModule, RouterLink, NumbersOnlyDirective, AsyncButtonComponent],
  templateUrl: './signin-verify.component.html',
  styleUrl: './signin-verify.component.css',
})
export class SigninVerifyComponent implements OnInit {
  private readonly router = inject(Router);
  private readonly authService = inject(AuthService);
  private readonly authApi = inject(AuthApi);
  private readonly route = inject(ActivatedRoute);
  private readonly formBuilder = inject(FormBuilder);

  /** Loading state used for UI feedback. */
  readonly loadingState: LoadingState = new LoadingState();

  /** Busy state used to prevent duplicate submissions. */
  readonly busyState: BusyState = new BusyState();

  /** Shared route path constants used in templates. */
  readonly Path = Path;

  /** Shared API constants used in templates and actions. */
  readonly Api = Api;

  /**
   * Reactive form used to collect the two-factor verification code.
   */
  verifyForm: FormGroup = this.formBuilder.group({
    code: ['', [
      Validators.required,
      Validators.pattern('^[0-9]*$')
    ]]
  });

  /** API validation or authentication problems returned by the backend. */
  apiProblems: ValidationProblemDetails | null = null;

  /** Current form-level validation errors. */
  formErrors: ValidationErrors | null = this.verifyForm.errors;

  /** Indicates whether verification completed successfully. */
  verifySuccess: boolean = false;

  /** Temporary token required to complete two-factor sign-in. */
  twoFactorToken: string = '';

  /**
   * Redirects authenticated users away from the page and reads
   * the temporary two-factor token from the query parameters.
   */
  ngOnInit(): void {
    if (this.authService.isAuthenticated()) {
      this.router.navigate([Path.MAP]);
      return;
    }

    const token = this.route.snapshot.queryParamMap.get('token');

    if (!token) {
      this.router.navigate([Path.SIGN_IN]);
      return;
    }

    this.twoFactorToken = token;
  }

  /**
   * Returns the current validation errors for a specific form control,
   * only when the control is invalid and has been interacted with.
   *
   * @param name Control name
   * @returns Validation errors for the specified control or null
   */
  private controlError(name: string): ValidationErrors | null {
    let control = this.verifyForm.get(name);
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
    const g = this.verifyForm.errors;
    const s = this.apiProblems;

    // Field-level
    if (e('code')?.['required']) return 'Enter a code provided by your authenticator app.';

    // Api errors
    return s?.detail ?? null;
  }

  /**
   * Validates the verification form and submits the two-factor sign-in request.
   *
   * Behavior:
   * - Marks the form as touched
   * - Clears previous API errors
   * - Stops when the form is invalid
   * - Stores the returned token and redirects on success
   */
  onSubmit(): void {
    this.verifyForm.markAllAsTouched();
    this.apiProblems = null;

    if (this.verifyForm.invalid) return;

    this.busyState.setBusy(true);
    this.verifySuccess = false;

    const dto: TwoFactorSignInReqDTO = {
      twoFactorToken: this.twoFactorToken,
      twoFactorCode: this.verifyForm.value.code,
    };

    this.authApi.twoFactorSignIn(dto).subscribe({
      next: (res) => {
        this.busyState.setBusy(false);
        this.verifySuccess = true;

        setTimeout(() => {
          this.authService.insertToken(res.token);
          this.router.navigate([Path.MAP]);
        }, 1000);
      },
      error: (err: HttpErrorResponse) => {
        this.busyState.setBusy(false);
        let problem = err.error as ValidationProblemDetails;
        problem.detail = problem.detail ?? problem.status === 401 ? 'Incorrect code.' : 'Server Error. Try again later.';
        this.apiProblems = problem;
      }
    });
  }
}

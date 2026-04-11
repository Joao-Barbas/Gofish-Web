// signup.component.ts

import { AbstractControl, FormBuilder, FormsModule, ReactiveFormsModule, ValidationErrors, Validators } from '@angular/forms';
import { Component, inject, OnInit } from '@angular/core';
import { Router, RouterLink } from '@angular/router';
import { CommonModule } from '@angular/common';
import { HttpErrorResponse } from '@angular/common/http';
import { FirstKeyPipe } from '@gofish/shared/pipes/first-key.pipe';
import { AuthService } from '@gofish/shared/services/auth.service';
import { Api, Path } from '@gofish/shared/constants';
import { ValidationProblemDetails } from '@gofish/shared/core/problem-details';
import { RegexMatchesPipe } from '@gofish/shared/pipes/regex-matches.pipe';
import { LoadingState } from '@gofish/shared/core/loading-state';
import { BusyState } from '@gofish/shared/core/busy-state';
import { AsyncButtonComponent } from "@gofish/shared/components/async-button/async-button.component";
import { LettersOnlyDirective } from '@gofish/shared/directives/letters-only.directive';
import { AuthApi } from '@gofish/shared/api/auth.api';
import { SignUpReqDTO, SignUpResDTO } from '@gofish/shared/dtos/auth.dto';
import { GofishValidators } from '@gofish/shared/core/gofish-validators';

/**
 * Sign-up page component responsible for user registration.
 *
 * Responsibilities:
 * - Collect and validate registration form data
 * - Enforce password and consent requirements
 * - Submit sign-up requests to the backend
 * - Handle API validation errors and successful authentication
 * - Trigger external authentication flows
 */
@Component({
  selector: 'app-signup',
  imports: [
    ReactiveFormsModule,
    CommonModule,
    RouterLink,
    FormsModule,
    RegexMatchesPipe,
    AsyncButtonComponent,
    LettersOnlyDirective
  ],
  templateUrl: './signup.component.html',
  styleUrl: './signup.component.css',
})
export class SignupComponent implements OnInit {
  private readonly router      = inject(Router);
  private readonly authService = inject(AuthService);
  private readonly authApi     = inject(AuthApi);

  /** Form builder used to create the sign-up form. */
  readonly formBuilder = inject(FormBuilder);

  /** Pipe instance used to access the first key of validation error objects. */
  readonly firstKey    = inject(FirstKeyPipe);

  /** Loading state used for UI feedback. */
  readonly loadingState: LoadingState = new LoadingState();

  /** Busy state used to prevent duplicate submissions. */
  readonly busyState: BusyState       = new BusyState();

  /** Shared route path constants used in templates. */
  readonly Path = Path;

  /** Shared API constants used in templates and actions. */
  readonly Api  = Api;

  /**
   * Reactive form used to collect user registration data.
   */
  signUpForm = this.formBuilder.group({
    email: ['', [
      Validators.required,
      Validators.email
    ]],
    password: ['', [
      Validators.required,
      Validators.minLength(6),
      (control: AbstractControl) => this.passwordStrong(control)
    ]],
    firstName: ['', Validators.required],
    lastName: ['', Validators.required],
    userName: ['', [
      Validators.required,
      GofishValidators.alphanumeric
    ]],
    confirmPassword: [''],
  }, { validators: [
    (control: AbstractControl) => this.passwordMatch(control),
    (control: AbstractControl) => this.passwordNotEmail(control)
  ]});

  /** API validation or registration problems returned by the backend. */
  apiProblems: ValidationProblemDetails | null = null;

  /** Current form-level validation errors. */
  formErrors: ValidationErrors | null = this.signUpForm.errors;

  /** Indicates whether registration completed successfully. */
  signUpSuccess: boolean = false;

  /** Controls password visibility in the UI. */
  showPwd: boolean = false;

  /** Indicates whether the age consent checkbox is checked. */
  ageConcentChecked: boolean = false;

  /** Indicates whether the policy consent checkbox is checked. */
  policyConcentChecked: boolean = false;

  /** Indicates whether an invalid registration attempt was made without required consent. */
  invalidSignUpAttempted: boolean = false;

  /**
   * Redirects the user if already authenticated.
   */
  ngOnInit(): void {
    if (!this.authService.isAuthenticated()) return;
    this.router.navigate([Path.HOME]);
  }

  // Form errors/validations

  /**
   * Validates that the password is not equal to the email.
   *
   * @param control Form group control
   * @returns Validation error when password matches email, otherwise null
   */
  private passwordNotEmail(control: AbstractControl): ValidationErrors | null {
    let email = control.get('email')?.value;
    let password = control.get('password')?.value;
    if (password && email && password === email) return { 'passwordnotemail': true };
    return null;
  }

  /**
   * Validates that password and confirm password match.
   *
   * @param control Form group control
   * @returns Validation error when passwords do not match, otherwise null
   */
  private passwordMatch(control: AbstractControl): ValidationErrors | null {
    let password = control.get('password')?.value;
    let confirm = control.get('confirmPassword')?.value;
    if (password && password != confirm) return { 'passwordmismatch': true };
    return null;
  }

  /**
   * Validates password strength requirements.
   *
   * Rules:
   * - Must contain at least one number
   * - Must contain at least one uppercase character
   * - Must contain at least one special character
   *
   * @param control Password control
   * @returns Validation errors for failed strength rules, otherwise null
   */
  private passwordStrong(control: AbstractControl): ValidationErrors | null {
    const value = control.value || '';
    const errors: ValidationErrors = {};

    if (!/\d/.test(value)) errors['nonumber'] = true;
    if (!/[A-Z]/.test(value)) errors['nouppercase'] = true;
    if (!/[^a-zA-Z0-9 ]/.test(value)) errors['nospecial'] = true;

    return Object.keys(errors).length ? errors : null;
  }

  /**
   * Returns validation errors for a given control only when
   * the control is invalid and has been interacted with.
   *
   * @param name Control name
   * @returns Validation errors for the specified control or null
   */
  private controlError(name: string): ValidationErrors | null {
    let control = this.signUpForm.get(name);
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
    const g = this.signUpForm.errors;
    const s = this.apiProblems;
    // Field-level
    if (e('email')?.['required']) return 'Email is required.';
    if (e('email')?.['email']) return 'Enter a valid e-mail address.';
    if (e('firstName')?.['required']) return 'First name is required.';
    if (e('lastName')?.['required']) return 'Last name is required.';
    if (e('userName')?.['required']) return 'Unique user name is required.';
    if (e('userName')?.['alphanumeric']) return 'Username can not contain special characters or spaces.';
    if (e('password')?.['required']) return 'Password is required.';
    if (e('password')?.['minlength']) return 'Password needs atleast six characters.';
    if (e('password')?.['nonumber']) return 'Password needs at least one number.';
    if (e('password')?.['nouppercase']) return 'Passowrd needs at least one uppercase character.';
    if (e('password')?.['nospecial']) return 'Password needs one or more special character(s).';
    // Group-level
    if (g?.['passwordmismatch']) return 'Password\'s don\'t match.';
    if (g?.['passwordnotemail']) return 'Password can\'t be the same as email.';
    // Api errors
    return s?.detail ?? null;
  }

  // End form errors/validations

  /**
   * Validates consent and form state, then submits the sign-up request.
   *
   * Behavior:
   * - Requires age and policy consent
   * - Marks form controls as touched
   * - Clears previous API problems
   * - Stops when the form is invalid
   * - Authenticates the user and redirects on success
   */
  onSubmit() {
    if (!this.ageConcentChecked || !this.policyConcentChecked) {
      this.invalidSignUpAttempted = false;
      setTimeout(() => this.invalidSignUpAttempted = true);
      return;
    }

    this.signUpForm.markAllAsTouched();
    this.apiProblems = null;
    if (this.signUpForm.invalid) return;
    this.busyState.setBusy(true);
    this.signUpSuccess = false;

    this.authApi.signUp(this.signUpForm.value as SignUpReqDTO).subscribe({
      next: (res: SignUpResDTO) => {
        this.busyState.setBusy(false);
        this.signUpSuccess = true;
        setTimeout(() => {
          this.signUpSuccess = false;
          this.signUpForm.reset();
          this.authService.insertToken(res.token!);
          this.router.navigate([Path.FORUM]);
        }, 1000);
      },
      error: (err: HttpErrorResponse) => {
        this.busyState.setBusy(false);
        let problem = err.error as ValidationProblemDetails;
        problem.detail = problem.detail ?? 'Server Error. Try again later.';
        this.apiProblems = problem;
      }
    })
  }

  /**
   * Starts the Google external authentication flow.
   */
  onGoogle() {
    window.location.href = Api.Auth.action('ExternalLogin?provider=Google');
  }
}

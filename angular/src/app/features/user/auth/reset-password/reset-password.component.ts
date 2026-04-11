// reset-password.component.ts

import { HttpErrorResponse } from '@angular/common/http';
import { Component, inject, signal } from '@angular/core';
import { rxResource } from '@angular/core/rxjs-interop';
import { AbstractControl, FormControl, FormGroup, ReactiveFormsModule, ValidationErrors, Validators } from '@angular/forms';
import { Router, RouterLink } from '@angular/router';
import { UserSecurityApi } from '@gofish/shared/api/user-security.api';
import { AsyncButtonComponent } from '@gofish/shared/components/async-button-3/async-button-3.component';
import { Path } from '@gofish/shared/constants';
import { BusyState } from '@gofish/shared/core/busy-state';
import { GofishValidators } from '@gofish/shared/core/gofish-validators';
import { ProblemDetails } from '@gofish/shared/core/problem-details';
import { FormErrorMessages, ReactiveFormsController } from '@gofish/shared/core/reactive-forms-controller';
import { NumbersOnlyDirective } from '@gofish/shared/directives/numbers-only.directive';
import { AuthService } from '@gofish/shared/services/auth.service';
import { toast } from 'ngx-sonner';

/**
 * Supported body states for the reset password flow.
 */
type BodyView = 'enter-email' | 'new-password';

/**
 * Component responsible for the password reset workflow.
 *
 * Responsibilities:
 * - Collect the user's email address for password reset
 * - Collect the reset code and new password
 * - Validate both forms using reactive form rules
 * - Submit forgot-password and reset-password requests to the backend
 * - Track busy state and success state during the flow
 */
@Component({
  selector: 'gf-reset-password',
  imports: [
    ReactiveFormsModule,
    AsyncButtonComponent
  ],
  templateUrl: './reset-password.component.html',
  styleUrl: './reset-password.component.css',
})
export class ResetPasswordComponent {
  /** Service used to access authentication-related state and actions. */
  readonly authService = inject(AuthService);

  /** API used to perform forgot-password and reset-password operations. */
  readonly userSecurityApi = inject(UserSecurityApi);

  /** Router instance used for navigation actions. */
  readonly router = inject(Router);

  /** Busy state used while password reset requests are in progress. */
  readonly busyState: BusyState = new BusyState();

  /** Shared route path constants used in templates. */
  readonly Path = Path;

  /** Toast API exposed to the template if needed. */
  readonly toast = toast;

  /** Current step of the password reset flow. */
  bodyView = signal<BodyView>('enter-email');

  /** Indicates whether the password reset operation completed successfully. */
  resetSucceeded = signal<boolean>(false);

  /** Stores the email address used in the reset flow. */
  sentEmail = signal<string>(null!);

  /**
   * Form controller for the first step of the flow,
   * where the user provides their email address.
   */
  enterEmailForm = new ReactiveFormsController(
    new FormGroup({
      email: new FormControl('', {
        nonNullable: true,
        validators: [Validators.required, Validators.email]
      })
    }),
    new FormErrorMessages({
      controls: {
        email: {
          required: 'Enter an e-mail address.',
          email: 'Enter a valid e-mail address.'
        }
      }
    })
  );

  /**
   * Form controller for the second step of the flow,
   * where the user provides the reset code and new password.
   */
  newPasswordForm = new ReactiveFormsController(
    new FormGroup({
      code: new FormControl('', {
        nonNullable: true,
        validators: [Validators.required]
      }),
      newPassword: new FormControl('', {
        nonNullable: true,
        validators: [
          Validators.required,
          Validators.minLength(6),
          GofishValidators.strongPassword(),
        ]
      }),
      confirmPassword: new FormControl('', {
        nonNullable: true,
        validators: [Validators.required]
      })
    }, {
      validators: [
        GofishValidators.passwordsMatch('newPassword', 'confirmPassword')
      ]
    }),
    new FormErrorMessages({
      controls: {
        code: {
          required: 'Please enter the code sent to your email.',
        },
        newPassword: {
          required: 'Please enter your new password.',
          hasuppercase: 'Passowrd needs at least one uppercase character.',
          hasnumber: 'Password needs at least one number.',
          hasspecialchar: 'Password needs one or more special character(s).',
        },
        confirmPassword: {
          required: 'Please re-enter your new password.',
        }
      },
      group: {
        passwordsmatch: 'Password\'s don\'t match.'
      }
    })
  );

  /**
   * Routes the primary action to the correct step handler
   * according to the current body view.
   */
  onPositive() {
    switch (this.bodyView()) {
      case 'enter-email':
        this.onForgotPassword();
        return;
      case 'new-password':
        this.onResetPassword();
        return;
    }
  }

  /**
   * Validates the email form and sends the forgot-password request.
   *
   * Behavior:
   * - Marks the form as touched
   * - Stops when the form is invalid
   * - Clears previous problem details
   * - Stores the email and advances the flow on success
   */
  onForgotPassword() {
    const form = this.enterEmailForm.form;
    form.markAllAsTouched();
    if (form.invalid) return;

    this.enterEmailForm.setProblemDetails(null);
    this.busyState.setBusy(true);

    let { email } = form.getRawValue();

    this.userSecurityApi.forgotPassoword({
      email: email
    }).subscribe({
      next: () => {
        this.sentEmail.set(email);
        this.bodyView.set('new-password');
        this.busyState.setBusy(false);
      },
      error: (err: HttpErrorResponse) => {
        this.enterEmailForm.setProblemDetails(err.error);
        this.busyState.setBusy(false);
      }
    });
  }

  /**
   * Validates the reset form and sends the reset-password request.
   *
   * Behavior:
   * - Marks the form as touched
   * - Stops when the form is invalid
   * - Clears previous problem details
   * - Marks the reset flow as successful on success
   */
  onResetPassword() {
    const form = this.newPasswordForm.form;
    form.markAllAsTouched();
    if (form.invalid) return;

    this.newPasswordForm.setProblemDetails(null);
    this.busyState.setBusy(true);

    let { code, newPassword } = form.getRawValue();

    this.userSecurityApi.resetPassword({
      email: this.sentEmail(),
      code: code,
      newPassword: newPassword
    }).subscribe({
      next: () => {
        console.log('Reset succeed');
        this.resetSucceeded.set(true);
        this.busyState.setBusy(false);
      },
      error: (err: HttpErrorResponse) => {
        this.newPasswordForm.setProblemDetails(err.error);
        this.busyState.setBusy(false);
      }
    });
  }
}

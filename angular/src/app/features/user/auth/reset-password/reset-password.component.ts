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

type BodyView = 'enter-email' | 'new-password';

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
  readonly authService = inject(AuthService);
  readonly userSecurityApi = inject(UserSecurityApi);
  readonly router = inject(Router);

  readonly busyState: BusyState = new BusyState();

  readonly Path = Path;
  readonly toast = toast;

  bodyView = signal<BodyView>('enter-email');
  resetSucceeded = signal<boolean>(false);
  sentEmail = signal<string>(null!);

  // Forms

  enterEmailForm = new ReactiveFormsController(
    new FormGroup({
      email: new FormControl('', {
        nonNullable: true,
        validators: [ Validators.required, Validators.email ]
      })
    }),
    new FormErrorMessages({
      controls: { email: {
        required: 'Enter an e-mail address.',
        email: 'Enter a valid e-mail address.'
      }}
    })
  );

  newPasswordForm = new ReactiveFormsController(
    new FormGroup({
      code: new FormControl('', {
        nonNullable: true,
        validators: [ Validators.required ]
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
        validators: [ Validators.required ]
      })
    }, { validators: [
      GofishValidators.passwordsMatch('newPassword', 'confirmPassword')
    ]}),
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

  // End forms
  // Events

  onPositive() {
    switch (this.bodyView()) {
    case ('enter-email'): this.onForgotPassword(); return;
    case ('new-password'): this.onResetPassword(); return;
    }
  }

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
        console.log('Reset succeed')
        this.resetSucceeded.set(true);
        this.busyState.setBusy(false);
      },
      error: (err: HttpErrorResponse) => {
        this.newPasswordForm.setProblemDetails(err.error);
        this.busyState.setBusy(false);
      }
    });
  }

  // End events
}

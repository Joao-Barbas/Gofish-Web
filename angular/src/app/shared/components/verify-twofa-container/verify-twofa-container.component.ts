// verify-twofa-container.component.ts

import { CommonModule } from '@angular/common';
import { HttpErrorResponse } from '@angular/common/http';
import { Component, inject, input, output, OutputEmitterRef, signal } from '@angular/core';
import { FormGroup, FormControl, Validators, ReactiveFormsModule, FormsModule } from '@angular/forms';
import { UserSecurityApi } from '@gofish/shared/api/user-security.api';
import { getFirstError, ProblemDetails, ValidationProblemDetails } from '@gofish/shared/core/problem-details';
import { ReactiveFormsController, FormErrorMessages } from '@gofish/shared/core/reactive-forms-controller';
import { NumbersOnlyDirective } from '@gofish/shared/directives/numbers-only.directive';
import { ValidateTwoFactorCodeResDTO } from '@gofish/shared/dtos/user-security.dto';
import { SecurityInfo } from '@gofish/shared/models/user-security.models';

export type TwofaVerificationState = 'ready' | 'loading' | 'succeeded';

@Component({
  selector: 'gf-verify-twofa-container',
  imports: [
    CommonModule,
    FormsModule,
    ReactiveFormsModule,
    NumbersOnlyDirective
  ],
  templateUrl: './verify-twofa-container.component.html',
  styleUrl: './verify-twofa-container.component.css',
})
export class VerifyTwofaContainerComponent {
  readonly userSecurityApi = inject(UserSecurityApi);

  readonly state     = output<TwofaVerificationState>();
  readonly verified  = output<{ token: string }>();

  twofaCodeFormController = new ReactiveFormsController(
    new FormGroup({
      code: new FormControl('', { nonNullable: true, validators: [ Validators.required ] })
    }),
    new FormErrorMessages({
      controls: { code: { required: 'Please enter your two factor code.' }}
    })
  );

  onSubmit(): void {
    const form = this.twofaCodeFormController.form;
    form.markAllAsTouched();

    if (form.invalid) {
      this.state.emit('ready');
      return;
    }

    this.state.emit('loading');
    this.twofaCodeFormController.setProblemDetails(null);

    this.userSecurityApi.validateTwoFactorCode({
      code: form.value.code?.trim() ?? ''
    }).subscribe({
      next: (res: ValidateTwoFactorCodeResDTO) => {
        this.state.emit('succeeded');
        this.verified.emit({ token: res.token })
      },
      error: (err: HttpErrorResponse) => {
        this.state.emit('ready');
        console.log(err);
        console.log(err.error);
        let problem = err.error as ValidationProblemDetails;
        this.twofaCodeFormController.setProblemDetails(problem);
      },
    });
  }
}

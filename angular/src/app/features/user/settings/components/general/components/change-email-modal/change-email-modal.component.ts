// change-email-modal.component.ts

import { Component, computed, effect, inject, input, output, signal, viewChild } from '@angular/core';
import { InviteToGroupsModalComponent } from '@gofish/shared/components/invite-to-groups-modal/invite-to-groups-modal.component';
import { ModalController, ModalKey, SimpleModal } from '@gofish/shared/core/modal-controller';
import { LoadingSpinnerComponent } from "@gofish/shared/components/loading-spinner/loading-spinner.component";
import { TwofaVerificationState, VerifyTwofaContainerComponent } from "@gofish/shared/components/verify-twofa-container/verify-twofa-container.component";
import { rxResource } from '@angular/core/rxjs-interop';
import { AuthService } from '@gofish/shared/services/auth.service';
import { UserSecurityApi } from '@gofish/shared/api/user-security.api';
import { CommonModule } from '@angular/common';
import { FormControl, FormGroup, FormsModule, NgModel, ReactiveFormsModule, Validators } from '@angular/forms';
import { TwoFactorMethod } from '@gofish/shared/enums/two-factor-method.enum';
import { BusyState } from '@gofish/shared/core/busy-state';
import { finalize } from 'rxjs';
import { CompleteEmailChangeReqDTO, InitiateEmailChangeReqDTO, InitiateEmailChangeResDTO } from '@gofish/shared/dtos/user-security.dto';
import { AsyncButtonComponent } from "@gofish/shared/components/async-button-3/async-button-3.component";
import { ValidationProblemDetails } from '@gofish/shared/core/problem-details';
import { FormErrorMessages, ReactiveFormsController } from '@gofish/shared/core/reactive-forms-controller';
import { HttpErrorResponse } from '@angular/common/http';
import { NumbersOnlyDirective } from "@gofish/shared/directives/numbers-only.directive";
import { UserManagerService } from '@gofish/shared/services/user-manager.service';
import { toast } from 'ngx-sonner';

type BodyState = 'none' | 'verify' | 'new-email' | 'confirm';

@Component({
  selector: 'gf-change-email-modal',
  host: {
    'animate.enter': 'on-enter',
    'animate.leave': 'on-leave',
  },
  imports: [
    CommonModule,
    VerifyTwofaContainerComponent,
    LoadingSpinnerComponent,
    FormsModule,
    AsyncButtonComponent,
    ReactiveFormsModule,
    NumbersOnlyDirective
],
  templateUrl: './change-email-modal.component.html',
  styleUrl: './change-email-modal.component.css',
})
export class ChangeEmailModalComponent implements SimpleModal {
  static readonly Key: ModalKey = 'gf-change-email-modal';
  readonly controller = new ModalController(ChangeEmailModalComponent.Key);

  readonly userManagerService = inject(UserManagerService);
  readonly authService = inject(AuthService);
  readonly userSecurityApi = inject(UserSecurityApi);

  readonly busyState = new BusyState();

  readonly toast = toast;

  private twofaToken: string | null = null;
  private changeEmailToken: string | null = null;

  securityInfo = rxResource({
    params: () => this.authService.userId(),
    stream: ({ params: id }) => this.userSecurityApi.getSecurityInfo()
  });

  negative = output<void>();
  positive = output<string>();

  twoFactorEnabled = computed(() => this.securityInfo.value()?.twoFactorEnabled)
  twoFactorMethod = computed(() => this.securityInfo.value()?.twoFactorMethod)

  bodyState = signal<BodyState>('none');
  changeSucceeded = signal<boolean>(false);

  verifyTwofaComponent = viewChild<VerifyTwofaContainerComponent>('verifyTwofaComponent');

  newEmailFormController = new ReactiveFormsController(
    new FormGroup({
      newEmail: new FormControl('', {
        nonNullable: true,
        validators: [ Validators.required, Validators.email ]
      }),
    }),
    new FormErrorMessages({
      controls: { newEmail: {
        required: 'Please enter a email.',
        email: 'Enter a valid e-mail address.',
      }}
    })
  );

  confirmEmailFormController = new ReactiveFormsController(
    new FormGroup({
      code: new FormControl('', {
        nonNullable: true,
        validators: [ Validators.required ]
      })
    }),
    new FormErrorMessages({
      controls: { code: { required: 'Please enter the code sent to your email.' }}
    })
  );

  positiveButtonLabel = computed(() => {
    switch (this.bodyState()) {
    case 'verify':    return 'Verify';
    case 'new-email': return 'Continue';
    case 'confirm':   return 'Confirm';
    }
    return '';
  });

  negativeButtonLabel = computed(() => {
    switch (this.bodyState()) {
    case 'verify':    return 'Cancel';
    case 'new-email': return 'Cancel';
    case 'confirm':   return 'Back';
    }
    return 'Cancel';
  });

  constructor() {
    effect(() => {
      if (!this.securityInfo.hasValue()) return;
      if (this.bodyState() !== 'none') return;

      if (!this.twoFactorEnabled()) {
        this.bodyState.set('new-email');
        return;
      } else {
        this.bodyState.set('verify');
        if (this.twoFactorMethod() !== TwoFactorMethod.Email) return;
        this.userSecurityApi.sendTwoFactorEmail().subscribe({
          error: () => this.toast.error('Something went wrong while sending verification email. Please try again later.')
        });
      }

      return;
    })
  }

  // Modal events

  onPositive(): void {
    switch (this.bodyState()) {
    case 'verify': this.onVerify(); break;
    case 'new-email': this.onNewEmailSubmit(); break;
    case 'confirm': this.onNewEmailConfirm(); break;
    }
  }

  onNegative(): void {
    switch (this.bodyState()) {
    case 'verify': this.controller.close(); break;
    case 'new-email': this.controller.close(); break;
    case 'confirm': this.bodyState.set('new-email'); break;
    default: this.controller.close(); break;
    }
  }

  // End modal events
  // Events

  onVerify() {
    this.verifyTwofaComponent()?.onSubmit();
  }

  onTwofaVerified({ token }: { token: string }): void {
    this.twofaToken = token;
    this.busyState.setBusy(false);
    this.bodyState.set('new-email');
  }

  onTwofaStateChange(state: TwofaVerificationState): void {
    console.log(state);
    this.busyState.setBusy(state === 'loading' ? true : false);
  }

  onNewEmailSubmit() {
    const form = this.newEmailFormController.form;
    form.markAllAsTouched();
    if (form.invalid) return;

    this.newEmailFormController.setProblemDetails(null);
    this.busyState.setBusy(true);

    this.userSecurityApi.initiateEmailChange({
      newEmail: (form.value.newEmail as string).trim(),
      twoFactorToken: this.twoFactorEnabled() ? this.twofaToken ?? undefined : undefined
    }).pipe(finalize(() => {
      this.busyState.setBusy(false);
    })).subscribe({
      next: (res: InitiateEmailChangeResDTO) => {
        this.changeEmailToken = res.token
        this.bodyState.set('confirm');
      },
      error: (err: HttpErrorResponse) => {
        let problem = err.error as ValidationProblemDetails;
        this.newEmailFormController.setProblemDetails(problem);
      }
    });
  }

  onNewEmailConfirm() {
    const form = this.confirmEmailFormController.form;
    form.markAllAsTouched();
    if (form.invalid) return;

    this.confirmEmailFormController.setProblemDetails(null);
    this.busyState.setBusy(true);
    if (!this.changeEmailToken) return;

    this.userSecurityApi.completeEmailChange({
      token: this.changeEmailToken,
      code: form.getRawValue().code.trim()
    }
    ).pipe(finalize(() => {
      this.busyState.setBusy(false);
    })).subscribe({
      next: (res) => {
        this.changeSucceeded.set(true);
        this.userManagerService.refetchData();
        this.positive.emit(this.newEmailFormController.form.value.newEmail || '');
      },
      error: (err: HttpErrorResponse) => {
        let problem = err.error as ValidationProblemDetails;
        this.confirmEmailFormController.setProblemDetails(problem);
      }
    });
  }
}

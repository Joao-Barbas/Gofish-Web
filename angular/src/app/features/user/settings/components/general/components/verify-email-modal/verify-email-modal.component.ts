// verify-email-modal.component.ts

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

@Component({
  selector: 'gf-verify-email-modal',
  host: {
    'animate.enter': 'on-enter',
    'animate.leave': 'on-leave',
  },
  imports: [
    CommonModule,
    LoadingSpinnerComponent,
    FormsModule,
    AsyncButtonComponent,
    ReactiveFormsModule,
    NumbersOnlyDirective
  ],
  templateUrl: './verify-email-modal.component.html',
  styleUrl: './verify-email-modal.component.css',
})
export class VerifyEmailModalComponent implements SimpleModal {
  static readonly Key: ModalKey = 'gf-verify-email-modal';
  readonly controller = new ModalController(VerifyEmailModalComponent.Key);

  readonly userManagerService = inject(UserManagerService);
  readonly authService = inject(AuthService);
  readonly userSecurityApi = inject(UserSecurityApi);

  readonly busyState = new BusyState();

  readonly toast = toast;

  negative = output<void>();
  positive = output<void>();

  sendEmail = rxResource({
    params: () => this.authService.userId(),
    stream: ({ params: id }) => this.userSecurityApi.sendVerificationEmail()
  });

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

  // Modal events

  onPositive(): void { }
  onNegative(): void { }

  // End modal events
  // Events

  onVerifyEmail() {
    const form = this.confirmEmailFormController.form;
    form.markAllAsTouched();
    if (form.invalid) return;

    this.confirmEmailFormController.setProblemDetails(null);
    this.busyState.setBusy(true);

    this.userSecurityApi.verifyEmail({
      code: form.value.code!.trim()
    }
    ).pipe(finalize(() => {
      this.busyState.setBusy(false);
    })).subscribe({
      next: (res) => {
        this.toast.success("Email verified successfully");
        this.userManagerService.refetchData();
        this.positive.emit();
        this.controller.close();
      },
      error: (err: HttpErrorResponse) => {
        let problem = err.error as ValidationProblemDetails;
        this.confirmEmailFormController.setProblemDetails(problem);
      }
    });
  }
}

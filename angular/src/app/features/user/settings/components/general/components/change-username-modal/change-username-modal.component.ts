// change-username-modal.component.ts

import { Component, inject, output, signal } from '@angular/core';
import { UserApi } from '@gofish/shared/api/user.api';
import { BusyState } from '@gofish/shared/core/busy-state';
import { LoadingState } from '@gofish/shared/core/loading-state';
import { ModalController } from '@gofish/shared/core/modal-controller';
import { AsyncButtonComponent } from "@gofish/shared/components/async-button-3/async-button-3.component";
import { SimpleModal } from '@gofish/shared/models/modal.model';
import { FormBuilder, FormGroup, ReactiveFormsModule, ValidationErrors, Validators } from '@angular/forms';
import { ValidationProblemDetails } from '@gofish/shared/core/problem-details';
import { HttpErrorResponse } from '@angular/common/http';

@Component({
  selector: 'app-change-username-modal',
  host: {
    'animate.enter': 'on-enter',
    'animate.leave': 'on-leave',
  },
  imports: [
    AsyncButtonComponent,
    ReactiveFormsModule
  ],
  templateUrl: './change-username-modal.component.html',
  styleUrl: './change-username-modal.component.css',
})
export class ChangeUsernameModalComponent implements SimpleModal {
  private readonly userApi     = inject(UserApi);
  private readonly formBuilder = inject(FormBuilder);

  readonly modalController = new ModalController('app-change-username-modal');
  readonly busyState       = new BusyState();
  readonly loadingState    = new LoadingState();

  negative = output<void>();
  positive = output<string>();

  form: FormGroup = this.formBuilder.group({
    userName: ['', [ Validators.required ]]
  });

  error   = signal<string | null>(null);
  success = signal<boolean>(false);

  onPositive(): void {
    this.form.markAllAsTouched();
    if (this.form.invalid) {
      this.error.set('Enter a username');
      return;
    };

    this.success.set(false);
    this.busyState.setBusy(true);
    this.userApi.patchUser({
      userName: this.form.value.userName
    }).subscribe({
      next: () => {
        this.busyState.setBusy(false);
        this.success.set(true);
        this.positive.emit(this.form.value.userName);
        setTimeout(() => {
          this.success.set(false);
          this.modalController.close();
        }, 2000);
      },
      error: (err: HttpErrorResponse) => {
        this.busyState.setBusy(false);
        console.log(err);
        let problem = err.error as ValidationProblemDetails;
        this.error.set(problem.errors?.['DuplicateUserName']?.[0] ?? problem.detail ?? 'Server Error. Try again later.')
      },
    })
  };

  onNegative(): void {
    this.modalController.close();
    this.negative.emit();
  };
}

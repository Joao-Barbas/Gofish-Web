// change-birthdate-modal.component.ts

import { Component, inject, output, signal, computed } from '@angular/core';
import { UserApi } from '@gofish/shared/api/user.api';
import { BusyState } from '@gofish/shared/core/busy-state';
import { ModalController } from '@gofish/shared/core/modal-controller';
import { SimpleModal } from '@gofish/shared/models/modal.model';
import { FormControl, FormGroup, FormsModule, ReactiveFormsModule, Validators } from '@angular/forms';
import { ValidationProblemDetails } from '@gofish/shared/core/problem-details';
import { HttpErrorResponse } from '@angular/common/http';
import { AsyncButtonComponent } from "@gofish/shared/components/async-button-3/async-button-3.component";
import { ReactiveFormsController, FormErrorMessages } from '@gofish/shared/core/reactive-forms-controller';
import { GofishValidators } from '@gofish/shared/core/gofish-validators';

@Component({
  selector: 'app-change-birthdate-modal',
  host: {
    'animate.enter': 'on-enter',
    'animate.leave': 'on-leave',
  },
  imports: [
    FormsModule,
    ReactiveFormsModule,
    AsyncButtonComponent
],
  templateUrl: './change-birthdate-modal.component.html',
  styleUrl: './change-birthdate-modal.component.css',
})
export class ChangeBirthdateModalComponent implements SimpleModal {
  static readonly Key = 'app-change-birthdate-modal';

  private readonly userApi = inject(UserApi);

  readonly modalController = new ModalController(ChangeBirthdateModalComponent.Key);
  readonly busyState       = new BusyState();

  negative = output<void>();
  positive = output<string>();

  success = signal<boolean>(false);

  birthDateForm = new ReactiveFormsController(
    new FormGroup({
      birthDate: new FormControl('', {
        nonNullable: true,
        validators: [ Validators.required, GofishValidators.minimumAge(13) ]
      })
    }),
    new FormErrorMessages({
      controls: { birthDate: {
        required: 'Please enter your birth date.',
        minimumage: 'You must be at least 13 years old to continue.'
      }}
    })
  );

  onPositive(): void {
    const form = this.birthDateForm.form;
    form.markAllAsTouched();
    if (form.invalid) return;

    this.birthDateForm.setProblemDetails(null);
    this.success.set(false);
    this.busyState.setBusy(true);

    let { birthDate } = form.getRawValue();

    this.userApi.patchUser({
      birthDate: new Date(birthDate).toISOString()
    }).subscribe({
      next: () => {
        this.success.set(true);
        this.positive.emit(birthDate);
        setTimeout(() => {
          this.success.set(false);
          this.modalController.close();
        }, 2000);
        this.busyState.setBusy(false);
      },
      error: (err: HttpErrorResponse) => {
        let problem = err.error as ValidationProblemDetails;
        this.birthDateForm.setProblemDetails(problem);
        this.busyState.setBusy(false);
      },
    });
  }

  onNegative(): void {
    this.modalController.close();
    this.negative.emit();
  }
}

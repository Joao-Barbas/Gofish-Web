import { Component, inject, output, signal } from '@angular/core';
import { UserApi } from '@gofish/shared/api/user.api';
import { BusyState } from '@gofish/shared/core/busy-state';
import { LoadingState } from '@gofish/shared/core/loading-state';
import { ModalController } from '@gofish/shared/core/modal-controller';
import { AsyncButtonComponent } from "@gofish/shared/components/async-button-2/async-button-2.component";
import { SimpleModal } from '@gofish/shared/models/modal.model';
import { FormBuilder, FormGroup, ReactiveFormsModule, ValidationErrors, Validators } from '@angular/forms';
import { ValidationProblemDetails } from '@gofish/shared/core/problem-details';
import { HttpErrorResponse } from '@angular/common/http';

@Component({
  selector: 'app-change-username-modal',
  imports: [
    AsyncButtonComponent,
    ReactiveFormsModule
  ],
  template: `
    <div class="gf-modal-backdrop" (click)="$event.stopPropagation()">
      <div class="gf-flow-vertical gf-modal-shell gf-gap-16" (click)="$event.stopPropagation()">
        <div class="gf-flow-horizontal gf-justify-between gf-items-center">
          <h5>Change usernam</h5>
          <button class="gf-modal-close-button" (click)="onNegative()">
            <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
              <path d="M18 6 6 18"/>
              <path d="m6 6 12 12"/>
            </svg>
          </button>
        </div>
        <div class="gf-modal-separator"></div>
        <div>
          <form id="form" class="gf-flow-vertical gf-modal-inputs-form" [formGroup]="form" (ngSubmit)="onPositive()">
            <div class="vertical-flow">
              <label>Username</label>
              <input type="text" id="username" formControlName="userName">
            </div>
          </form>
          @if (error(); as error) {
            <span class="gf-text-error">{{ error }}</span>
          }
        </div>
        <div class="gf-modal-separator"></div>
        <div>
          <div class="gf-flow-horizontal gf-gap-10">
            <gf-async-button
              class="btn-negative"
              type=button
              [labels]="{ idle: 'Cancel' }"
              [states]="{ disabled: this.busyState.busy() }"
              (click)="onNegative()">
            </gf-async-button>
            <gf-async-button
              class="btn-positive"
              type=button
              [labels]="{ idle: 'Change' }"
              [states]="{ busy: this.busyState.busy(), success: success() }"
              (click)="onPositive()">
            </gf-async-button>
          </div>
        </div>
      </div>
    </div>
  `,
  styles: `
    :host(.on-enter) {
      animation: modal-fade .2s ease-in-out;
    }
    :host(.on-enter) .gf-modal-shell {
      animation: modal-scale .2s cubic-bezier(0.34, 1.8, 0.64, 1);
    }
    :host(.on-leave) {
      opacity: 0;
      transition: opacity .2s ease-out;
    }

    .gf-modal-shell {
      border-radius: var(--gf-12);
      max-width: calc(416rem / 16);
    }

    gf-async-button {
      width: 100%;
      --async-btn-width: 100%;

      &.btn-negative {
        --async-btn-bg: var(--gf-light-bg-dark);
        --async-btn-color: var(--gf-light-text);
      }
    }

    h5 {
        color: var(--dark-text);
    }
  `,
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
        let problem = err.error as ValidationProblemDetails;
        this.error.set(problem.errors['DuplicateUserName']?.[0] ?? problem.detail ?? 'Server Error. Try again later.')
      },
    })
  };

  onNegative(): void {
    this.modalController.close();
    this.negative.emit();
  };
}

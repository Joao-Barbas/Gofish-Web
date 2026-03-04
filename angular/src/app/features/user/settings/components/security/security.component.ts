// security.component.ts

import { AbstractControl, FormBuilder, FormGroup, ReactiveFormsModule, ValidationErrors, Validators } from '@angular/forms';
import { HttpErrorResponse } from '@angular/common/http';
import { Component, inject, OnInit } from '@angular/core';
import { BusyState } from '@gofish/shared/core/busy-state';
import { ModalService } from '@gofish/shared/services/modal.service';
import { TotpValidationModalComponent } from '@gofish/features/user/settings/components/security/components/totp-validation-modal/totp-validation-modal.component';
import { LoadingState } from '@gofish/shared/core/loading-state';
import { TwoFactorMethod } from '@gofish/shared/models/user-security.models';
import { UserSecurityService } from '@gofish/shared/services/user-security.service';
import { ChangePasswordReqDTO, ChangePasswordResDTO, SecurityInfoResDTO } from '@gofish/shared/dtos/user-security.dto';
import { ProblemDetails } from '@gofish/shared/core/problem-details';
import { Api } from '@gofish/shared/constants';

type ModalOperation = 'change-password' | 'disable-2fa';

@Component({
  selector: 'app-security',
  imports: [ TotpValidationModalComponent, ReactiveFormsModule ],
  templateUrl: './security.component.html',
  styleUrl: './security.component.css',
})
export class SecurityComponent implements OnInit {
  private readonly userSecurityService = inject(UserSecurityService);
  private readonly formBuilder         = inject(FormBuilder);
  public  readonly modalService        = inject(ModalService);

  readonly busyState: BusyState = new BusyState;
  readonly loadingState: LoadingState = new LoadingState();

  readonly Api = Api;
  readonly TwoFactorMethod = TwoFactorMethod;

  hasTwoFactor: boolean = false;
  twoFactorMethod: TwoFactorMethod = TwoFactorMethod.None;
  modalErrorText: string | null = null;
  passwordChangeSuccess: boolean = false;

  changePasswordForm: FormGroup = this.formBuilder.group({
    currentPassword: [ '', [ Validators.required ]],
    newPassword: [ '', [
      Validators.required,
      Validators.minLength(6),
      Validators.pattern(/(?=.*[^a-zA-Z0-9 ])/)
    ]],
    confirmPassword: [ '', [ Validators.required ]]
  }, { validators: [
    (control: AbstractControl) => this.passwordsMatch(control),
    (control: AbstractControl) => this.notDuplicatePassword(control)
  ]});

  ngOnInit() {
    this.loadingState.start();
    this.userSecurityService.getSecurityInfo().subscribe({
      next: (res: SecurityInfoResDTO) => {
        this.hasTwoFactor    = res.twoFactorEnabled;
        this.twoFactorMethod = res.twoFactorMethod;
        this.loadingState.success();
      },
      error: (err: HttpErrorResponse) => {
        let res = err.error as ProblemDetails;
        this.loadingState.fail('Failed to load security info');
      }
    });
  }

  // Form errors/validations

  private passwordsMatch(control: AbstractControl): ValidationErrors | null {
    let np = control.get('newPassword')?.value;
    let cp = control.get('confirmPassword')?.value;
    if (np && cp && np !== cp) return { 'passwordmismatch': true };
    return null;
  }

  private notDuplicatePassword(control: AbstractControl): ValidationErrors | null {
    let c = control.get('currentPassword')?.value;
    let n = control.get('newPassword')?.value;
    if (c && n && c === n) return { 'duplicatepassword': true };
    return null;
  }

  private controlError(name: string): ValidationErrors | null {
    let control = this.changePasswordForm.get(name);
    if (!control) return null;
    if (!control.invalid || (!control.touched && !control.dirty)) return null;
    return control.errors;
  }

  getError(): string | null {
    const e = (field: string) => this.controlError(field);
    const g = this.changePasswordForm.errors;
    // Field-level
    if (e('currentPassword')?.['required']) return 'Current password is required';
    if (e('newPassword')?.['required']) return 'New password is required';
    if (e('newPassword')?.['minlength']) return 'New Password needs atleast 6 characters';
    if (e('newPassword')?.['pattern']) return 'New Password required one or more special character(s)';
    if (e('confirmPassword')?.['required']) return 'Please confirm your new password';
    // Group-level
    if (g?.['passwordmismatch']) return 'Passwords don\'t match';
    if (g?.['duplicatepassword']) return 'New password must differ from current password';
    // Server errors
    if (g?.['incorrectCredentials']) return 'Current password is incorrect';
    if (g?.['serverError']) return 'Something went wrong. Please try again later.';
    return null;
  }

  // End form errors/validation
  // Events

  onChangePassword(): void {
    this.changePasswordForm.markAllAsTouched();
    if (this.changePasswordForm.invalid) return;

    if (this.hasTwoFactor) {
      this.modalErrorText = null;
      this.modalService.open('confirm-deletion-modal');
      return;
    }

    this.busyState.setBusy(true);
    this.passwordChangeSuccess = false;

    this.userSecurityService.changePassword(this.changePasswordForm.value as ChangePasswordReqDTO).subscribe({
      next: () => {
        this.busyState.setBusy(false);
        this.passwordChangeSuccess = true;
        this.changePasswordForm.reset();
        setTimeout(() => {
          this.passwordChangeSuccess = false;
        }, 3000);
      },
      error: (err: HttpErrorResponse) => {
        this.busyState.setBusy(false);
        let problem = err.error as ProblemDetails;
        this.changePasswordForm.setErrors(problem.title === 'Identity Error'
          ? { incorrectCredentials: true }
          : { serverError: true }
        );
      }
    })
  }

  onTwoFactorDisable(): void {}
  onTwoFactorToTotp(): void {}

  // End events
  // Modal events

  onModalConfirm(totp: string): void {}
  onModalCancel(): void {}

  // End modal events
}

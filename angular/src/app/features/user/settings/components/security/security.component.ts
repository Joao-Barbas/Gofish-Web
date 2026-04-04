// security.component.ts

import { AbstractControl, FormBuilder, FormGroup, ReactiveFormsModule, ValidationErrors, Validators } from '@angular/forms';
import { HttpErrorResponse } from '@angular/common/http';
import { Component, inject, OnDestroy, OnInit } from '@angular/core';
import { Subscription } from 'rxjs';
import { BusyState } from '@gofish/shared/core/busy-state';
import { ModalService } from '@gofish/shared/services/modal.service';
import { TotpValidationModalComponent } from '@gofish/features/user/settings/components/security/components/totp-validation-modal/totp-validation-modal.component';
import { LoadingState } from '@gofish/shared/core/loading-state';
import { TwoFactorMethod } from '@gofish/shared/models/user-security.models';
import { ChangePasswordReqDTO, SecurityInfoResDTO } from '@gofish/shared/dtos/user-security.dto';
import { getFirstError, isProblemDetails, isValidationProblemDetails, ProblemDetails } from '@gofish/shared/core/problem-details';
import { Api, Path, PathSegment } from '@gofish/shared/constants';
import { AsyncButtonComponent } from "@gofish/shared/components/async-button/async-button.component";
import { Event, NavigationEnd, NavigationStart, Router, RouterOutlet, RouterLinkWithHref, RouterLink } from '@angular/router';
import { filter } from 'rxjs/operators';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { AuthService } from '@gofish/shared/services/auth.service';
import { UserSecurityApi } from '@gofish/shared/api/user-security.api';

@Component({
  selector: 'app-security',
  imports: [
    ReactiveFormsModule,
    RouterOutlet,
    TotpValidationModalComponent,
    AsyncButtonComponent,
    RouterLinkWithHref,
    RouterLink
],
  templateUrl: './security.component.html',
  styleUrl: './security.component.css',
})
export class SecurityComponent implements OnInit {
  private readonly formBuilder = inject(FormBuilder);
  private readonly router = inject(Router);
  private readonly userSecurityApi = inject(UserSecurityApi);

  readonly authService = inject(AuthService);
  readonly modalService = inject(ModalService);

  readonly busyState: BusyState = new BusyState;
  readonly loadingState: LoadingState = new LoadingState();

  readonly Path = Path;
  readonly Api = Api;
  readonly TwoFactorMethod = TwoFactorMethod;

  modalAction: 'change-password' | 'disable-2fa' = 'change-password';
  modalError: string | null = null;

  hasTwoFactor: boolean = false;
  twoFactorMethod: TwoFactorMethod = TwoFactorMethod.None;

  newPassSuccess: boolean = false;
  newPassApiErrors: ProblemDetails | null = null;
  newPassErrors: ValidationErrors | null = () => this.newPassForm.errors;

  newPassForm: FormGroup = this.formBuilder.group({
    currentPassword: [ '', [ Validators.required ]],
    newPassword: [ '', [
      Validators.required,
      Validators.minLength(6),
      Validators.pattern(/(?=.*[^a-zA-Z0-9 ])/)
    ]],
    confirmPassword: [ '', [ Validators.required ]],
    totpCode: [ '', []] // TODO: Change to "twofaCode". Needs backend change too
  }, { validators: [
    (control: AbstractControl) => this.passwordsMatch(control),
    (control: AbstractControl) => this.notDuplicatePassword(control)
  ]});

  constructor() {
    this.router.events.pipe(
      filter((event) => event instanceof NavigationEnd),
      filter((event) => event.urlAfterRedirects.endsWith(`/${PathSegment.SECURITY_SETTINGS}`)),
      takeUntilDestroyed()
    ).subscribe(() => {
      this.doGetSecurityInfo();
    });
  }

  ngOnInit() {
    this.doGetSecurityInfo();
  }

  doGetSecurityInfo() {
    if (this.authService.isExternalUser()) return;
    this.loadingState.start();
    this.userSecurityApi.getSecurityInfo().subscribe({
      next: (res: SecurityInfoResDTO) => {
        this.hasTwoFactor    = res.twoFactorEnabled;
        this.twoFactorMethod = res.twoFactorMethod;
        this.loadingState.success();
      },
      error: (err: HttpErrorResponse) => {
        let res = err.error as ProblemDetails;
        this.loadingState.fail('Something went wrong while trying to load security information.');
      }
    });
  }

  doChangePassword(): void {
    this.busyState.setBusy(true);
    this.newPassSuccess = false;
    this.userSecurityApi.changePassword(this.newPassForm.value as ChangePasswordReqDTO).subscribe({
      next: () => {
        this.busyState.setBusy(false);
        this.newPassSuccess = true;
        this.newPassForm.reset();
        setTimeout(() => {
          this.newPassSuccess = false;
        }, 3000);
      },
      error: (err: HttpErrorResponse) => {
        this.busyState.setBusy(false);
        if (!isProblemDetails(err.error)) return;
        this.newPassApiErrors = err.error;
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
    let control = this.newPassForm.get(name);
    if (!control) return null;
    if (!control.invalid || (!control.touched && !control.dirty)) return null;
    return control.errors;
  }

  getError(): string | null {
    const e = (field: string) => this.controlError(field);
    const g = this.newPassErrors;
    const s = this.newPassApiErrors;
    // Field-level
    if (e('currentPassword')?.['required']) return 'Current password is required.';
    if (e('newPassword')?.['required']) return 'New password is required.';
    if (e('newPassword')?.['minlength']) return 'New Password needs atleast 6 characters.';
    if (e('newPassword')?.['pattern']) return 'New Password required one or more special character(s).';
    if (e('confirmPassword')?.['required']) return 'Please confirm your new password.';
    // Group-level
    if (g?.['passwordmismatch']) return 'Passwords don\'t match.';
    if (g?.['duplicatepassword']) return 'New password must differ from current password.';
    // Server-level
    if (s && isValidationProblemDetails(s)) {
      return getFirstError(s) ?? null;
    }
    return s?.detail ?? null;
  }

  // End form errors/validation
  // Template events

  onNewPass(): void {
    this.newPassForm.markAllAsTouched();
    if (this.newPassForm.invalid) return;
    this.newPassApiErrors = null;

    if (!this.hasTwoFactor) {
      this.doChangePassword();
      return;
    }

    this.modalAction = 'change-password';
    this.modalError  = null;
    this.modalService.open('totp-validation-modal');
  }

  onTwoFactorToNone(): void {
    if (!this.hasTwoFactor) return;
    this.modalError = null;
    this.modalAction = 'disable-2fa';
    this.modalService.open('totp-validation-modal');
  }

  onTwoFactorToTotp(): void {
    if (this.hasTwoFactor && this.twoFactorMethod === TwoFactorMethod.Totp) return;
    this.router.navigate([Path.TWOFA_SETUP_TOTP]);
  }

  // End template events
  // Modal events

  onModalConfirm(totp: string): void {
    switch (this.modalAction) {
    case ('change-password'): {
      this.modalService.close();
      this.newPassForm.controls['totpCode'].setValue(totp);
      this.doChangePassword();
      return;
    }
    case ('disable-2fa'): {
      this.busyState.setBusy(true);
      this.userSecurityApi.disableTotp({ totpCode: totp }).subscribe({
        next: () => {
          this.busyState.setBusy(false);
          this.hasTwoFactor    = false;
          this.twoFactorMethod = TwoFactorMethod.None;
          this.modalService.close();
        },
        error: (err: HttpErrorResponse) => {
          this.busyState.setBusy(false);
          if (!isProblemDetails(err.error)) return;
          this.modalError = getFirstError(err.error) ?? 'Server error. Try again later.';
        }
      });
      return;
    }}
  }

  onModalCancel(): void {
    // Nothing
  }

  // End modal events
}

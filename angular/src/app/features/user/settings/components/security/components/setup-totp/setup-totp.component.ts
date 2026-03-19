// setup-totp.component.ts

import QRCode from 'qrcode';

import { Component, inject, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, ReactiveFormsModule, ValidationErrors, Validators } from '@angular/forms';
import { HttpErrorResponse } from '@angular/common/http';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { BusyState } from '@gofish/shared/core/busy-state';
import { LoadingState } from '@gofish/shared/core/loading-state';
import { UserSecurityService } from '@gofish/shared/services/user-security.service';
import { EnableTotpResDTO } from '@gofish/shared/dtos/user-security.dto';
import { ValidationProblemDetails } from '@gofish/shared/core/problem-details';
import { Path } from '@gofish/shared/constants';
import { AsyncButtonComponent } from "@gofish/shared/components/async-button/async-button.component";

@Component({
  selector: 'app-setup-totp',
  imports: [ReactiveFormsModule, FormsModule, AsyncButtonComponent],
  templateUrl: './setup-totp.component.html',
  styleUrl: './setup-totp.component.css',
})
export class SetupTotpComponent implements OnInit {
  private readonly userSecurityService = inject(UserSecurityService);
  private readonly formBuilder         = inject(FormBuilder);
  private readonly router              = inject(Router);

  readonly loadingState = new LoadingState();
  readonly busyState    = new BusyState();

  view: 'setup' | 'backup-codes' = 'setup';

  authenticatorKey: string = '';
  qrCodeImageUrl: string = '';
  backupCodes: string[] = [];
  savedCodesChecked: boolean = false;
  closeAttempted: boolean = false;

  verifyForm: FormGroup = this.formBuilder.group({
    totpCode: ['', [ Validators.required, Validators.pattern('^[0-9]*$') ]]
  });

  apiProblems: ValidationProblemDetails | null = null;
  formErrors: ValidationErrors | null = this.verifyForm.errors;

  ngOnInit(): void {
    this.loadingState.start();
    this.userSecurityService.getTotpSetup().subscribe({
      next: async (res) => {
        this.authenticatorKey = res.authenticatorKey;
        this.qrCodeImageUrl   = await QRCode.toDataURL(res.qrCodeUri, { margin: 2, width: 180 });
        this.loadingState.success();
      },
      error: () => {
        this.loadingState.fail('Failed to load authenticator setup. Please try again.');
      }
    });
  }

  getError(): string | null {
    const s = this.apiProblems;
    return s?.detail ?? null;
  }

  onVerify(): void {
    this.verifyForm.markAllAsTouched();
    this.apiProblems = null;
    if (this.verifyForm.invalid) return;
    this.busyState.setBusy(true);

    this.userSecurityService.enableTotp({ totpCode: this.verifyForm.value.totpCode }).subscribe({
      next: (res: EnableTotpResDTO) => {
        this.busyState.setBusy(false);
        setTimeout(() => {
          this.backupCodes = res.backupCodes;
          this.view = 'backup-codes';
          this.verifyForm.reset();
        }, 1000);
      },
      error: (err: HttpErrorResponse) => {
        this.busyState.setBusy(false);
        let problem = err.error as ValidationProblemDetails;
        problem.detail = problem.detail ?? problem.status === 401 ? 'Incorrect code.' : 'Server Error. Try again later.';
        this.apiProblems = problem;
      }
    });
  }

  onCancel(): void {
    this.router.navigate([Path.SECURITY_SETTINGS]);
  }

  onClose(): void {
    if (this.savedCodesChecked) {
      this.router.navigate([Path.SECURITY_SETTINGS]);
    } else {
      this.closeAttempted = false;
      setTimeout(() => this.closeAttempted = true);
    }
  }
}

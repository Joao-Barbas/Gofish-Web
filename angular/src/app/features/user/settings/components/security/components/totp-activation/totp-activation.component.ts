import QRCode from 'qrcode';

import { Component, EventEmitter, inject, OnInit, Output } from '@angular/core';
import { FormBuilder, FormGroup, ReactiveFormsModule, ValidationErrors, Validators } from '@angular/forms';
import { HttpErrorResponse } from '@angular/common/http';
import { FormsModule } from '@angular/forms';
import { BusyState } from '@gofish/shared/core/busy-state';
import { LoadingState } from '@gofish/shared/core/loading-state';
import { UserSecurityService } from '@gofish/shared/services/user-security.service';
import { EnableTotpResDTO } from '@gofish/shared/dtos/user-security.dto';
import { ProblemDetails, ValidationProblemDetails } from '@gofish/shared/core/problem-details';
import { AsyncButtonComponent } from "@gofish/shared/components/async-button/async-button.component";

@Component({
  selector: 'app-totp-activation',
  imports: [ReactiveFormsModule, FormsModule, AsyncButtonComponent],
  templateUrl: './totp-activation.component.html',
  styleUrl: './totp-activation.component.css',
})
export class TotpActivationComponent implements OnInit {
  private readonly userSecurityService = inject(UserSecurityService);
  private readonly formBuilder         = inject(FormBuilder);

  @Output() cancelled = new EventEmitter<void>();
  @Output() completed = new EventEmitter<void>();

  readonly loadingState = new LoadingState();
  readonly busyState    = new BusyState();

  view: 'setup' | 'backup-codes' = 'setup';

  authenticatorKey: string = '';
  qrCodeImageUrl: string = '';
  backupCodes: string[] = [];
  savedCodesChecked: boolean = false;

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
    this.cancelled.emit();
  }

  onClose(): void {
    this.completed.emit();
  }
}

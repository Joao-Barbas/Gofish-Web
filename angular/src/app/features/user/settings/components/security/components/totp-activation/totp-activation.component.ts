import { Component, EventEmitter, inject, OnInit, Output } from '@angular/core';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { HttpErrorResponse } from '@angular/common/http';
import { FormsModule } from '@angular/forms';
import QRCode from 'qrcode';
import { BusyState } from '@gofish/shared/core/busy-state';
import { LoadingState } from '@gofish/shared/core/loading-state';
import { UserSecurityService } from '@gofish/shared/services/user-security.service';
import { EnableTotpResDTO } from '@gofish/shared/dtos/user-security.dto';
import { ProblemDetails } from '@gofish/shared/core/problem-details';

@Component({
  selector: 'app-totp-activation',
  imports: [ ReactiveFormsModule, FormsModule ],
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
  qrCodeImageUrl:   string = '';
  backupCodes:      string[] = [];
  codeErrorText:    string | null = null;
  savedCodesChecked: boolean = false;

  form: FormGroup = this.formBuilder.group({
    totpCode: ['', [ Validators.required, Validators.pattern('^[0-9]*$') ]]
  });

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

  onVerify(): void {
    this.form.markAllAsTouched();
    if (this.form.invalid) return;

    this.codeErrorText = null;
    const endBusy = this.busyState.beginBusy();

    this.userSecurityService.enableTotp({ totpCode: this.form.value.totpCode }).subscribe({
      next: (res: EnableTotpResDTO) => {
        endBusy();
        this.backupCodes = res.backupCodes;
        this.view = 'backup-codes';
      },
      error: (err: HttpErrorResponse) => {
        endBusy();
        const problem = err.error as ProblemDetails;
        this.codeErrorText = problem?.detail ?? 'Incorrect code.';
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

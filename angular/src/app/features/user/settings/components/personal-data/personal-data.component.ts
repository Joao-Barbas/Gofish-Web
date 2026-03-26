// personal-data.component.ts

import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { UserAccountService } from '@gofish/shared/services/user-account.service';
import { ModalService } from '@gofish/shared/services/modal.service';
import { ConfirmDeletionModalComponent } from '@gofish/features/user/settings/components/personal-data/components/confirm-deletion-modal/confirm-deletion-modal.component';
import { BusyState } from '@gofish/shared/core/busy-state';
import { UserSecurityService } from '@gofish/shared/services/user-security.service';
import { TwoFactorMethod } from '@gofish/shared/models/user-security.models';
import { Path } from '@gofish/shared/constants';
import { AuthService } from '@gofish/shared/services/auth.service';
import { HttpErrorResponse } from '@angular/common/http';
import { DeleteAccountResDTO } from '@gofish/shared/dtos/user-account.dto';
import { getFirstError, ProblemDetails } from '@gofish/shared/core/problem-details';

@Component({
  selector: 'app-personal-data',
  imports: [ ConfirmDeletionModalComponent ],
  templateUrl: './personal-data.component.html',
  styleUrl: './personal-data.component.css',
})
export class PersonalDataComponent {
  readonly busyState = new BusyState();

  readonly Path = Path;
  readonly TwoFactorMethod = TwoFactorMethod;

  modalErrorText: string | null = null;

  // Lifecycle

  constructor(
    private readonly router: Router,
    private readonly userAccountService: UserAccountService,
    private readonly authService: AuthService,
    public  readonly userSecurityService: UserSecurityService,
    public  readonly modalService: ModalService,
  ){}

  // End lifecycle

  onDownloadClick() {
    this.busyState.setBusy(true);
    this.userAccountService.downloadPersonalData().subscribe({
      next: (blob: Blob) => {
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = 'PersonalData.json';
        a.click();
        URL.revokeObjectURL(url);
        this.busyState.setBusy(false);
      },
    });
  }

  onDeleteClick() {
    this.modalErrorText = null;
    this.modalService.open('confirm-deletion-modal');
  }

  // Modal events

  onModalPositive(data: { password?: string; code?: string; }): void {
    this.busyState.setBusy(true);
    this.userAccountService.deleteAccount({ password: data.password }).subscribe({
      next: (res: void) => {
        this.busyState.setBusy(false);
        this.authService.signOut();
        this.router.navigate([Path.HOME]);
      },
      error: (err: HttpErrorResponse) => {
        this.busyState.setBusy(false);
        let problem = err.error as ProblemDetails;
        this.modalErrorText = getFirstError(problem) ?? 'Something went wrong. Try again later'
        this.modalService.open('confirm-deletion-modal');
      }
    });
  }

  onModalNegative() {
    // Nothing to do here
  }
}

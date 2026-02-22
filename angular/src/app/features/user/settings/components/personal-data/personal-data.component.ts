// personal-data.component.ts

import { Component, computed, inject, Signal } from '@angular/core';
import { Router } from '@angular/router';
import { AuthService } from '@gofish/shared/services/auth.service';
import { ModalService } from '@gofish/shared/services/modal.service';
import { PopupService } from '@gofish/shared/services/popup.service';
import { UserAccountService } from '@gofish/shared/services/user-account.service';
import { ConfirmModalComponent } from "@gofish/shared/components/confirm-modal/confirm-modal.component";
import { HttpErrorResponse } from '@angular/common/http';
import { DeleteAccountResDTO } from '@gofish/shared/dtos/user-account.dto';
import { BusyState } from '@gofish/shared/services/busy.service';

@Component({
  selector: 'app-personal-data',
  imports: [ ConfirmModalComponent ],
  templateUrl: './personal-data.component.html',
  styleUrl: './personal-data.component.css',
})
export class PersonalDataComponent {
  private readonly modalService       = inject(ModalService);
  private readonly popupService       = inject(PopupService);
  private readonly authService        = inject(AuthService);
  private readonly userAccountService = inject(UserAccountService);
  private readonly router             = inject(Router);

  readonly busyState = new BusyState();

  isConfirmModalActive: Signal<boolean> = computed(() => this.modalService.activeModal() === ConfirmModalComponent.key);
  hasTwoFactor: boolean = false; // this.authService.has
  modalErrorText?: string;

  onDownload(): void {
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

  onDelete(): void {
    this.modalService.open(ConfirmModalComponent.key);
  }

  /* Modal events */

  onModalConfirm(data: { password?: string; twofa?: string; }): void {
    this.busyState.setBusy(true);
    this.userAccountService.deleteAccount({ password: data.password! }).subscribe({
      next: () => {
        this.authService.signOut();
        this.router.navigate(['/']);
      },
      error: (err: HttpErrorResponse) => {
        var res = err.error as DeleteAccountResDTO;
        if (res.errors?.[0].code === 'InvalidCredentials') {
          this.modalErrorText = "Invalid credentials";
        }
        this.modalService.open(ConfirmModalComponent.key);
      },
      complete: () => {
        this.busyState.setBusy(false);
      }
    });
  }

  onModalCancel() {
    // Nothing to do here
  }
}

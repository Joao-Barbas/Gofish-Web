import { CommonModule } from '@angular/common';
import { HttpErrorResponse } from '@angular/common/http';
import { Component, EventEmitter, inject, Input, OnInit, Output } from '@angular/core';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { BusyState } from '@gofish/shared/core/busy-state';
import { LoadingState } from '@gofish/shared/core/loading-state';
import { ModalController } from '@gofish/shared/core/modal-controller';
import { SecurityInfoResDTO } from '@gofish/shared/dtos/user-security.dto';
import { SimpleModal } from '@gofish/shared/models/modal.model';
import { AuthService } from '@gofish/shared/services/auth.service';
import { UserSecurityService } from '@gofish/shared/services/user-security.service';

@Component({
  selector: 'app-confirm-deletion-modal',
  imports: [ CommonModule, ReactiveFormsModule ],
  templateUrl: './confirm-deletion-modal.component.html',
  styleUrl: './confirm-deletion-modal.component.css',
})
export class ConfirmDeletionModalComponent implements SimpleModal, OnInit {
  @Input() errorText: string | null = null;

  @Output() negative = new EventEmitter<void>();
  @Output() positive = new EventEmitter<{ password?: string; code?: string; }>();

  readonly authService = inject(AuthService);

  readonly modalController = new ModalController('confirm-deletion-modal');
  readonly busyState = new BusyState();
  readonly loadingState = new LoadingState();

  requireTwoFactorApp: boolean = false;
  form: FormGroup = this.formBuilder.group({
    password: [ '', this.authService.isExternalUser() ? [] : [ Validators.required ] ],
    code: ['', [ Validators.pattern('^[0-9]*$') ]]
  });

  constructor(
    private readonly formBuilder: FormBuilder,
    private readonly userSecurityService: UserSecurityService
  ){}

  ngOnInit() {
    this.loadingState.start();
    this.userSecurityService.getSecurityInfo().subscribe({
      next: (res: SecurityInfoResDTO) => {
        console.log(res)
        this.requireTwoFactorApp = res.twoFactorEnabled;
        this.loadingState.success();
      },
      error: (err: HttpErrorResponse) => {
        console.log(err)
        this.loadingState.fail('Failed to load security info');
      }
    });
  }

  onPositive(): void {
    if (this.form.invalid) return;
    this.positive.emit(this.form.value);
    this.modalController.close();
  };

  onNegative(): void {
    this.negative.emit();
    this.modalController.close();
  };
}

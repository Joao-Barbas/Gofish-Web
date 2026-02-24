// confirm-modal.component.ts

import { CommonModule } from '@angular/common';
import { Component, EventEmitter, inject, Input, OnInit, Output } from '@angular/core';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { Router } from '@angular/router';
import { NumbersOnlyDirective } from '@gofish/shared/directives/numbers-only.directive';
import { ModalKey, SimpleModalComponent } from '@gofish/shared/models/modal.model';
import { AuthService } from '@gofish/shared/services/auth.service';
import { BusyState } from '@gofish/shared/services/busy.service';
import { ModalService } from '@gofish/shared/services/modal.service';
import { UserAccountService } from '@gofish/shared/services/user-account.service';

export interface ConfirmModal {
  headerText: string;
  normalText?: string;
  warningText?: string;
  footerText?: string;
  // If for example its not the first time opening the modal.
  // Maybe because the first time the password was wrong, etc...
  errorText?: string;
  requiresPassword: boolean;
  requiresTwoFactor: boolean;
}

@Component({
  selector: 'app-confirm-modal',
  imports: [ CommonModule, ReactiveFormsModule, NumbersOnlyDirective ],
  templateUrl: './confirm-modal.component.html',
  styleUrl: './confirm-modal.component.css',
})
export class ConfirmModalComponent extends SimpleModalComponent implements ConfirmModal, OnInit {
  static readonly key: ModalKey = 'confirm-action-modal';

  private readonly modal = inject(ModalService);
  private readonly userAccount = inject(UserAccountService);
  private readonly auth = inject(AuthService);
  private readonly router = inject(Router);
  private readonly formBuilder = inject(FormBuilder);

  readonly busyState = new BusyState();

  key: ModalKey = ConfirmModalComponent.key;
  form: FormGroup = this.formBuilder.group({
    password: [ '', [ Validators.required ]],
    twofa: ['', [ Validators.required, Validators.pattern('^[0-9]*$') ]]
  });

  @Input() headerText!: string;
  @Input() normalText?: string;
  @Input() warningText?: string;
  @Input() footerText?: string;
  @Input() errorText?: string;

  @Input() requiresPassword: boolean = true;
  @Input() requiresTwoFactor: boolean = false;

  @Output() cancel  = new EventEmitter<void>();
  @Output() confirm = new EventEmitter<{
    password?: string;
    twofa?: string;
  }>();

  ngOnInit() {
    if (!this.requiresPassword)  this.form.removeControl('password');
    if (!this.requiresTwoFactor) this.form.removeControl('twofa');
  }

  onConfirm(): void {
    if (this.form.invalid) return;
    this.confirm.emit(this.form.value);
    this.close();
  };

  onCancel(): void {
    this.cancel.emit();
    this.close();
  };
}

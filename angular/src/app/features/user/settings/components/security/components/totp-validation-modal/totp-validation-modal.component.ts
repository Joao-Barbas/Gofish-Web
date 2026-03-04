import { Component, EventEmitter, Input, Output } from '@angular/core';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { BusyState } from '@gofish/shared/core/busy-state';
import { ModalController } from '@gofish/shared/core/modal-controller';
import { SimpleModal } from '@gofish/shared/models/modal.model';

@Component({
  selector: 'app-totp-validation-modal',
  imports: [ ReactiveFormsModule ],
  templateUrl: './totp-validation-modal.component.html',
  styleUrl: './totp-validation-modal.component.css',
})
export class TotpValidationModalComponent implements SimpleModal {
  @Input() errorText: string | null = null;

  @Output() positive = new EventEmitter<string>();
  @Output() negative = new EventEmitter<void>();

  readonly modalController = new ModalController('totp-validation-modal');
  readonly busyState = new BusyState();

  form: FormGroup = this.formBuilder.group({
    totp: ['', [ Validators.required, Validators.pattern('^[0-9]*$') ]]
  });

  constructor(
    private readonly formBuilder: FormBuilder
  ){}

  onPositive(): void {
    if (this.form.invalid) return;
    this.positive.emit(this.form.value.totp);
    this.modalController.close();
  };

  onNegative(): void {
    this.negative.emit();
    this.modalController.close();
  };
}

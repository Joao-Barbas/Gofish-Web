// loading-error-modal.component.ts

import { CommonModule } from '@angular/common';
import { Component, inject, input, output } from '@angular/core';
import { Router } from '@angular/router';
import { ModalController } from '@gofish/shared/core/modal-controller';
import { ModalKey, SimpleModal } from '@gofish/shared/models/modal.model';

@Component({
  selector: 'gf-loading-error-modal',
  host: {
    'animate.enter': 'on-enter',
    'animate.leave': 'on-leave',
  },
  imports: [
    CommonModule
  ],
  templateUrl: './loading-error-modal.component.html',
  styleUrl: './loading-error-modal.component.css',
})
export class LoadingErrorModalComponent implements SimpleModal {
  static readonly Key: ModalKey = 'gf-loading-error-modal';

  readonly router = inject(Router);

  readonly popupController = new ModalController(LoadingErrorModalComponent.Key);

  error = input<Error>({ message: 'Failed to fetch', name: 'Error' });

  negative = output<void>();
  positive = output<void>();

  onPositive(): void { this.positive.emit(); }
  onNegative(): void { this.negative.emit(); }
}

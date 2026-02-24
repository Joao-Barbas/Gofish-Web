// modal.model.ts

import { computed, Directive, inject, Signal } from "@angular/core";
import { ModalService } from "@gofish/shared/services/modal.service";

export type ModalKey = // Update this when creating new concrete modals
  'example-modal' |
  'confirm-action-modal' |
  'foo-modal';

export interface SimpleModal {
  readonly key: ModalKey;
  readonly active : Signal<boolean>;
  open: () => void;
  close: () => void;
  onConfirm: () => void;
  onCancel: () => void;
}

@Directive()
export abstract class SimpleModalComponent implements SimpleModal {
  protected modalService = inject(ModalService);

  abstract key: ModalKey;
  readonly active = computed(() => this.modalService.activeModal() === this.key);

  open(): void { this.modalService.open(this.key, this); }
  close(): void { this.modalService.close(); }

  abstract onConfirm(): void;
  abstract onCancel(): void;
}

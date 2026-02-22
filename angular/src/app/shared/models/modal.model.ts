// modal.model.ts

import { computed, Directive, inject, Signal } from "@angular/core";
import { ModalService } from "@gofish/shared/services/modal.service";

export type ModalTitle = string;
export type ModalKey = 'create-pin' // Update this when creating new concrete modals
  | 'confirm-delete-account'
  | 'confirm-password';

export interface SimpleModal {
  readonly key: ModalKey;
  readonly active : Signal<boolean>;
  readonly title: ModalTitle;
  open: () => void;
  close: () => void;
  onConfirm: () => void;
  onCancel: () => void;
}

@Directive()
export abstract class SimpleModalComponent implements SimpleModal {
  protected modalService = inject(ModalService);

  public abstract key: ModalKey;
  public readonly active = computed(() => this.modalService.activeModal() === this.key);
  public abstract title: string;

  public open(): void { this.modalService.open(this.key, this); }
  public close(): void { this.modalService.close(); }

  abstract onConfirm(): void;
  abstract onCancel(): void;
}

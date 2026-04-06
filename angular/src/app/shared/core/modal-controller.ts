// modal-controller.ts

import { computed, inject } from "@angular/core";
import { ModalService } from "@gofish/shared/services/modal.service";

/** Unique identifier for a modal instance. */
export type ModalKey = string;

/**
 * Represents a simple modal interaction contract.
 * Useful for confirmation dialogs or basic decision flows.
 */
export interface SimpleModal {
  /** Called when the user confirms or accepts the action. */
  onPositive: () => void;
  /** Called when the user cancels or rejects the action. */
  onNegative: () => void;
}

/**
 * Composition class for controlling modal state.
 * Instantiate in any component that acts as a modal to get
 * open/close behavior tied to a specific key.
 *
 * Internally uses {@link ModalService} to manage global modal state.
 *
 * @example
 * ```ts
 * class DeleteUserModal implements SimpleModal {
 *   static readonly Key: ModalKey = 'gf-delete-user-modal'; // Usually the selector here
 *   readonly controller = new ModalController(DeleteUserModal.Key); // Public
 *
 *   onPositive() {
 *     // perform delete logic
 *     this.controller.close();
 *   }
 * }
 * ```
 */
export class ModalController {
  private readonly modalService = inject(ModalService);

  readonly active   = computed(() => this.modalService.activeModal() === this.key);
  readonly isActive = computed(() => this.modalService.activeModal() === this.key);

  constructor(readonly key: ModalKey) { }

  open(): void { this.modalService.open(this.key); }
  close(): void { this.modalService.close(); }
}

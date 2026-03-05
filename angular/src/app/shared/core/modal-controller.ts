import { computed, inject } from "@angular/core";
import { ModalService } from "@gofish/shared/services/modal.service";
import { ModalKey } from "@gofish/shared/models/modal.model";

export class ModalController {
  private readonly modalService = inject(ModalService);

  readonly active = computed(() => this.modalService.activeModal() === this.key);

  constructor(readonly key: ModalKey){}

  open(): void { this.modalService.open(this.key); }
  close(): void { this.modalService.close(); }
}

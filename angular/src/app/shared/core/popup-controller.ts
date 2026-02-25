import { computed, inject } from "@angular/core";
import { PopupService } from "@gofish/shared/services/popup.service";
import { PopupKey } from "@gofish/shared/models/popup.model";

export class PopupController {
  private readonly popupService = inject(PopupService);

  readonly active = computed(() => this.popupService.activePopup() === this.key);

  constructor(readonly key: PopupKey){}

  toggle(): void { this.popupService.toggle(this.key); }
  open(): void { this.popupService.open(this.key); }
  close(): void { this.popupService.close(); }
}

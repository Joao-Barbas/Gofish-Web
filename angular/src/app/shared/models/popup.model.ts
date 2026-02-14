import { Observable } from "rxjs";
import { Directive, inject } from "@angular/core";
import { PopupService } from "@gofish/shared/services/popup.service";

export type PopupId = string;

export interface PopupComponent {
  id: PopupId;
  isOpen$: Observable<boolean>;
  toggle(): void;
  open(): void;
  close(): void;
}

@Directive()
export abstract class BasePopupComponent implements PopupComponent {
  protected popupService = inject(PopupService);

  abstract id: PopupId;
  abstract isOpen$: Observable<boolean>;

  toggle(): void { this.popupService.toggle(this.id); }
  open(): void { this.popupService.open(this.id); }
  close(): void { this.popupService.close(); }

  protected onOpen?(): void;
  protected onClose?(): void;
}

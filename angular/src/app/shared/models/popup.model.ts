/* popup.model.ts */

import { Observable } from "rxjs";
import { Directive, inject } from "@angular/core";
import { PopupService } from "@gofish/shared/services/popup.service";

export type PopupKey = string;

export interface PopupComponent {
  readonly key: PopupKey;
  readonly isOpen$: Observable<boolean>;
  toggle(): void;
  open(): void;
  close(): void;
}

@Directive()
export abstract class BasePopupComponent implements PopupComponent {
  protected popupService = inject(PopupService);

  public readonly isOpen$: Observable<boolean> = this.popupService.isOpen$(this.key);
  public get key(): PopupKey { return (this.constructor as any).key; }

  toggle(): void { this.popupService.toggle(this.key); }
  open(): void { this.popupService.open(this.key); }
  close(): void { this.popupService.close(); }

  protected onOpen?(): void;
  protected onClose?(): void;
}

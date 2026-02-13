import { Observable } from "rxjs";

export type PopupId = string;

export interface PopupComponent {
  id: PopupId;
  isOpen$: Observable<boolean>;
  toggle(): void;
  open(): void;
  close(): void;
}

/*
Even better—create a base class to avoid repeating the same code in every popup:
@Directive()
export abstract class BasePopupComponent implements PopupComponent {
  protected popupService = inject(PopupService);
  abstract id: PopupId;
  abstract isOpen$: Observable<boolean>;

  open(): void {
    this.popupService.open(this.id);
  }

  close(): void {
    this.popupService.close();
  }

  toggle(): void {
    this.popupService.toggle(this.id);
  }
}
*/

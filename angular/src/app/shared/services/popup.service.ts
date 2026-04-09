import { Injectable, signal } from '@angular/core';
import { PopupKey } from '@gofish/shared/models/popup.model';
import { PopoverService } from '@gofish/shared/services/popover.service';
import { PopoverKey } from '@gofish/shared/core/popover-controller';

/**
 * @deprecated This service is deprecated. Use {@link PopoverService} instead.
 * @see {@link PopoverService}
 * @see {@link PopoverKey}
 */
@Injectable({
  providedIn: 'root'
})
export class PopupService {
  private _activePopup = signal<PopupKey | null>(null);
  readonly activePopup = this._activePopup.asReadonly();

  public toggle(key: PopupKey): void {
    this._activePopup.update((current) => current === key ? null : key);
  }

  public open(key: PopupKey): void {
    this._activePopup.set(key);
  }

  public close(): void {
    this._activePopup.set(null);
  }

  public closeKey(key: PopupKey): void {
    this._activePopup.update((current) =>
      current === key ? null : current
    );
  }

  public isOpen(key: PopupKey):boolean {
    return this._activePopup() === key;
  }
}

// TODO: Remove this file

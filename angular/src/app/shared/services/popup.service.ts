import { Injectable, signal } from '@angular/core';
import { PopupKey } from '@gofish/shared/models/popup.model';

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
}

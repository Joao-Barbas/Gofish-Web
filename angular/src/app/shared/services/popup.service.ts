import { Injectable } from '@angular/core';
import { BehaviorSubject, map, Observable } from 'rxjs';
import { PopupKey } from '@gofish/shared/models/popup.model';

@Injectable({
  providedIn: 'root'
})
export class PopupService {
  private activePopup$ = new BehaviorSubject<PopupKey | null>(null);
  public isAnyOpen$ = this.activePopup$.pipe(map(v => v !== null));

  isOpen$(id: PopupKey): Observable<boolean> {
    return this.activePopup$.pipe(map(active => active === id));
  }

  toggle(id: PopupKey): void {
    this.activePopup$.next(this.activePopup$.value === id ? null : id);
  }

  open(id: PopupKey): void {
    this.activePopup$.next(id);
  }

  close(): void {
    this.activePopup$.next(null);
  }
}

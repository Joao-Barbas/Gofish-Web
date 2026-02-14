import { Injectable } from '@angular/core';
import { BehaviorSubject, map, Observable } from 'rxjs';
import { PopupId } from '@gofish/shared/models/popup.model';

@Injectable({
  providedIn: 'root'
})
export class PopupService {
  private activePopup$ = new BehaviorSubject<PopupId | null>(null);
  public isAnyOpen$ = this.activePopup$.pipe(map(v => v !== null));

  isOpen$(id: PopupId): Observable<boolean> {
    return this.activePopup$.pipe(map(active => active === id));
  }

  toggle(id: PopupId): void {
    this.activePopup$.next(this.activePopup$.value === id ? null : id);
  }

  open(id: PopupId): void {
    this.activePopup$.next(id);
  }

  close(): void {
    this.activePopup$.next(null);
  }
}

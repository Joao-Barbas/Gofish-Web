import { Injectable } from '@angular/core';
import { BehaviorSubject, map, Observable } from 'rxjs';
import { PopupKey } from '@gofish/shared/models/popup.model';

@Injectable({
  providedIn: 'root'
})
export class PopupService {
  private activePopup$ = new BehaviorSubject<PopupKey | null>(null); // TODO: Use signals
  public isAnyOpen$ = this.activePopup$.pipe(map(v => v !== null));

  isOpen$(id: PopupKey): Observable<boolean> {
    return this.activePopup$.pipe(map(active => active === id));
  }

  toggle(id: PopupKey): void {
    console.log('toggle ' + id);
    this.activePopup$.next(this.activePopup$.value === id ? null : id);
  }

  open(id: PopupKey): void {
    console.log('open ' + id);
    this.activePopup$.next(id);
  }

  close(): void {
    console.log('close');
    this.activePopup$.next(null);
  }

  async closeId(id: PopupKey) {
    this.isOpen$(id).subscribe(next => {
      console.log(next)
      if (next === true) { this.close() }
    });

    // if (await this.isOpen$(id)) { this.close() }
  }
}

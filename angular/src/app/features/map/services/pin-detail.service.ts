import { Injectable } from '@angular/core';
import { PinPreviewResDTO } from '@gofish/shared/dtos/pin.dto';

import { BehaviorSubject } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class PinDetailService {
  private selectedPinSubject = new BehaviorSubject<Pick<PinPreviewResDTO, "data"> | null>(null);
  selectedPin$ = this.selectedPinSubject.asObservable();

  constructor() { }

  open(pin: Pick<PinPreviewResDTO, "data">): void {
    this.selectedPinSubject.next(pin);
  }

  close(): void {
    this.selectedPinSubject.next(null);
  }

  /*
  getCurrentPin(): PinPreviewResDTO | null {
    return this.selectedPinSubject.getValue();
  }
    */
}

import { Injectable } from '@angular/core';
import { PinPreviewResDTO } from '@gofish/shared/dtos/pin.dto';

import { BehaviorSubject } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class PinDetailService {
  private selectedPinSubject = new BehaviorSubject<PinPreviewResDTO | null>(null);
  selectedPin$ = this.selectedPinSubject.asObservable();

  constructor() { }

  open(pin: PinPreviewResDTO): void {
    this.selectedPinSubject.next(pin);
  }

  close(): void {
    this.selectedPinSubject.next(null);
  }

}

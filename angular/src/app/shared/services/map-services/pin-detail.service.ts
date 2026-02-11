import { Injectable } from '@angular/core';
import { NearbyPinDTO } from '@gofish/shared/dtos/get-marker.dto';
import { BehaviorSubject } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class PinDetailService {
  // Tem que ter 2 por questões de seguranca, porque se não qualquer componente poderia alterar o valor do pin selecionado
  private selectedPinSubject = new BehaviorSubject<NearbyPinDTO | null>(null);
  selectedPin$ = this.selectedPinSubject.asObservable();

  constructor() { }

  open(pin: NearbyPinDTO): void {
    this.selectedPinSubject.next(pin);
  }

  close(): void {
    this.selectedPinSubject.next(null);
  }

  getCurrentPin(): NearbyPinDTO | null {
    return this.selectedPinSubject.getValue();
  }
}

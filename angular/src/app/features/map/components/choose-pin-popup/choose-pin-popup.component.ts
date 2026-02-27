// choose-pin-popup.component.ts

import { CommonModule } from '@angular/common';
import { Component, ElementRef, EventEmitter, inject, Input, Output } from '@angular/core';
import { PopupController } from '@gofish/shared/core/popup-controller';
import { ClickOutsideDirective } from '@gofish/shared/directives/click-outside.directive';
import { Coords } from '@gofish/shared/models/coords.model';
import { PinType } from '@gofish/shared/models/pin.model';
import { SimplePopup } from '@gofish/shared/models/popup.model';
import { GeolocationService } from '@gofish/shared/services/geolocation.service';

@Component({
  selector: 'app-choose-pin-popup',
  imports: [CommonModule, ClickOutsideDirective],
  templateUrl: './choose-pin-popup.component.html',
  styleUrl: './choose-pin-popup.component.css',
})
export class ChoosePinPopupComponent implements SimplePopup {
  readonly popupController = new PopupController('choose-pin-popup');

  @Input() selectedCoords: Coords | null = null;

  @Output() coordsSelected = new EventEmitter<Coords>();
  @Output() requestPickOnMap = new EventEmitter<void>();
  @Output() typeSelected = new EventEmitter<PinType>();
  @Output() cancel = new EventEmitter<void>();

  public readonly geoService = inject(GeolocationService);
  public isUseGeolocation: boolean = false;
  selectedLocationMode = 'map';

  public errorMessage = '';

  onCreateByGeolocation() {
      this.selectedLocationMode = 'geo';
      if (!navigator.geolocation) {
      this.errorMessage = 'Geolocation not supported.';
      return;
    }

    navigator.geolocation.getCurrentPosition(
      (position) => {
        const coords: Coords = {
          latitude: position.coords.latitude,
          longitude: position.coords.longitude,
        };
        this.coordsSelected.emit(coords);
        //this.popupService.toggle(ChoosePinPopupComponent.key);
      },
      () => {
        this.errorMessage = 'Not possible to get location.';
      },
      { enableHighAccuracy: true, timeout: 10000 }
    );
  }

  public chooseOnMap() {
    this.selectedLocationMode = 'map';
    this.requestPickOnMap.emit();
    //this.close();
  }

  public cancelCreatingPin() {
    this.cancel.emit();
    this.popupController.close();
  }

  public createWarnPin() {
    if (!this.selectedCoords) {
      this.errorMessage = 'Coordinates not selected.';
      return;
    } this.typeSelected.emit(PinType.WARNING);
  }

  public createInfoPin() {
    if (!this.selectedCoords) {
      this.errorMessage = 'Coordinates not selected.';
      return;
    } this.typeSelected.emit(PinType.INFORMATION);
  }

  public createCatchPin() {
    if (!this.selectedCoords) {
      this.errorMessage = 'Coordinates not selected.';
      return;
    }
    this.typeSelected.emit(PinType.CATCH);
  }
}

// choose-pin-popup.component.ts

import { CommonModule } from '@angular/common';
import { Component, ElementRef, EventEmitter, inject, Input, Output, ViewChild } from '@angular/core';
import { NewPinType } from '@gofish/features/map/map.component';
import { ClickOutsideDirective } from '@gofish/shared/directives/click-outside.directive';
import { BasePopupComponent, PopupKey } from '@gofish/shared/models/popup.model';
import { GeolocationService } from '@gofish/shared/services/geolocation.service';

@Component({
  selector: 'app-choose-pin-popup',
  imports: [ CommonModule, ClickOutsideDirective ],
  templateUrl: './choose-pin-popup.component.html',
  styleUrl: './choose-pin-popup.component.css',
})
export class ChoosePinPopupComponent extends BasePopupComponent {
  public static readonly key: PopupKey = 'popup-choose-pin';

  @Output() CreateByPick = new EventEmitter<NewPinType>();
  @Output() CreateByGeolocation = new EventEmitter<NewPinType>();

  private readonly geolocationService = inject(GeolocationService);
  public isManualLocation: boolean = true; // Bidirectional

  ngOnInit() {
    if (this.isGeolocationDenied) {
      this.isManualLocation = true;
    }
    else if (this.geolocationService.coords()) {
      this.isManualLocation = false;
    }
  }

  public get getGeolocationState() { return this.geolocationService.permissionState(); }
  public get isGeolocationDenied() { return this.getGeolocationState === 'denied' || this.getGeolocationState === 'inaccurate'; }

  private createPin(type: NewPinType) {
    if (this.isManualLocation || this.isGeolocationDenied) {
      this.CreateByPick.emit(type);
    } else {
      if (this.geolocationService.coords()) {
        this.CreateByGeolocation.emit(type);
      } else if (this.geolocationService.permissionState() === 'prompt') {
        this.geolocationService.requestLocation();
        this.isManualLocation = !this.isGeolocationDenied;
      }
    }
  }

  public createCatchPin(): void { this.createPin('catch'); }
  public createInfoPin(): void { this.createPin('info'); }
  public createWarnPin(): void { this.createPin('warn'); }
}

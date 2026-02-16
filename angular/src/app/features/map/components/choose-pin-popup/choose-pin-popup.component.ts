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

  public readonly geoService = inject(GeolocationService);
  public isUseGeolocation: boolean = false;

  // ngOnInit() {
  //   if (this.geoService.isBad()) {
  //     this.isUseGeolocation = false;
  //   } // else if (this.geoService.coords()) {
  //     // this.isUseGeolocation = true;
  //   // }
  // }

  private createPin(type: NewPinType) {
    if (this.isUseGeolocation && this.geoService.isAvailable() && this.geoService.coords()) {
      this.CreateByGeolocation.emit(type);
    } else {
      this.CreateByPick.emit(type);
    }
  }

  public createCatchPin(): void { this.createPin('catch'); }
  public createInfoPin(): void { this.createPin('info'); }
  public createWarnPin(): void { this.createPin('warn'); }

  public async onUseGeolocationChange(checked: boolean): Promise<void> {
    this.isUseGeolocation = checked;
    var success = await this.geoService.requestGeolocation() && !this.geoService.isBad();
    if (!success) this.isUseGeolocation = false;
  }
}

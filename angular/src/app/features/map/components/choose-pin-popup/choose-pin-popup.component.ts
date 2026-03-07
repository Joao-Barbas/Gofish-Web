// choose-pin-popup.component.ts

import { CommonModule } from '@angular/common';
import { Component, ElementRef, EventEmitter, inject, Input, Output, signal } from '@angular/core';
import { ActivatedRoute, RouteConfigLoadEnd, Router, RouterLinkActive } from '@angular/router';
import { PopupController } from '@gofish/shared/core/popup-controller';
import { ClickOutsideDirective } from '@gofish/shared/directives/click-outside.directive';
import { Coords } from '@gofish/shared/models/coords.model';
import { PinKind } from '@gofish/shared/models/pin.model';
import { SimplePopup } from '@gofish/shared/models/popup.model';
import { GeolocationService } from '@gofish/shared/services/geolocation.service';

@Component({
  selector: 'app-choose-pin-popup',
  imports: [CommonModule],
  templateUrl: './choose-pin-popup.component.html',
  styleUrl: './choose-pin-popup.component.css',
})
export class ChoosePinPopupComponent implements SimplePopup {
  readonly popupController = new PopupController('choose-pin-popup');
  private readonly router = inject(Router);
  private readonly route = inject(ActivatedRoute);
  public readonly geoService = inject(GeolocationService);

  selectedLocationMode = '';
  selectedCoords: Coords | null = null;
  query = this.route.snapshot.queryParamMap;

  public errorMessage = '';
  @Output() requestPickOnMap = new EventEmitter<void>();

  ngOnInit() {
    const lat = this.query.get('lat');
    const lng = this.query.get('lng');
    const mode = this.query.get('mode');

    if (mode === 'pick') {
      this.selectedLocationMode = 'pick';
    }

    if (mode === 'geo') {
      this.selectedLocationMode = 'geo';
    }



  }

  setSelectedCoords(lng: number, lat: number): void {
    if (Number.isNaN(lng) || Number.isNaN(lat)) return;

    this.selectedCoords = {
      longitude: lng,
      latitude: lat
    }
  }

  onCreateByGeolocation() {
    this.selectedLocationMode = 'geo';
    this.errorMessage = '';
    if (!navigator.geolocation) {
      this.errorMessage = 'Geolocation not supported.';
      return;
    }

    navigator.geolocation.getCurrentPosition(
      (position) => {
        const lat = position.coords.latitude;
        const lng = position.coords.longitude;
        this.setSelectedCoords(lng, lat);
        const zoom = Number(this.query.get('z'));

        this.router.navigate(['/map'], {
          queryParams: {
            lat,
            lng,
            z: zoom,
            mode: 'geo'
          },
          queryParamsHandling: 'merge',
          replaceUrl: true
        });
      },
      () => {
        this.errorMessage = 'Not possible to get location.';
      },
      { enableHighAccuracy: true, timeout: 10000 }
    );
  }

  public chooseOnMap() {
    this.errorMessage = '';
    this.selectedLocationMode = 'pick';
    this.requestPickOnMap.emit();
    //this.close();
  }

  public cancelCreatingPin() {
    //this.cancel.emit();
    this.popupController.close();
  }

  public createWarnPin() {
    if (!this.selectedCoords) {
      this.errorMessage = 'Coordinates not selected.';
      return;
    }

    this.router.navigate(['create-warn-pin'], {
      relativeTo: this.route, // pra mostrar apartir do url atual
      queryParams: {

      }
    });
  }

  public createInfoPin() {
    if (!this.selectedCoords) {
      this.errorMessage = 'Coordinates not selected.';
      return;
    } //this.typeSelected.emit(PinKind.INFORMATION);
  }

  public createCatchPin() {
    if (!this.selectedCoords) {
      this.errorMessage = 'Coordinates not selected.';
      return;
    }
    //this.typeSelected.emit(PinKind.CATCH);
  }
}

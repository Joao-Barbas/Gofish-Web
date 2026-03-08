// choose-pin-popup.component.ts

import { CommonModule } from '@angular/common';
import { Component, ElementRef, EventEmitter, inject, Input, Output, signal } from '@angular/core';
import { ActivatedRoute, RouteConfigLoadEnd, Router, RouterLinkActive } from '@angular/router';
import { UrlService } from '@gofish/features/map/services/url.service';
import { PopupController } from '@gofish/shared/core/popup-controller';
import { ClickOutsideDirective } from '@gofish/shared/directives/click-outside.directive';
import { Coords } from '@gofish/shared/models/coords.model';
import { PinKind } from '@gofish/shared/models/pin.model';
import { SimplePopup } from '@gofish/shared/models/popup.model';
import { GeolocationService } from '@gofish/shared/services/geolocation.service';
import { LngLat } from 'mapbox-gl';
import { isArrayLike } from 'rxjs/internal/util/isArrayLike';

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
  public readonly urlService = inject(UrlService);

  selectedLocationMode = '';
  query = this.route.snapshot.queryParamMap;

  public errorMessage = '';
  @Input() coords: Coords | null = null;
  @Output() requestPickOnMap = new EventEmitter<void>();
  @Output() requestGeoOnMap = new EventEmitter<Coords>();

  ngOnInit() {
    const urlValues = this.urlService.getUrlValues(this.query);
    if (urlValues?.mode === 'pick') {
      this.selectedLocationMode = 'pick';
    }

    if (urlValues?.mode === 'geo') {
      this.selectedLocationMode = 'geo';
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

        this.requestGeoOnMap.emit({
          longitude: lng,
          latitude: lat
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
  }

  public cancelCreatingPin() {
    this.popupController.close();
  }

  public createWarnPin() {
    if (!this.coords) {
      this.errorMessage = 'Coordinates not selected.';
      return;
    }

    this.router.navigate(['create-warn-pin'], {
      relativeTo: this.route, // pra mostrar apartir do url atual
      queryParams: {
        lat: this.coords.latitude,
        lng: this.coords.longitude,
      }
    });
  }

  public createInfoPin() {
    if (!this.coords) {
      this.errorMessage = 'Coordinates not selected.';
      return;
    } //this.typeSelected.emit(PinKind.INFORMATION);
  }

  public createCatchPin() {
    if (!this.coords) {
      this.errorMessage = 'Coordinates not selected.';
      return;
    }
    //this.typeSelected.emit(PinKind.CATCH);
  }
}

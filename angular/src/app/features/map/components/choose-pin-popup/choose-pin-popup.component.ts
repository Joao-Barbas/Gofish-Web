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
import { LoadingSpinnerComponent } from "@gofish/shared/components/loading-spinner/loading-spinner.component";
import { PIN_CONFIG } from '@gofish/shared/constants';
import { K } from '@angular/cdk/keycodes';

/**
 * Popup component used to choose how a new pin location should be selected
 * and which pin type should be created.
 *
 * Responsibilities:
 * - Read current map selection mode from the URL
 * - Allow location selection by map click or geolocation
 * - Emit events to the parent component for coordinate selection
 * - Navigate to the appropriate pin creation flow
 */
@Component({
  selector: 'app-choose-pin-popup',
  imports: [CommonModule, LoadingSpinnerComponent],
  templateUrl: './choose-pin-popup.component.html',
  styleUrl: './choose-pin-popup.component.css',
})
export class ChoosePinPopupComponent implements SimplePopup {
  /** Controller used to manage the popup open and close state. */
  readonly popupController = new PopupController('choose-pin-popup');

  private readonly router = inject(Router);
  private readonly route = inject(ActivatedRoute);

  /** Pin configuration metadata exposed to the template. */
  protected readonly pinConfigs = PIN_CONFIG;

  /** Service used to access geolocation state. */
  public readonly geoService = inject(GeolocationService);

  /** Service used to parse and validate URL query values. */
  public readonly urlService = inject(UrlService);

  /** Indicates whether a geolocation request is currently in progress. */
  protected isGettingLocation = false;

  /** Stores the currently selected location selection mode. */
  selectedLocationMode = '';

  /** Snapshot of the current query parameter map. */
  query = this.route.snapshot.queryParamMap;

  /** Error message displayed when location or pin selection fails. */
  public errorMessage = '';

  /** Coordinates currently selected for pin creation. */
  @Input() coords: Coords | null = null;

  /** Event emitted when the user chooses to pick coordinates directly on the map. */
  @Output() requestPickOnMap = new EventEmitter<void>();

  /** Event emitted when the user chooses geolocation and coordinates are resolved. */
  @Output() requestGeoOnMap = new EventEmitter<Coords>();

  /**
   * Initializes the popup state based on the current URL mode.
   */
  ngOnInit() {
    const urlValues = this.urlService.getUrlValues(this.query);

    if (urlValues?.mode === 'pick') {
      this.selectedLocationMode = 'pick';
    }

    if (urlValues?.mode === 'geo') {
      this.selectedLocationMode = 'geo';
    }
  }

  /**
   * Requests the user's current geolocation and updates the map state.
   *
   * Behavior:
   * - Verifies browser geolocation support
   * - Requests the current position
   * - Updates query parameters
   * - Emits resolved coordinates to the parent component
   */
  onCreateByGeolocation() {
    this.selectedLocationMode = 'geo';
    this.errorMessage = '';

    if (!navigator.geolocation) {
      this.errorMessage = 'Geolocation not supported.';
      return;
    }

    this.isGettingLocation = true;

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

        this.isGettingLocation = false;
      },
      () => {
        this.errorMessage = 'Unable to get your current location.';
        this.isGettingLocation = false;
      },
      { enableHighAccuracy: true, timeout: 10000 }
    );
  }

  /**
   * Enables map-based coordinate selection.
   */
  public chooseOnMap() {
    this.errorMessage = '';
    this.selectedLocationMode = 'pick';
    this.requestPickOnMap.emit();
  }

  /**
   * Closes the popup without creating a pin.
   */
  public cancelCreatingPin() {
    this.popupController.close();
  }

  /**
   * Routes the creation request to the correct pin type flow.
   *
   * @param kind Pin type identifier
   */
  createPin(kind: string) {
    if (!this.coords) {
      this.errorMessage = 'Coordinates not selected.';
      return;
    }

    switch (kind) {
      case 'catch': {
        this.createCatchPin();
        break;
      }
      case 'information': {
        this.createInfoPin();
        break;
      }
      case 'warning': {
        this.createWarnPin();
        break;
      }
      default:
        console.log('Unknown type');
    }
  }

  /**
   * Navigates to the warning pin creation flow using the selected coordinates.
   */
  private createWarnPin() {
    if (!this.coords) {
      this.errorMessage = 'Coordinates not selected.';
      return;
    }

    console.log(this.coords);

    this.router.navigate(['create-warn-pin'], {
      relativeTo: this.route, // pra mostrar apartir do url atual
      queryParams: {
        sLat: this.coords.latitude,
        sLng: this.coords.longitude
      }
    });
  }

  /**
   * Navigates to the information pin creation flow using the selected coordinates.
   */
  private createInfoPin() {
    if (!this.coords) {
      this.errorMessage = 'Coordinates not selected.';
      return;
    }

    this.router.navigate(['create-info-pin'], {
      relativeTo: this.route,
      queryParams: {
        sLat: this.coords.latitude,
        sLng: this.coords.longitude
      }
    });
  }

  /**
   * Navigates to the catch pin creation flow using the selected coordinates.
   */
  private createCatchPin() {
    if (!this.coords) {
      this.errorMessage = 'Coordinates not selected.';
      return;
    }

    this.router.navigate(['create-catch-pin'], {
      relativeTo: this.route,
      queryParams: {
        sLat: this.coords.latitude,
        sLng: this.coords.longitude
      }
    });
  }
}

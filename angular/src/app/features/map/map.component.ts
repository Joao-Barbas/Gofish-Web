import mapboxgl from 'mapbox-gl';

import { AfterViewInit, Component, inject, OnDestroy, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router, RouterOutlet } from '@angular/router';
import { AuthService } from '@gofish/shared/services/auth.service';
import { UserService } from '@gofish/shared/services/user.service';
import { PinService } from '@gofish/features/map/services/pin.service';
import { PinfactoryService } from '@gofish/features/map/services/pinfactory.service';
import { CreatePinComponent } from '@gofish/features/map/components/create-pin/create-pin.component';
import { PreviewMarkerService } from '@gofish/features/map/services/preview-marker.service';
import { MarkerRegistryService } from '@gofish/features/map/services/marker-registry.service';
import { PinDetailService } from '@gofish/features/map/services/pin-detail.service';
import { PinDetailPanelComponent } from './components/pin-detail-panel/pin-detail-panel.component';
import { OverlayHeaderComponent } from '@gofish/features/header/overlay-header/overlay-header.component';
import { PortugalValidationService } from '@gofish/features/map/services/portugal-validation.service';
import { PinPreviewResDTO, ViewportPinsResDTO } from '@gofish/shared/dtos/pin.dto';
import { HttpErrorResponse } from '@angular/common/http';
import { Coords } from '@gofish/shared/models/coords.model';
import { PopupService } from '@gofish/shared/services/popup.service';
import { ChoosePinPopupComponent } from '@gofish/features/map/components/choose-pin-popup/choose-pin-popup.component';
import { GeolocationService } from '@gofish/shared/services/geolocation.service';

export type NewPinType = 'catch' | 'info' | 'warn'; // TODO: Refactor. Theres already an enum in .model.ts. Prefer this?

@Component({
  selector: 'app-map',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    CreatePinComponent,
    PinDetailPanelComponent,
    OverlayHeaderComponent,
    ChoosePinPopupComponent,
    RouterOutlet
],
  templateUrl: './map.component.html',
  styleUrl: './map.component.css',
})
export class MapComponent implements OnInit, AfterViewInit, OnDestroy {
  private readonly popupService = inject(PopupService);
  private readonly geoService = inject(GeolocationService);

  public isCreatePinOverlayOpen$  = this.popupService.isOpen$(ChoosePinPopupComponent.key);

  public selectedGeolocation: GeolocationCoordinates | null = null; // User manually selected
  public selectedPinType: NewPinType | null = null;

  public get getGeolocationState() { return this.geoService.state(); }
  public get isGeolocationDenied() { return this.getGeolocationState === 'denied' || this.getGeolocationState === 'inaccurate'; }

  // Popup overlays

  public toggleCreatePinOverlay(event: Event): void {
    this.popupService.toggle(ChoosePinPopupComponent.key);
    event.stopPropagation();
  }

  // End popup overlays
  // Create pin events

  onCreateByPick(pinType: NewPinType) {
    this.selectedPinType = pinType;
    this.popupService.toggle(ChoosePinPopupComponent.key);
    // this.enablePickMode();
    console.log('Create by pick on map');
  }

  onCreateByGeolocation(pinType: NewPinType) {
    this.selectedPinType = pinType;
    this.popupService.toggle(ChoosePinPopupComponent.key);
    // this.getUserLocationAndCreatePin();
    console.log('Create by auto geolocation');
  }

  // End create pin events

  public requestGeolocation() {
    this.geoService.requestGeolocation();
  }














  // UI / state
  firstName = '';
  selected: Coords | null = null;

  pickingOnMap = false;
  isCreating: boolean = false;

  // Mapbox
  private map!: mapboxgl.Map;


  constructor(
    private router: Router,
    private pinService: PinService,
    private authService: AuthService,
    private userService: UserService,
    private pinFactory: PinfactoryService,
    //private waterValidationService: WaterValidationService,
    private portugalValidationService: PortugalValidationService,
    private previewMarkerService: PreviewMarkerService,
    private markerRegistry: MarkerRegistryService,
    private pinDetailService: PinDetailService
  ) { }

  // =========================
  // Lifecycle
  // =========================
  ngOnInit(): void {
    this.userService.getUserProfile().subscribe({
      next: (res: any) => (this.firstName = res.firstName),
      error: (err: any) =>
        console.log('Error while retrieving user profile:\n', err),
    });
  }

  ngAfterViewInit(): void {
    mapboxgl.accessToken =
      'pk.eyJ1IjoiZ29uY2Fsb3BybzIiLCJhIjoiY21rcGdvN2tnMGVqeTNmcW5yNmNrM2RqdSJ9.R1MbbXiR-ZmnVF3eFp3HyQ';

    this.map = new mapboxgl.Map({
      container: 'map',
      //style: 'mapbox://styles/goncalopro2/cmkpidm7e003601s526nugcv1',
      style: 'mapbox://styles/goncalopro2/cmli4rxhm000q01qzfnbzg3fe',
      center: [-8.8882, 38.5243],
      zoom: 13,
      maxZoom: 13,
      minZoom: 4,
      pitch: 0,
      bearing: 0,
    });

    this.map.dragRotate.disable();
    this.map.touchZoomRotate.disableRotation();
    this.map.keyboard.disableRotation();

    this.map.on('load', () => {
      this.loadPinsInViewport();

      this.map.on('moveend', () => this.loadPinsInViewport());
      this.map.on('zoomend', () => this.loadPinsInViewport());
      this.map.on('click', (e) => this.onMapClick(e));

    });
  }


  onMapClick(e: mapboxgl.MapMouseEvent): void {
    if (!this.pickingOnMap) return;

    //const isWater = this.waterValidationService.isWaterAtPoint(this.map, e.point);
    /*
    if (!isWater) {
      console.log('Only create pins on water.');
      return;
    }
    */
    /*const isPortugal = this.portugalValidationService.isPortugalAtPoint(this.map, e.point);
    if (!isPortugal) {
      console.log('Os pins só podem ser criados em Portugal.');
      return;
    }*/

    const { lng, lat } = e.lngLat;
    const coords: Coords = { latitude: lat, longitude: lng };

    this.setSelectedCoords(coords);

    this.disablePickMode();
  }

  ngOnDestroy(): void {
    this.previewMarkerService.clear();
    this.markerRegistry.clear();

    if (this.map) this.map.remove();
  }

  // =========================
  // Create / Pick mode
  // =========================
  startCreate(): void {
    this.isCreating = true;
  }

  enablePickMode(): void {
    this.isCreating = true;
    this.pickingOnMap = true;
    this.map.getCanvas().style.cursor = 'crosshair';
    console.log('Pick mode enabled');
  }

  private disablePickMode(): void {
    this.pickingOnMap = false;
    this.map.getCanvas().style.cursor = 'default';
  }



  onCoordsSelected(coords: Coords): void {
    /*
    if (!this.waterValidationService.isWaterAtLngLat(this.map, coords.longitude, coords.latitude)) {
      alert('Selected coordinates are not on water. Please select a valid location.');
      return;
    }
    */
   /*
    if (!this.portugalValidationService.isPortugalAtLngLat(this.map, coords.longitude, coords.latitude)) {
      alert('Essas coordenadas não fazem parte de Portugal.');
      return;
    }
      */

    this.setSelectedCoords(coords);
    this.disablePickMode();
  }

  onPinCreated(): void {
    this.clearPreviewAndSelection();
    this.disablePickMode();
    this.loadPinsInViewport();

    this.isCreating = false;
    console.log('Pin created successfully.');
  }

  onPinCreateFailed(msg: string): void {
    console.error('Failed create pin:', msg);
    this.disablePickMode();
    this.clearPreviewAndSelection();
    this.isCreating = false;
  }

  // =========================
  // Selection / Preview marker
  // =========================
  private setSelectedCoords(coords: Coords): void {
    this.selected = coords;

    this.previewMarkerService.clear();
    this.previewMarkerService.set(this.map, coords.longitude, coords.latitude);

    this.map.setCenter([coords.longitude, coords.latitude]);
  }

  private clearPreviewAndSelection(): void {
    this.previewMarkerService.clear();
    this.selected = null;
  }

  // =========================
  // Pins in viewport
  // =========================
  private loadPinsInViewport(): void {
    if (!this.map) return;

    const bounds = this.map.getBounds();
    if (!bounds) return;

    const minLat = bounds.getSouth();
    const maxLat = bounds.getNorth();
    const minLng = bounds.getWest();
    const maxLng = bounds.getEast();

    this.getPinsInViewport(minLat, minLng, maxLat, maxLng);
  }

  private getPinsInViewport(
    minLat: number,
    minLng: number,
    maxLat: number,
    maxLng: number
  ): void {
    this.pinService.getInViewport(minLat, minLng, maxLat, maxLng).subscribe({
      next: (res: ViewportPinsResDTO) => {
        if (!res.success || !res.data) return;

        this.markerRegistry.loadPins(this.map, res.data.pins, (pin) => {
          const marker = this.pinFactory.createPin(pin);
          const el = marker.getElement();

          el.addEventListener('click', (e) => {
            e.stopPropagation();

            this.pinService.getPinPreview(pin.id).subscribe({
              next: (res: PinPreviewResDTO) => {
                if (!res.success) {
                  console.error('Failed to get pin preview:', res.errors);
                  return;
                }

                this.pinDetailService.open(res);
                this.map.flyTo({
                  center: [pin.longitude, pin.latitude],
                  zoom: 15,
                  speed: 1.2,
                });
              }
            });
          });

          return marker;
        });
      },
      error: (err: HttpErrorResponse) => {
        console.error('Erro GetInViewport:', err);
      }
    });
  }

  // =========================
  // Auth
  // =========================
  onSignOut(): void {
    this.authService.deleteToken();
    this.router.navigateByUrl('');
  }
}

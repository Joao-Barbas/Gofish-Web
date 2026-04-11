// map.component.ts
import mapboxgl from 'mapbox-gl';
import { AfterViewInit, Component, inject, OnDestroy, OnInit, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ActivatedRoute, ParamMap, Router } from '@angular/router';
import { Subscription } from 'rxjs';

import { PinService } from '@gofish/shared/services/pin.service';
import { PreviewMarkerService } from '@gofish/features/map/services/preview-marker.service';
import { MarkerRegistryService } from '@gofish/features/map/services/marker-registry.service';
import { PinDetailPanelComponent } from './components/pin-detail-panel/pin-detail-panel.component';
import { PinDto } from '@gofish/shared/dtos/pin.dto';
import { HttpErrorResponse } from '@angular/common/http';
import { Coords } from '@gofish/shared/models/coords.model';
import { PopupService } from '@gofish/shared/services/popup.service';
import { ChoosePinPopupComponent } from '@gofish/features/map/components/choose-pin-popup/choose-pin-popup.component';
import { GeolocationService } from '@gofish/shared/services/geolocation.service';
import { UrlQuery, UrlService } from '@gofish/features/map/services/url.service';
import { PopupKey } from '@gofish/shared/models/popup.model';
import { NgxSonnerToaster } from 'ngx-sonner';
import { RouterOutlet } from '@angular/router';

import { MapLayersService } from '@gofish/features/map/services/map-layers.service';
import { MapInteractionsService } from '@gofish/features/map/services/map-interactions.service';
import { ClusterDetailsComponent } from '@gofish/features/map/components/cluster-details/cluster-details.component';


const MAPBOX_TOKEN = 'pk.eyJ1IjoiZ29uY2Fsb3BybzIiLCJhIjoiY21uY2NtZjdrMHpsYjJwcXlsNWdpM2pzaSJ9.M0UieuxBdBlA67zriIvU4w';

@Component({
  selector: 'app-map',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    PinDetailPanelComponent,
    ChoosePinPopupComponent,
    RouterOutlet,
    NgxSonnerToaster,
    ClusterDetailsComponent,
  ],
  templateUrl: './map.component.html',
  styleUrl: './map.component.css',
})

/**
 * Main interactive map component using Mapbox.
 *
 * Responsibilities:
 * - Initialize and configure the map
 * - Sync map state with URL query parameters
 * - Handle user interactions (click, zoom, pick mode)
 * - Load and render pins dynamically based on viewport
 */
export class MapComponent implements OnInit, AfterViewInit, OnDestroy {
  readonly popupService = inject(PopupService);
  private readonly geoService = inject(GeolocationService);
  private readonly pinService = inject(PinService);
  private readonly previewMarkerService = inject(PreviewMarkerService);
  private readonly markerRegistry = inject(MarkerRegistryService);
  private readonly route = inject(ActivatedRoute);
  private readonly router = inject(Router);
  private readonly urlService = inject(UrlService);
  private readonly mapLayers = inject(MapLayersService);
  private readonly mapInteractions = inject(MapInteractionsService);

  pickingOnMap = false;
  selectedCoords = signal<Coords | null>(null);
  protected selectedPin = signal<PinDto | null>(null);
  protected selectedPins = signal<PinDto[]>([]);

  private map!: mapboxgl.Map;
  allPins = signal<PinDto[]>([]);
  private querySubscription?: Subscription;
  private queryValues: UrlQuery | null = null;
  move: boolean = false;
  public get getGeolocationState() { return this.geoService.state(); }
  public get isGeolocationDenied() { return this.geoService.isBad(); }

  /**
   * Subscribes to query parameters and validates URL state.
   * Applies URL-driven state when map is ready.
   */
  ngOnInit(): void {
    this.querySubscription = this.route.queryParamMap.subscribe(paramMap => {
      if (!this.urlService.isUrlValuesValid(paramMap)) {
        alert('Alerta engracadinho!');
        return;
      }
      this.queryValues = this.urlService.getUrlValues(paramMap);

      if (this.map && this.queryValues) {
        this.applyUrlState();
      }
    });
  }

  /**
 * Initializes the map after the view is rendered.
 */
  ngAfterViewInit(): void {
    this.initMap();
  }

  /**
 * Cleans up subscriptions, markers, and map instance.
 */
  ngOnDestroy(): void {
    this.querySubscription?.unsubscribe();
    this.previewMarkerService.clear();
    this.markerRegistry.clear();
    this.map?.remove();
  }

  /**
  * Initializes Mapbox map instance with initial view and configuration.
  *
  * Side effects:
  * - Creates map instance
  * - Registers map layers and interactions
  * - Applies URL state
  */
  private initMap(): void {
    const view = this.getInitialView();
    console.log('Initial view:', view);
    mapboxgl.accessToken = MAPBOX_TOKEN;

    this.map = new mapboxgl.Map({
      container: 'map',
      style: 'mapbox://styles/goncalopro2/cmm4ybep5002p01s2eexw84v1',
      center: [view.center[0], view.center[1]], //[-8.8909328, 38.5260437]
      zoom: view.zoom,
      maxZoom: 16,
      minZoom: 4.5,
      pitch: 0,
      bearing: 0,
    });

    this.map.dragRotate.disable();
    this.map.touchZoomRotate.disableRotation();
    this.map.keyboard.disableRotation();
    this.map.getCanvas().style.cursor = 'default';

    this.map.on('load', () => {
      this.mapLayers.loadPinIcons(this.map);
      this.mapLayers.updateLayers(this.map, this.allPins);
      this.mapInteractions.setup(this.map, this.allPins, this.selectedPin, this.selectedPins, () => this.pickingOnMap);
      this.applyUrlState();
      this.registerMapEvents();
    });
  }

  /**
 * Registers map event listeners (move, zoom, click).
 *
 * Side effects:
 * - Updates URL on movement
 * - Triggers pin loading based on zoom level
 */
  private registerMapEvents(): void {
    this.map.on('moveend', () => {
      this.updateUrl();
      if (this.map.getZoom() >= 10) this.loadPinsInViewport();
    });

    this.map.on('zoomend', () => {
      this.updateUrl();
      if (this.map.getZoom() >= 10) this.loadPinsInViewport();
    });

    this.map.on('click', (e) => this.onMapClick(e));
  }

  /**
 * Determines initial map center and zoom based on URL parameters.
 *
 * @returns Object containing center coordinates and zoom level
 */
  private getInitialView() {
    const q = this.route.snapshot.queryParamMap;
    const vLat = this.urlService.getNumber(q, 'vLat');
    const vLng = this.urlService.getNumber(q, 'vLng');
    const z = this.urlService.getNumber(q, 'z');


    return {
      center: vLat !== null && vLng !== null ? [vLng, vLat] as [number, number] : [-8.8909328, 38.5260437],
      zoom: z ?? 5
    };
  }

  /**
 * Applies application state based on current URL query parameters.
 * Handles selected coordinates and interaction modes.
 */
  private applyUrlState(): void {
    if (!this.queryValues) return;

    const selectedLng = this.route.snapshot.queryParamMap.get('sLng');
    const selectedLat = this.route.snapshot.queryParamMap.get('sLat');
    const hasSelectedCoords = selectedLng !== null && selectedLat !== null;

    if (hasSelectedCoords) {
      const lng = Number(selectedLng);
      const lat = Number(selectedLat);
      if (this.urlService.isLngLatValid(lng, lat)) {
        this.selectedCoords.set({ longitude: lng, latitude: lat });
      }
      return;
    }

    this.applyModeFromUrl();
  }

  /**
 * Applies interaction mode based on URL (pick, picked, geo).
 *
 * Side effects:
 * - Opens popups
 * - Updates preview marker
 * - Enables/disables pick mode
 */
  private applyModeFromUrl(): void {
    switch (this.queryValues?.mode) {
      case 'pick':
        this.enablePickMode();
        this.popupService.open('choose-pin-popup');
        this.previewMarkerService.clear();
        this.selectedCoords.set(null);
        break;
      case 'picked':
        this.disablePickMode();
        this.popupService.open('choose-pin-popup');
        this.previewMarkerService.clear();
        this.previewMarkerService.set(this.map, this.selectedCoords()!.longitude, this.selectedCoords()!.latitude);
        break;
      case 'geo':
        this.popupService.open('choose-pin-popup');
        this.previewMarkerService.clear();
        this.previewMarkerService.set(this.map, this.selectedCoords()!.longitude, this.selectedCoords()!.latitude);
        break;
      default:
        this.disablePickMode();
        this.previewMarkerService.clear();
        this.selectedCoords.set(null);
        break;
    }
  }

  /**
 * Updates URL query parameters with current map position and zoom.
 *
 * Side effects:
 * - Triggers router navigation (replaceUrl)
 */
  private updateUrl(): void {
    const center = this.map.getCenter();
    this.router.navigate([], {
      queryParams: { vLat: center.lat, vLng: center.lng, sLat: null, sLng: null, z: this.map.getZoom() },
      queryParamsHandling: 'merge',
      replaceUrl: true
    });
  }


  public requestGeolocation(): void {
    this.geoService.requestGeolocation();
  }

  /**
 * Handles map click events when pick mode is enabled.
 *
 * @param e Mapbox mouse event
 *
 * Side effects:
 * - Updates selected coordinates
 * - Updates URL
 * - Disables pick mode
 */
  onMapClick(e: mapboxgl.MapMouseEvent): void {
    if (!this.pickingOnMap) return;

    const { lng, lat } = e.lngLat;
    this.setSelectedCoords({ latitude: lat, longitude: lng });

    this.router.navigate([], {
      relativeTo: this.route,
      queryParams: { sLat: lat, sLng: lng, z: this.map.getZoom(), mode: 'picked' },
      queryParamsHandling: 'merge',
      replaceUrl: true
    });
    this.disablePickMode();
  }

  /**
 * Handles geolocation result and updates selected coordinates.
 *
 * @param coords User geolocation coordinates
 */
  onGeo(coords: Coords): void {
    if (!coords) return;
    this.setSelectedCoords(coords);

    this.router.navigate([], {
      relativeTo: this.route,
      queryParams: { sLat: coords.latitude, sLng: coords.longitude, z: this.map.getZoom(), mode: 'picked' },
      queryParamsHandling: 'merge',
      replaceUrl: true
    });
  }

  zoomIn(): void { this.map.zoomIn({ duration: 300 }); }
  zoomOut(): void { this.map.zoomOut({ duration: 300 }); }

  /**
 * Moves map to specified coordinates with animation.
 *
 * @param coords Target coordinates
 */
  goToCoords(coords: Coords) {
    this.map.flyTo({ center: [coords.longitude, coords.latitude], zoom: 16 });
    console.log("aqui");
  }

  /**
 * Enables map picking mode and updates URL state.
 */
  onRequestPickOnMap(): void {
    this.enablePickMode();
    this.router.navigate([], {
      relativeTo: this.route,
      queryParams: { mode: 'pick' },
      queryParamsHandling: 'merge',
      replaceUrl: true
    });
  }

  /**
 * Activates pick mode (crosshair cursor).
 */
  enablePickMode(): void {
    this.pickingOnMap = true;
    this.map.getCanvas().style.cursor = 'crosshair';
  }

  /**
 * Disables pick mode and resets cursor.
 */
  private disablePickMode(): void {
    this.pickingOnMap = false;
    this.map.getCanvas().style.cursor = 'default';
  }

  /**
   * Toggles a popup and optionally clears URL state when closing.
   *
   * @param key Popup identifier
   * @param event Optional DOM event
   */
  private togglePopup(key: PopupKey, event?: Event): void {
    const wasOpen = this.popupService.isOpen(key);
    this.popupService.toggle(key);

    if (wasOpen) {
      this.router.navigate([], {
        relativeTo: this.route,
        queryParams: { sLat: null, sLng: null, mode: null },
        queryParamsHandling: 'merge',
        replaceUrl: true
      });
    }
    event?.stopPropagation();
  }

  public toggleCreatePinOverlay(event: Event): void { this.togglePopup('choose-pin-popup', event); }
  public togglePinPreview(event: Event): void { this.togglePopup('pin-preview', event); }
  /**
   * Handles popup cancellation and resets selection state.
   *
   * @param key Popup identifier
   */
  onPopupCancel(key: PopupKey): void {
    this.clearPreviewAndSelection();
    this.popupService.toggle(key);
    this.router.navigate([], {
      relativeTo: this.route,
      queryParams: { mode: null, sLat: null, sLng: null },
      queryParamsHandling: 'merge',
      replaceUrl: true
    });
  }

  onPopupCancelPinOverlay(): void { this.onPopupCancel('choose-pin-popup'); }
  onPopupCancelPinPreview(): void { this.onPopupCancel('pin-preview'); }

  /**
   * Sets selected coordinates and displays preview marker on map.
   *
   * @param coords Selected coordinates
   *
   * Side effects:
   * - Updates marker
   * - Moves map center
   */
  private setSelectedCoords(coords: Coords): void {
    if (!coords) return;
    this.selectedCoords.set(coords);
    this.previewMarkerService.clear();
    this.previewMarkerService.set(this.map, coords.longitude, coords.latitude);
    this.map.jumpTo({ center: [coords.longitude, coords.latitude], zoom: 14 });
  }

  /**
* Clears preview marker and selected coordinates.
*/
  private clearPreviewAndSelection(): void {
    this.previewMarkerService.clear();
    this.selectedCoords.set(null);
  }

  /**
   * Loads pins within current map viewport.
   *
   * Side effects:
   * - Updates pins state
   * - Refreshes map layers
   */
  private loadPinsInViewport(): void {
    if (!this.map) return;
    const bounds = this.map.getBounds();
    if (!bounds) return;

    this.pinService.getInViewport(bounds.getSouth(), bounds.getWest(), bounds.getNorth(), bounds.getEast())
      .subscribe({
        next: (res) => {
          this.allPins.set(res.pins);
          this.mapLayers.updateLayers(this.map, this.allPins);
        },
        error: (err: HttpErrorResponse) => console.error('Error loading pins in viewport:', err)
      });
  }
}

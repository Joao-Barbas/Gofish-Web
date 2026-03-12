// map.component.ts
import mapboxgl from 'mapbox-gl';
import { AfterViewInit, Component, inject, OnDestroy, OnInit, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ActivatedRoute, ParamMap, Router } from '@angular/router';
import { Subscription } from 'rxjs';

import { PinService } from '@gofish/features/map/services/pin.service';
import { PreviewMarkerService } from '@gofish/features/map/services/preview-marker.service';
import { MarkerRegistryService } from '@gofish/features/map/services/marker-registry.service';
import { PinDetailPanelComponent } from './components/pin-detail-panel/pin-detail-panel.component';
import { OverlayHeaderComponent } from '@gofish/features/header/overlay-header/overlay-header.component';
import { ViewportPinsResDTO, ViewportPinDTO, PinDataResDTO } from '@gofish/shared/dtos/pin.dto';
import { HttpErrorResponse } from '@angular/common/http';
import { Coords } from '@gofish/shared/models/coords.model';
import { PopupService } from '@gofish/shared/services/popup.service';
import { ChoosePinPopupComponent } from '@gofish/features/map/components/choose-pin-popup/choose-pin-popup.component';
import { GeolocationService } from '@gofish/shared/services/geolocation.service';
import { PinKind } from '@gofish/shared/models/pin.model';
import { UrlQuery, UrlService } from '@gofish/features/map/services/url.service';
import { PopupKey } from '@gofish/shared/models/popup.model';
import { NgxSonnerToaster } from 'ngx-sonner';
import { RouterOutlet } from '@angular/router';

import { MapLayersService } from '@gofish/features/map/services/map-layers.service';
import { MapInteractionsService } from '@gofish/features/map/services/map-interactions.service';

const MAPBOX_TOKEN = 'pk.eyJ1IjoiZ29uY2Fsb3BybzIiLCJhIjoiY21rcGdvN2tnMGVqeTNmcW5yNmNrM2RqdSJ9.R1MbbXiR-ZmnVF3eFp3HyQ';

@Component({
  selector: 'app-map',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    PinDetailPanelComponent,
    OverlayHeaderComponent,
    ChoosePinPopupComponent,
    RouterOutlet,
    NgxSonnerToaster
  ],
  templateUrl: './map.component.html',
  styleUrl: './map.component.css',
})
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
  protected selectedPin = signal<PinDataResDTO | null>(null);

  private map!: mapboxgl.Map;
  private allPins: ViewportPinDTO[] = [];
  private querySubscription?: Subscription;
  private queryValues: UrlQuery | null = null;
  private queryMap: ParamMap | null = null;


  public get getGeolocationState() { return this.geoService.state(); }
  public get isGeolocationDenied() { return this.geoService.isBad(); }

  // =========================
  // Lifecycle
  // =========================
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

  ngAfterViewInit(): void {
    this.initMap();
  }

  ngOnDestroy(): void {
    this.querySubscription?.unsubscribe();
    this.previewMarkerService.clear();
    this.markerRegistry.clear();
    this.map?.remove();
  }


  private initMap(): void {
    const view = this.getInitialView();
    mapboxgl.accessToken = MAPBOX_TOKEN;

    this.map = new mapboxgl.Map({
      container: 'map',
      style: 'mapbox://styles/goncalopro2/cmm4ybep5002p01s2eexw84v1',
      center: [-8.8909328, 38.5260437],
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
      this.mapLayers.updateLayers(this.map, this.allPins);
      this.mapInteractions.setup(this.map, this.allPins, this.selectedPin, () => this.pickingOnMap);
      this.applyUrlState();
      this.registerMapEvents();
    });
  }

  private registerMapEvents(): void {
    this.map.on('moveend', () => {
      this.updateUrl();
      if (this.map.getZoom() >= 14) this.loadPinsInViewport();
    });

    this.map.on('zoomend', () => {
      this.updateUrl();
      if (this.map.getZoom() >= 10) this.loadPinsInViewport();
    });

    this.map.on('click', (e) => this.onMapClick(e));
  }

  private getInitialView() {
    const q = this.route.snapshot.queryParamMap;
    const vLat = Number(q.get('vLat'));
    const vLng = Number(q.get('vLng'));
    const z = Number(q.get('z'));
    const hasValid = !Number.isNaN(vLng) && !Number.isNaN(vLat) && !Number.isNaN(z);

    return {
      center: hasValid ? [vLng, vLat] as [number, number] : [38.5260437, -8.8909328],
      zoom: hasValid ? z : 5
    };
  }

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

  // =========================
  // Pick mode
  // =========================
  onRequestPickOnMap(): void {
    this.enablePickMode();
    this.router.navigate([], {
      relativeTo: this.route,
      queryParams: { mode: 'pick' },
      queryParamsHandling: 'merge',
      replaceUrl: true
    });
  }

  enablePickMode(): void {
    this.pickingOnMap = true;
    this.map.getCanvas().style.cursor = 'crosshair';
  }

  private disablePickMode(): void {
    this.pickingOnMap = false;
    this.map.getCanvas().style.cursor = 'default';
  }

  // =========================
  // Popups
  // =========================
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

  // =========================
  //  Preview marker
  // =========================
  private setSelectedCoords(coords: Coords): void {
    if (!coords) return;
    this.selectedCoords.set(coords);
    this.previewMarkerService.clear();
    this.previewMarkerService.set(this.map, coords.longitude, coords.latitude);
    this.map.jumpTo({ center: [coords.longitude, coords.latitude], zoom: 14 });
  }

  private clearPreviewAndSelection(): void {
    this.previewMarkerService.clear();
    this.selectedCoords.set(null);
  }

  // =========================
  // Pins viewport
  // =========================
  private loadPinsInViewport(): void {
    if (!this.map) return;
    const bounds = this.map.getBounds();
    if (!bounds) return;

    this.pinService.getInViewport(bounds.getSouth(), bounds.getWest(), bounds.getNorth(), bounds.getEast())
      .subscribe({
        next: (res: ViewportPinsResDTO) => {
          this.allPins = res?.pins || [];
          this.mapLayers.updateLayers(this.map, this.allPins);
        },
        error: (err: HttpErrorResponse) => console.error('Error loading pins in viewport:', err)
      });
  }
}

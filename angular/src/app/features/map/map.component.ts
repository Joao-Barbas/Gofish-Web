import mapboxgl from 'mapbox-gl';
import { AfterViewInit, Component, inject, OnDestroy, OnInit, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ActivatedRoute, Router, RouterOutlet } from '@angular/router';
import { PinService } from '@gofish/features/map/services/pin.service';
import { PreviewMarkerService } from '@gofish/features/map/services/preview-marker.service';
import { MarkerRegistryService } from '@gofish/features/map/services/marker-registry.service';
import { PinDetailPanelComponent } from './components/pin-detail-panel/pin-detail-panel.component';
import { OverlayHeaderComponent } from '@gofish/features/header/overlay-header/overlay-header.component';
import { GetPinsReqDTO, GetPinsResDTO, PinDataReqDTO, PinDataResDTO, ViewportPinDTO, ViewportPinsResDTO } from '@gofish/shared/dtos/pin.dto';
import { HttpErrorResponse } from '@angular/common/http';
import { Coords } from '@gofish/shared/models/coords.model';
import { PopupService } from '@gofish/shared/services/popup.service';
import { ChoosePinPopupComponent } from '@gofish/features/map/components/choose-pin-popup/choose-pin-popup.component';
import { GeolocationService } from '@gofish/shared/services/geolocation.service';
import { PinKind } from '@gofish/shared/models/pin.model';
import { CatchPinModalComponent } from '@gofish/features/map/components/modals/catch-pin-modal/catch-pin-modal.component';
import { PinHoverPreviewService } from '@gofish/features/map/services/pin-hover-preview.service';
import { InfoPinModalComponent } from '@gofish/features/map/components/modals/info-pin-modal/info-pin-modal.component';
import { WarnPinModalComponent } from '@gofish/features/map/components/modals/warn-pin-modal/warn-pin-modal.component';
import { ClickOutsideDirective } from "@gofish/shared/directives/click-outside.directive";
import { ModalKey } from '@gofish/shared/models/modal.model';
import { PopupKey } from '@gofish/shared/models/popup.model';
import { NgxSonnerToaster, toast } from 'ngx-sonner';



export type NewPinKind = 'catch' | 'info' | 'warn'; // TODO: Refactor. Theres already an enum in .model.ts. Prefer this?

const PIN_KINDS: PinKind[] = [PinKind.CATCH, PinKind.INFORMATION, PinKind.WARNING];

/* const PIN_CONFIG: Record<PinKind, any> = {
  [PinKind.CATCH]: { color: '#EF4444', position: [-18, 14] }, // Catch
  [PinKind.INFORMATION]: { color: '#F59E0B', position: [0, -20] }, // Warn
  [PinKind.WARNING]: { color: '#3B82F6', position: [18, 14] }, // Info
  [PinKind.DEFAULT]: {}
}; */

const PIN_CONFIG = [
  { kind: PinKind.CATCH, color: '#f30000' },
  { kind: PinKind.INFORMATION, color: '#3b82f6' },
  { kind: PinKind.WARNING, color: '#ff6a00' }
];


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
    CatchPinModalComponent,
    InfoPinModalComponent,
    WarnPinModalComponent,
    NgxSonnerToaster
  ],
  templateUrl: './map.component.html',
  styleUrl: './map.component.css',
})
export class MapComponent implements AfterViewInit, OnDestroy {
  readonly popupService = inject(PopupService);

  private readonly geoService = inject(GeolocationService);
  private readonly pinService = inject(PinService);
  private readonly previewMarkerService = inject(PreviewMarkerService);
  private readonly markerRegistry = inject(MarkerRegistryService);
  private readonly pinHoverPreview = inject(PinHoverPreviewService);
  private readonly route = inject(ActivatedRoute);
  private readonly router = inject(Router);
  pickingOnMap = false;
  isCreating: boolean = false;
  activePinModal: PinKind | null = null;
  selected: Coords | null = null;
  private map!: mapboxgl.Map;
  private allPins: ViewportPinDTO[] = [];
  public isCreatePinOverlayOpen = this.popupService.activePopup() === 'choose-pin-popup';
  public selectedGeolocation: GeolocationCoordinates | null = null; // User manually selected
  public selectedPinKind: PinKind | null = null;
  public isPinDetailsOpen = this.popupService.activePopup() === 'pin-preview';
  protected selectedPin = signal<PinDataResDTO | null>(null);


  public get getGeolocationState() { return this.geoService.state(); }
  public get isGeolocationDenied() { return this.geoService.isBad(); }

  // =========================
  // Lifecycle
  // =========================
  ngOnInit() {
    /* this.route.queryParamMap.subscribe(q => {
      const modal = q.get('modal');
      const lat = q.get('lat');
      const lng = q.get('lng');

      this.activePinModal = null;

      switch (modal) {
        case 'catch':
          this.activePinModal = 0;
          break;
        case 'info':
          this.activePinModal = 1;
          break;
        case 'warn':
          this.activePinModal = 2;
          break;
        default:
          break;
      }

      if (lat && lng) {
        const latitude = Number(lat);
        const longitude = Number(lng);

        if (!Number.isNaN(latitude) && !Number.isNaN(longitude)) {
          this.selected = { latitude, longitude };
        }
      }
    }); */
  }

  private getInitialView() {
    const q = this.route.snapshot.queryParamMap;
    const lat = Number(q.get('lat'));
    const lng = Number(q.get('lng'));
    const z = Number(q.get('z'));

    const hasValid = !Number.isNaN(lat) && !Number.isNaN(lng) && !Number.isNaN(z);

    return {
      center: hasValid ? [lat, lng] as [number, number] : [-8.8909328, 38.5260437],
      zoom: hasValid ? z : 5
    }
  }

  ngAfterViewInit(): void {
    /* const view = this.getInitialView();
    if (!view) return; */
    mapboxgl.accessToken =
      'pk.eyJ1IjoiZ29uY2Fsb3BybzIiLCJhIjoiY21rcGdvN2tnMGVqeTNmcW5yNmNrM2RqdSJ9.R1MbbXiR-ZmnVF3eFp3HyQ';

    this.map = new mapboxgl.Map({
      container: 'map',
      //style: 'mapbox://styles/mapbox/standard',
      style: 'mapbox://styles/goncalopro2/cmm4ybep5002p01s2eexw84v1',
      center: [-8.8909328, 38.5260437], // [-8.8909328, 38.5260437]
      zoom: 10,
      maxZoom: 16,
      minZoom: 4.5,
      pitch: 0,
      bearing: 0,
    });

    this.map.dragRotate.disable();
    this.map.touchZoomRotate.disableRotation();
    this.map.keyboard.disableRotation();
    // Choose better cursor sytle idk
    this.map.getCanvas().style.cursor = 'default';

    this.map.on('load', () => {
      this.setupLayers();
      this.setupInteractions();


      this.map.on('moveend', () => {
        if (this.map.getZoom() < 14) return;
        this.loadPinsInViewport();
      });
      this.map.on('zoomend', () => {
        if (this.map.getZoom() < 10) return;
        this.loadPinsInViewport();
      });
      this.map.on('click', (e) => this.onMapClick(e));

    });
  }

  private togglePopup(key: PopupKey, event?: Event): void {
    this.popupService.toggle(key);
    event?.stopPropagation();
  }

  public toggleCreatePinOverlay(event: Event): void {
    this.togglePopup('choose-pin-popup', event);
  }

  public togglePinPreview(event: Event): void {
    this.togglePopup('pin-preview', event);
  }

  public requestGeolocation() {
    this.geoService.requestGeolocation();
  }

  onRequestPickOnMap(): void {
    this.enablePickMode();
  }

  onTypeSelected(pinKind: PinKind): void {
    this.activePinModal = pinKind;
    this.popupService.toggle('choose-pin-popup');
  }

  onPopupCancel(key: PopupKey): void {
    this.clearPreviewAndSelection();
    this.popupService.toggle(key);
  }

  onPopupCancelPinOverlay(): void {
    this.onPopupCancel('choose-pin-popup');
  }

  onPopupCancelPinPreview(): void {
    this.onPopupCancel('pin-preview');
  }


  onModalCancelled(): void {
    this.activePinModal = null;
    this.clearPreviewAndSelection();

    toast.info('You cancel the pin creation');
  }

  onModalConfirmed(): void {
    this.activePinModal = null;
    this.clearPreviewAndSelection();
    this.loadPinsInViewport();

    toast.success('Pin created successfully.');
  }

  zoomIn(): void {
    this.map.zoomIn({ duration: 300 });
  }

  zoomOut(): void {
    this.map.zoomOut({ duration: 300 });
  }

  onMapClick(e: mapboxgl.MapMouseEvent): void {
    if (!this.pickingOnMap) return;

    const { lng, lat } = e.lngLat;

    const coords: Coords = { latitude: lat, longitude: lng };
    this.setSelectedCoords(coords);

    this.router.navigate([], {
      queryParams : {
        lat,
        lng,
        z: this.map.getZoom()
      },
      queryParamsHandling: 'merge' // Serve para nao apagar o query params que possam existir
    });

    this.disablePickMode();
  }

  urlUpdate() {
    const center = this.map.getCenter();
    const zoom = this.map.getZoom();
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
    this.setSelectedCoords(coords);
    this.disablePickMode();
  }

  // =========================
  // Selection / Preview marker
  // =========================
  private setSelectedCoords(coords: Coords): void {
    this.selected = coords;

    this.previewMarkerService.clear();
    this.previewMarkerService.set(this.map, coords.longitude, coords.latitude);

    this.map.flyTo({ center: [coords.longitude, coords.latitude], zoom: 14 });
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


  private getPinsInViewport(minLat: number, minLng: number, maxLat: number, maxLng: number): void {
    this.pinService.getInViewport(minLat, minLng, maxLat, maxLng).subscribe({
      next: (res: ViewportPinsResDTO) => {
        //console.log('Pins in viewport loaded:', res.data?.pins);
        this.allPins = res?.pins || [];
        this.setupLayers();
      },
      error: (err: HttpErrorResponse) => {
        console.error('Error loading pins in viewport:', err);
      }
    });
  }

  // =========================
  // Clusters test
  // =========================
  private setupLayers(): void {
    PIN_CONFIG.forEach(({ kind, color }) => {
      const pinsOfKind = this.allPins.filter(pin => pin.kind === kind);
      const sourceId = `pins-${kind}`;

      const geojsonData: GeoJSON.FeatureCollection = {
        type: 'FeatureCollection',
        features: pinsOfKind.map(pin => ({
          type: 'Feature',
          geometry: {
            type: 'Point',
            coordinates: [pin.longitude, pin.latitude]
          },
          properties: {
            id: pin.id,
            kind: pin.kind,
          }
        }))
      };

      const existingSource = this.map.getSource(sourceId) as mapboxgl.GeoJSONSource;

      if (existingSource) {
        existingSource.setData(geojsonData);
      } else {
        this.map.addSource(sourceId, {
          type: 'geojson',
          data: geojsonData,
          cluster: true,
          clusterMaxZoom: 10,
          clusterRadius: 50
        });


        console.log(color);
        this.addClusterLayers(kind, color);
      }
    });
  }

  addClusterLayers(kind: PinKind, color: string) {
    // Cluster circles
    this.map.addLayer({
      id: `clusters-${kind}`,
      type: 'circle',
      source: `pins-${kind}`,
      filter: ['has', 'point_count'],
      paint: {
        'circle-color': color,
        'circle-radius': [
          'step',
          ['get', 'point_count'],
          15,      // Default
          10, 20,  // 10+ pins
          50, 25   // 50+ pins
        ],
        'circle-stroke-width': 2,
        'circle-stroke-color': '#fff',
        'circle-emissive-strength': 1,
      }
    });

    // Cluster count text
    this.map.addLayer({
      id: `cluster-count-${kind}`,
      type: 'symbol',
      source: `pins-${kind}`,
      filter: ['has', 'point_count'],
      layout: {
        'text-field': ['get', 'point_count_abbreviated'],
        'text-size': 12,
        'text-font': ['DIN Offc Pro Bold']
      },
      paint: {
        'text-color': '#ffffff',
      }
    });

    // Individual pins (unclustered)
    this.map.addLayer({
      id: `unclustered-${kind}`,
      type: 'circle',
      source: `pins-${kind}`,
      filter: ['!', ['has', 'point_count']],
      paint: {
        'circle-color': color,
        'circle-radius': 8,
        'circle-stroke-width': 2,
        'circle-stroke-color': '#fff',
        'circle-emissive-strength': 1,
      }
    });
  }

  private setupInteractions(): void {
    if (this.pickingOnMap) return;
    PIN_CONFIG.forEach(({ kind }) => {
      const clusterId = `clusters-${kind}`;
      const unclusteredId = `unclustered-${kind}`;
      const sourceId = `pins-${kind}`;

      if (this.pickingOnMap) return;
      this.map.on('click', clusterId, (e) => {
        if (!this.map.getLayer(clusterId)) return;

        const features = this.map.queryRenderedFeatures(e.point, { layers: [clusterId] });
        if (!features.length) return;

        const clusterIdProp = features[0].properties?.['cluster_id'];
        const source = this.map.getSource(sourceId) as mapboxgl.GeoJSONSource;

        source.getClusterExpansionZoom(clusterIdProp, (err, zoom) => {
          if (err) return;
          this.map.easeTo({
            center: (features[0].geometry as GeoJSON.Point).coordinates as [number, number],
            zoom: zoom as number
          });
        });
      });

      this.map.on('mouseenter', unclusteredId, (e) => {
        if (!this.map.getLayer(unclusteredId)) return;
        this.map.getCanvas().style.cursor = 'pointer';

        const features = this.map.queryRenderedFeatures(e.point, { layers: [unclusteredId] });
        if (!features.length) return;

        const pin = this.allPins.find(p => p.id === features[0].properties?.['id']);
        if (!pin) return;

        this.pinHoverPreview.showHover(this.map, pin);
      });

      this.map.on('mouseleave', unclusteredId, () => {
        this.map.getCanvas().style.cursor = 'default';
        this.pinHoverPreview.clear();
      });

      this.map.on('click', unclusteredId, (e) => {
        if (!this.map.getLayer(unclusteredId)) return;

        const features = this.map.queryRenderedFeatures(e.point, { layers: [unclusteredId] });
        if (!features.length) return;

        const pin = this.allPins.find(p => p.id === features[0].properties?.['id']);
        if (!pin) return;

        const request: PinDataReqDTO = {
          includeGeolocation: true,
          includeAuthor: true,
          includePost: true,
          includeDetails: false,
          includeGroups: true,
        }

        const getPin: GetPinsReqDTO = {
          ids: [{ pinId: pin.id }],
          dataRequest: request
        }

        this.pinHoverPreview.clear();

        this.pinService.getPinPreview(getPin).subscribe({
          next: (res: GetPinsResDTO) => {
            console.log('Pin details loaded:', res);
            const pin = res.pins[0];
            if (!pin) return;
            this.selectedPin.set(pin);
            this.popupService.open('pin-preview');

            if (pin.geolocation == null) return;
            this.map.flyTo({ center: [pin.geolocation!.longitude, pin.geolocation!.latitude], zoom: 13 });
          },
          error: (err) => console.error('Erro ao carregar pin:', err)
        });
      });

      this.map.on('mouseenter', clusterId, () => {
        if (!this.map.getLayer(clusterId)) return;
        this.map.getCanvas().style.cursor = 'pointer';
      });
      this.map.on('mouseleave', clusterId, () => {
        this.map.getCanvas().style.cursor = 'default';
      });
    });

    this.map.on('click', (e) => {
      if (this.pickingOnMap) return;
      //console.log("BOAS PESSOAS");
      const layers = PIN_CONFIG
        .flatMap(({ kind }) => [`clusters-${kind}`, `unclustered-${kind}`])
        .filter(id => this.map.getLayer(id));

      const hits = this.map.queryRenderedFeatures(e.point, { layers });

      if (hits.length > 0) {
        this.togglePinPreview(e.originalEvent);
      } else {
        this.selectedPin.set(null);
        this.pinHoverPreview.closePopup();
      }
    });
  }
}

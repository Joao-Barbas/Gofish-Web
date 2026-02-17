import mapboxgl from 'mapbox-gl';
import { AfterViewInit, Component, inject, OnDestroy, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router, RouterOutlet } from '@angular/router';
import { AuthService } from '@gofish/shared/services/auth.service';
import { UserService } from '@gofish/shared/services/user.service';
import { PinService } from '@gofish/features/map/services/pin.service';
import { PinfactoryService } from '@gofish/features/map/services/pinfactory.service';
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
import { PinType } from '@gofish/shared/models/pin.model';
import { CatchPinModalComponent } from '@gofish/features/map/components/catch-pin-modal/catch-pin-modal.component';



export type NewPinType = 'catch' | 'info' | 'warn'; // TODO: Refactor. Theres already an enum in .model.ts. Prefer this?

const PIN_TYPES: PinType[] = [PinType.CATCH, PinType.INFORMATION, PinType.WARNING];

const PIN_CONFIG: Record<PinType, any> = {
  [PinType.CATCH]: { color: '#EF4444', position: [-18, 14] }, // Catch
  [PinType.INFORMATION]: { color: '#F59E0B', position: [0, -20] }, // Warn
  [PinType.WARNING]: { color: '#3B82F6', position: [18, 14] }, // Info
  [PinType.DEFAULT]: {}
};

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
    CatchPinModalComponent
  ],
  templateUrl: './map.component.html',
  styleUrl: './map.component.css',
})
export class MapComponent implements OnInit, AfterViewInit, OnDestroy {
  private readonly popupService = inject(PopupService);
  private readonly geoService = inject(GeolocationService);

  public isCreatePinOverlayOpen$ = this.popupService.isOpen$(ChoosePinPopupComponent.key);

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

  /* onCreateByPick(pinType: NewPinType) {
    this.selectedPinType = pinType;
    this.popupService.toggle(ChoosePinPopupComponent.key);
    this.enablePickMode();
    console.log('Create by pick on map');
  } */




  // End create pin events

  public requestGeolocation() {
    this.geoService.requestGeolocation();
  }

  onRequestPickOnMap(): void {
    this.enablePickMode();
  }

  onTypeSelected(pinType: PinType): void {
    this.activePinModal = pinType;
    this.popupService.toggle(ChoosePinPopupComponent.key);
  }

  onPopupCancel(): void {
    this.clearPreviewAndSelection();
    this.popupService.toggle(ChoosePinPopupComponent.key);
  }

  onModalCancelled(): void {
    this.activePinModal = null;
    this.clearPreviewAndSelection();
  }

  onModalConfirmed(): void {
    this.activePinModal = null;
    this.clearPreviewAndSelection();
    this.loadPinsInViewport();
  }





  activePinModal: PinType | null = null;

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
      this.setupLayers();
      this.setupInteractions();
      this.loadPinsInViewport();

      this.map.on('moveend', () => this.loadPinsInViewport());
      this.map.on('zoomend', () => this.loadPinsInViewport());
      this.map.on('click', (e) => this.onMapClick(e));

    });
  }


  onMapClick(e: mapboxgl.MapMouseEvent): void {
    if (!this.pickingOnMap) return;

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
        const pins = res.data?.pins.map(pin => ({
          type: 'Feature' as const,
          geometry: {
            type: 'Point' as const,
            coordinates: [pin.longitude, pin.latitude]
          },
          properties: {
            id: pin.id,
            category: pin.pinType,
            pinType: pin.pinType // Add more categories ?
          }
        })) || [];

        const geoJsonData: GeoJSON.FeatureCollection = {
          type: 'FeatureCollection',
          features: pins
        };

        const source = this.map.getSource('pins-source') as mapboxgl.GeoJSONSource;

        if (source) {
          source.setData(geoJsonData);
          //console.log('Features na source:', this.map.querySourceFeatures('pins-source'));
        } else {
          this.setupLayers();
          (this.map.getSource('pins-source') as mapboxgl.GeoJSONSource).setData(geoJsonData);
        }
      },
      error: (err: HttpErrorResponse) => {
        console.error('Erro ao carregar pins:', err);
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


  // =========================
  // Clusters test
  // =========================
  private setupLayers(): void {
    this.map.addSource('pins-source', {
      type: 'geojson',
      data: { type: 'FeatureCollection', features: [] },
      cluster: true,
      clusterMaxZoom: 10,
      clusterRadius: 50, //Pixeis
      clusterProperties: {
        count_catch: ['+', ['case', ['==', ['get', 'pinType'], 'catch'], 1, 0]],
        count_warn: ['+', ['case', ['==', ['get', 'pinType'], 'warn'], 1, 0]],
        count_info: ['+', ['case', ['==', ['get', 'pinType'], 'info'], 1, 0]],
      }
    });

    // Cluster layer (Circle) - Main
    this.map.addLayer({
      id: 'clusters-layer',
      type: 'circle',
      source: 'pins-source',
      filter: ['has', 'point_count'],
      paint: {
        'circle-color': '#1E293B',
        'circle-radius': ['step', ['get', 'point_count'], 24, 10, 32, 50, 42],
        'circle-stroke-width': 2,
        'circle-stroke-color': '#475569',
        'circle-opacity': 0.95,
      },
    });

    // Sub-Clusters

    PIN_TYPES.forEach(type => {
      this.addSubClusterLayers(type, PIN_CONFIG[type]);
    });

    // Layer Count
    this.map.addLayer({
      id: 'cluster-count',
      type: 'symbol',
      source: 'pins-source',
      filter: ['has', 'point_count'],
      layout: {
        'text-field': ['get', 'point_count_abbreviated'],
        'text-font': ['DIN Offc Pro Medium', 'Arial Unicode MS Bold'],
        'text-size': 12
      },
      paint: {
        'text-color': '#F8FAFC',
      }
    });

    this.addUnclusteredLayers();
  }

  private addSubClusterLayers(type: PinType, config: { color: string; position: number[] }): void {
    const countProp = `count_${type}`;

    this.map.addLayer({
      id: `cluster-sub-${type}`,
      type: `circle`,
      source: `pins-source`,
      filter: ['all',
        ['has', 'point_count'],
        ['>', ['get', countProp], 0]
      ],
      paint: {
        'circle-color': config.color,
        'circle-radius': [
          'interpolate', ['linear'], ['get', countProp],
          1, 8,
          10, 12,
          50, 15,
        ],
        'circle-translate': [config.position[0], config.position[1]],
        'circle-stroke-width': 1.5,
        'circle-stroke-color': '#1E293B',
        'circle-opacity': 0.95,
      }
    });

    this.map.addLayer({
      id: `cluster-sub-label-${type}`,
      type: 'symbol',
      source: 'pins-source',
      filter: ['all',
        ['has', 'point_count'],
        ['>', ['get', countProp], 0]
      ],
      layout: {
        'text-field': ['to-string', ['get', countProp]],
        'text-font': ['DIN Offc Pro Bold', 'Arial Unicode MS Bold'],
        'text-size': 9,
        'text-offset': [config.position[0] / 12, config.position[1] / 12],
        'text-anchor': 'center',
      },
      paint: {
        'text-color': '#FFFFFF',
      }
    });
  }

  private addUnclusteredLayers(): void {
    PIN_TYPES.forEach(type => {
      const { color } = PIN_CONFIG[type];
      const isUnclustered = ['all',
        ['!', ['has', 'point_count']],
        ['==', ['get', 'pinType'], type]
      ] as mapboxgl.FilterSpecification;

      this.map.addLayer({
        id: `unclustered-halo-${type}`,
        type: 'circle',
        source: 'pins-source',
        filter: isUnclustered,
        paint: {
          'circle-color': color,
          'circle-radius': 14,
          'circle-opacity': 0.2,
        }
      });

      this.map.addLayer({
        id: `unclustered-point-${type}`,
        type: 'circle',
        source: 'pins-source',
        filter: isUnclustered,
        paint: {
          'circle-color': color,
          'circle-radius': 8,
          'circle-stroke-width': 2,
          'circle-stroke-color': '#FFFFFF',
          'circle-emissive-strength': 1,
        }
      });
    });
  }

  private setupInteractions(): void {
    this.map.on('click', 'clusters-layer', (e) => {
      const features = this.map.queryRenderedFeatures(e.point, { layers: ['clusters-layer'] });
      if (!features.length) return;

      const clusterId = features[0].properties?.['cluster_id'];
      const source = this.map.getSource('pins-source') as mapboxgl.GeoJSONSource;

      source.getClusterExpansionZoom(clusterId, (err, zoom) => {
        if (err) return;
        this.map.easeTo({
          center: (features[0].geometry as GeoJSON.Point).coordinates as [number, number],
          zoom: zoom as number
        });
      });
    });


    const unclusteredLayers = ([0, 1, 2] as PinType[])
      .map(t => `unclustered-point-${t}`);

    unclusteredLayers.forEach(layerId => {
      this.map.on('click', layerId, (e) => {
        if (!e.features?.length) return;

        const feature = e.features[0];
        const pinId = feature.properties?.['id'];
        const coordinates = (feature.geometry as GeoJSON.Point).coordinates as [number, number];

        this.pinService.getPinPreview(pinId).subscribe({
          next: (res: PinPreviewResDTO) => {
            if (!res.success) return;
            this.pinDetailService.open(res);
            this.map.flyTo({ center: coordinates, zoom: 15, speed: 1.2 });
          }
        });
      });
    });


    const interactiveLayers = ['clusters-layer', ...unclusteredLayers];
    interactiveLayers.forEach(layer => {
      this.map.on('mouseenter', layer, () => this.map.getCanvas().style.cursor = 'pointer');
      this.map.on('mouseleave', layer, () => this.map.getCanvas().style.cursor = '');
    });
  }
}

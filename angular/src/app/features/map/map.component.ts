import mapboxgl from 'mapbox-gl';
import { AfterViewInit, Component, inject, OnDestroy, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { RouterOutlet } from '@angular/router';
import { PinService } from '@gofish/features/map/services/pin.service';
import { PreviewMarkerService } from '@gofish/features/map/services/preview-marker.service';
import { MarkerRegistryService } from '@gofish/features/map/services/marker-registry.service';
import { PinDetailService } from '@gofish/features/map/services/pin-detail.service';
import { PinDetailPanelComponent } from './components/pin-detail-panel/pin-detail-panel.component';
import { OverlayHeaderComponent } from '@gofish/features/header/overlay-header/overlay-header.component';
import { ViewportPinDTO, ViewportPinsResDTO } from '@gofish/shared/dtos/pin.dto';
import { HttpErrorResponse } from '@angular/common/http';
import { Coords } from '@gofish/shared/models/coords.model';
import { PopupService } from '@gofish/shared/services/popup.service';
import { ChoosePinPopupComponent } from '@gofish/features/map/components/choose-pin-popup/choose-pin-popup.component';
import { GeolocationService } from '@gofish/shared/services/geolocation.service';
import { PinType } from '@gofish/shared/models/pin.model';
import { CatchPinModalComponent } from '@gofish/features/map/components/modals/catch-pin-modal/catch-pin-modal.component';
import { PinHoverPreviewService } from '@gofish/features/map/services/pin-hover-preview.service';
import { InfoPinModalComponent } from '@gofish/features/map/components/modals/info-pin-modal/info-pin-modal.component';



export type NewPinType = 'catch' | 'info' | 'warn'; // TODO: Refactor. Theres already an enum in .model.ts. Prefer this?

const PIN_TYPES: PinType[] = [PinType.CATCH, PinType.INFORMATION, PinType.WARNING];

/* const PIN_CONFIG: Record<PinType, any> = {
  [PinType.CATCH]: { color: '#EF4444', position: [-18, 14] }, // Catch
  [PinType.INFORMATION]: { color: '#F59E0B', position: [0, -20] }, // Warn
  [PinType.WARNING]: { color: '#3B82F6', position: [18, 14] }, // Info
  [PinType.DEFAULT]: {}
}; */

const PIN_CONFIG = [
  { type: PinType.CATCH, color: '#f30000' },
  { type: PinType.INFORMATION, color: '#3b82f6' },
  { type: PinType.WARNING, color: '#ff6a00' }
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
    InfoPinModalComponent
  ],
  templateUrl: './map.component.html',
  styleUrl: './map.component.css',
})
export class MapComponent implements AfterViewInit, OnDestroy {
  private readonly popupService = inject(PopupService);
  private readonly geoService = inject(GeolocationService);
  private readonly pinService = inject(PinService);
  private readonly previewMarkerService = inject(PreviewMarkerService);
  private readonly markerRegistry = inject(MarkerRegistryService);
  private readonly pinDetailService = inject(PinDetailService);
  private readonly pinHoverPreview = inject(PinHoverPreviewService);

  // End popup overlays
  // Create pin events

  /* onCreateByPick(pinType: NewPinType) {
    this.selectedPinType = pinType;
    this.popupService.toggle(ChoosePinPopupComponent.key);
    this.enablePickMode();
    console.log('Create by pick on map');
  } */
  pickingOnMap = false;
  isCreating: boolean = false;
  activePinModal: PinType | null = null;
  selected: Coords | null = null;
  private map!: mapboxgl.Map;
  public isCreatePinOverlayOpen$ = this.popupService.isOpen$(ChoosePinPopupComponent.key);
  public selectedGeolocation: GeolocationCoordinates | null = null; // User manually selected
  public selectedPinType: PinType | null = null;

  public get getGeolocationState() { return this.geoService.state(); }
  public get isGeolocationDenied() { return this.geoService.isBad(); }


  // =========================
  // Lifecycle
  // =========================
  ngAfterViewInit(): void {
    mapboxgl.accessToken =
      'pk.eyJ1IjoiZ29uY2Fsb3BybzIiLCJhIjoiY21rcGdvN2tnMGVqeTNmcW5yNmNrM2RqdSJ9.R1MbbXiR-ZmnVF3eFp3HyQ';

    this.map = new mapboxgl.Map({
      container: 'map',
      //style: 'mapbox://styles/mapbox/standard',
      style: 'mapbox://styles/goncalopro2/cmli4rxhm000q01qzfnbzg3fe',
      center: [-8.8882, 38.5243],
      zoom: 13,
      maxZoom: 16,
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

  public toggleCreatePinOverlay(event: Event): void {
    this.popupService.toggle(ChoosePinPopupComponent.key);
    event.stopPropagation();
  }

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

  private allPins: ViewportPinDTO[] = [];
  private getPinsInViewport(minLat: number, minLng: number, maxLat: number, maxLng: number): void {
    this.pinService.getInViewport(minLat, minLng, maxLat, maxLng).subscribe({
      next: (res: ViewportPinsResDTO) => {
        this.allPins = res.data?.pins || [];
        this.setupLayers();
      },
      error: (err: HttpErrorResponse) => {
        console.error('Erro ao carregar pins:', err);
      }
    });
  }

  // =========================
  // Clusters test
  // =========================

  private setupLayers(): void {
    PIN_CONFIG.forEach(({ type, color }) => {
      const pinsOfType = this.allPins.filter(pin => pin.pinType === type);
      const sourceId = `pins-${type}`;

      const geojsonData: GeoJSON.FeatureCollection = {
        type: 'FeatureCollection',
        features: pinsOfType.map(pin => ({
          type: 'Feature',
          geometry: {
            type: 'Point',
            coordinates: [pin.longitude, pin.latitude]
          },
          properties: {
            id: pin.id,
            type: pin.pinType
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
          clusterMaxZoom: 14,
          clusterRadius: 50
        });

        console.log(color);
        this.addClusterLayers(type, color);
      }
    });
  }

  addClusterLayers(type: PinType, color: string) {
    // Cluster circles
    this.map.addLayer({
      id: `clusters-${type}`,
      type: 'circle',
      source: `pins-${type}`,
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
        'circle-stroke-color': '#fff'
      }
    });

    // Cluster count text
    this.map.addLayer({
      id: `cluster-count-${type}`,
      type: 'symbol',
      source: `pins-${type}`,
      filter: ['has', 'point_count'],
      layout: {
        'text-field': ['get', 'point_count_abbreviated'],
        'text-size': 12
      },
      paint: {
        'text-color': '#ffffff'
      }
    });

    // Individual pins (unclustered)
    this.map.addLayer({
      id: `unclustered-${type}`,
      type: 'circle',
      source: `pins-${type}`,
      filter: ['!', ['has', 'point_count']],
      paint: {
        'circle-color': color,
        'circle-radius': 8,
        'circle-stroke-width': 2,
        'circle-stroke-color': '#fff'
      }
    });
  }

  private setupInteractions(): void {
    PIN_CONFIG.forEach(({ type }) => {
      const clusterId = `clusters-${type}`;
      const unclusteredId = `unclustered-${type}`;
      const sourceId = `pins-${type}`;

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
        this.map.getCanvas().style.cursor = '';
        this.pinHoverPreview.clear();
      });

      this.map.on('click', unclusteredId, (e) => {
        if (!this.map.getLayer(unclusteredId)) return;

        const features = this.map.queryRenderedFeatures(e.point, { layers: [unclusteredId] });
        if (!features.length) return;

        const pin = this.allPins.find(p => p.id === features[0].properties?.['id']);
        if (!pin) return;

        this.pinHoverPreview.clear();

        this.pinService.getPinPreview(pin.id).subscribe({
          next: (res) => {
            if (!res.success) return;
            console.log('Pin details loaded:', res.data);
            this.pinDetailService.open({ data: res.data });
            this.map.flyTo({ center: [pin.longitude, pin.latitude], zoom: 13 });
          },
          error: (err) => console.error('Erro ao carregar pin:', err)
        });
      });

      this.map.on('mouseenter', clusterId, () => {
        if (!this.map.getLayer(clusterId)) return;
        this.map.getCanvas().style.cursor = 'pointer';
      });
      this.map.on('mouseleave', clusterId, () => {
        this.map.getCanvas().style.cursor = '';
      });
    });

    this.map.on('click', (e) => {
      if (this.pickingOnMap) return;

      const layers = PIN_CONFIG
        .flatMap(({ type }) => [`clusters-${type}`, `unclustered-${type}`])
        .filter(id => this.map.getLayer(id));

      const hits = this.map.queryRenderedFeatures(e.point, { layers });
      if (!hits.length) {
        this.pinHoverPreview.closePopup();
        this.pinDetailService.close();
      }
    });
  }

  /* private setupLayers(): void {
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
  */
}

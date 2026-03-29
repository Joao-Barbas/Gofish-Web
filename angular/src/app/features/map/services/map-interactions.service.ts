import { Injectable, Signal, inject } from '@angular/core';
import { ViewportPinDTO, GetPinsReqDto, GetPinsResDTO, PinDataReqDTO, PinDataResDTO, PinIdDTO, PinDto } from '@gofish/shared/dtos/pin.dto';
import { PinService } from '@gofish/shared/services/pin.service';
import { PinHoverPreviewService } from '@gofish/features/map/services/pin-hover-preview.service';
import { PopupService } from '@gofish/shared/services/popup.service';
import { PIN_CONFIG } from '@gofish/shared/constants/index';
import { WritableSignal } from '@angular/core';

@Injectable({
  providedIn: 'root',
})
export class MapInteractionsService {
  private readonly pinService = inject(PinService);
  private readonly pinHoverPreview = inject(PinHoverPreviewService);
  private readonly popupService = inject(PopupService);

  setup(
    map: mapboxgl.Map,
    allPins: WritableSignal<PinDto[]>,
    selectedPin: WritableSignal<PinDto | null>,
    selectedPins: WritableSignal<PinDto[]>,
    isPickingOnMap: () => boolean
  ): void {
    PIN_CONFIG.forEach(({ kind }) => {
      const clusterId = `clusters-${kind}`;
      const unclusteredId = `unclustered-${kind}`;
      const sourceId = `pins-${kind}`;

      this.registerClusterClick(map, clusterId, sourceId, selectedPins, allPins);
      this.registerPinHover(map, unclusteredId, allPins);
      this.registerPinClick(map, unclusteredId, allPins, selectedPin, selectedPins);
      this.registerClusterCursor(map, clusterId);
    });

    this.registerMapClick(map, selectedPin, isPickingOnMap);
  }

  private registerClusterClick(map: mapboxgl.Map, clusterId: string, sourceId: string, selectedPins: WritableSignal<PinDto[]>, allPins: WritableSignal<PinDto[]>): void {
    map.on('click', clusterId, (e) => {
      if (!map.getLayer(clusterId)) return;
      const features = map.queryRenderedFeatures(e.point, { layers: [clusterId] });
      if (!features.length) return;

      const clusterIdProp = features[0].properties?.['cluster_id'];
      if (!clusterIdProp) return;

      const source = map.getSource(sourceId) as mapboxgl.GeoJSONSource;

      source.getClusterExpansionZoom(clusterIdProp, (err, zoom) => {
        if (err) return;
        map.easeTo({
          center: (features[0].geometry as GeoJSON.Point).coordinates as [number, number],
          //zoom: zoom as number
        });
      });

      source.getClusterLeaves(clusterIdProp, Infinity, 0, (err, leaves) => {
        if (err || !leaves) return;

        const pinIds: PinIdDTO[] = leaves.map(leaf => {
          return {
            pinId: leaf.properties?.['id']
          };
        });

        const request: GetPinsReqDto = {
          ids: pinIds,
          dataRequest: {
            includeGeolocation: true,
            includeAuthor: true,
            includeDetails: true,
            includeStats: true,
            includeUgc: true,
            includeGroups: true,
            includeComments: true
          }
        };

        this.pinService.getPins(request).subscribe({
          next: (res) => {
            selectedPins.set(res.pins);
            this.popupService.open('cluster-preview');
            console.log(res.pins);
          },
          error: (err) => {
            console.log(err);
          }
        });

      });
    });
  }

  private registerPinHover(map: mapboxgl.Map, unclusteredId: string, allPins: WritableSignal<PinDto[]>): void {
    map.on('mouseenter', unclusteredId, (e) => {
      if (!map.getLayer(unclusteredId)) return;
      map.getCanvas().style.cursor = 'pointer';

      const features = map.queryRenderedFeatures(e.point, { layers: [unclusteredId] });
      if (!features.length) return;

      const pin = allPins().find(p => p.id === features[0].properties?.['id']);
      if (!pin) return;
      this.pinHoverPreview.showHover(map, pin);
    });

    map.on('mouseleave', unclusteredId, () => {
      map.getCanvas().style.cursor = 'default';
      this.pinHoverPreview.clear();
    });
  }

  private registerPinClick(
    map: mapboxgl.Map,
    unclusteredId: string,
    allPins: WritableSignal<PinDto[]>,
    selectedPin: WritableSignal<PinDto | null>,
    selectedPins: WritableSignal<PinDto[]>
  ): void {
    map.on('click', unclusteredId, (e) => {
      if (!map.getLayer(unclusteredId)) return;

      const features = map.queryRenderedFeatures(e.point, { layers: [unclusteredId] });
      if (!features.length) return;

      const feature = features[0];
      const [lng, lat] = (feature.geometry as GeoJSON.Point).coordinates;

      const pinsAtLocation = allPins().filter(pin => {
        this.sameCoordinates(pin!.geolocation!.latitude, pin!.geolocation!.longitude, lat, lng)
      });

      if (!pinsAtLocation) return;

      this.pinHoverPreview.clear();

      // If have stacked pins
      if (pinsAtLocation.length > 1) {
        this.openPinsList(pinsAtLocation, selectedPins);
        return;
      }

      const pinId = feature.properties?.['id'];
      if (!pinId) return;

      this.openSinglePin(pinId, selectedPin, map);
    });
  }

  private sameCoordinates(lat1: number, lng1: number, lat2: number, lng2: number): boolean {
    const EPSILON = 0.000001; // Helps in precision
    return Math.abs(lat1 - lat2) < EPSILON && Math.abs(lng1 - lng2) < EPSILON;
  }

  private openPinsList(pins: PinDto[], selectedPins: WritableSignal<PinDto[]>) {
    const request: GetPinsReqDto = {
      ids: pins.map(pin => ({ pinId: pin.id })),
      dataRequest: {
        includeGeolocation: true,
        includeAuthor: true,
        includeDetails: true,
        includeStats: true,
        includeUgc: true,
        includeGroups: true,
        includeComments: true
      }
    };

    this.pinService.getPins(request).subscribe({
      next: (res) => {
        selectedPins.set(res.pins);
        this.popupService.open('cluster-preview');
      },
      error: (err) => {
        console.log(err);
      }
    });
  }

  private openSinglePin(
    pinId: number,
    selectedPin: WritableSignal<PinDto | null>,
    map: mapboxgl.Map
  ): void {
    const request: GetPinsReqDto = {
      ids: [{ pinId }],
      dataRequest: {
        includeGeolocation: true,
        includeAuthor: true,
        includeDetails: true,
        includeStats: true,
        includeUgc: true,
        includeGroups: true,
        includeComments: true
      }
    };

    this.pinService.getPins(request).subscribe({
      next: (res) => {
        const pin = res.pins[0];
        if (!pin) return;

        selectedPin.set(pin);
        this.popupService.open('pin-preview');

        if (!pin.geolocation) return;

        map.flyTo({
          center: [pin.geolocation.longitude, pin.geolocation.latitude],
          zoom: 13
        });

        console.log(res);
      },
      error: (err) => console.error(err)
    });
  }

  private registerClusterCursor(map: mapboxgl.Map, clusterId: string): void {
    map.on('mouseenter', clusterId, () => {
      if (!map.getLayer(clusterId)) return;
      map.getCanvas().style.cursor = 'pointer';
    });
    map.on('mouseleave', clusterId, () => {
      map.getCanvas().style.cursor = 'default';
    });
  }

  private registerMapClick(
    map: mapboxgl.Map,
    selectedPin: WritableSignal<PinDto | null>,
    isPickingOnMap: () => boolean
  ): void {
    map.on('click', (e) => {
      if (isPickingOnMap()) return;

      const layers = PIN_CONFIG
        .flatMap(({ kind }) => [`clusters-${kind}`, `unclustered-${kind}`])
        .filter(id => map.getLayer(id));

      const hits = map.queryRenderedFeatures(e.point, { layers });

      if (hits.length === 0) {
        selectedPin.set(null);
        this.pinHoverPreview.closePopup();
      }
    });
  }
}

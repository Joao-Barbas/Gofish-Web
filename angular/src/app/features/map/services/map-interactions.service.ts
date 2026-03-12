import { Injectable, inject } from '@angular/core';
import { ViewportPinDTO, GetPinsReqDTO, GetPinsResDTO, PinDataReqDTO, PinDataResDTO } from '@gofish/shared/dtos/pin.dto';
import { PinService } from '@gofish/features/map/services/pin.service';
import { PinHoverPreviewService } from '@gofish/features/map/services/pin-hover-preview.service';
import { PopupService } from '@gofish/shared/services/popup.service';
import { PIN_CONFIG } from './map-layers.service';
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
    allPins: ViewportPinDTO[],
    selectedPin: WritableSignal<PinDataResDTO | null>,
    isPickingOnMap: () => boolean
  ): void {
    PIN_CONFIG.forEach(({ kind }) => {
      const clusterId = `clusters-${kind}`;
      const unclusteredId = `unclustered-${kind}`;
      const sourceId = `pins-${kind}`;

      this.registerClusterClick(map, clusterId, sourceId);
      this.registerPinHover(map, unclusteredId, allPins);
      this.registerPinClick(map, unclusteredId, allPins, selectedPin);
      this.registerClusterCursor(map, clusterId);
    });

    this.registerMapClick(map, selectedPin, isPickingOnMap);
  }

  private registerClusterClick(map: mapboxgl.Map, clusterId: string, sourceId: string): void {
    map.on('click', clusterId, (e) => {
      if (!map.getLayer(clusterId)) return;
      const features = map.queryRenderedFeatures(e.point, { layers: [clusterId] });
      if (!features.length) return;

      const clusterIdProp = features[0].properties?.['cluster_id'];
      const source = map.getSource(sourceId) as mapboxgl.GeoJSONSource;

      source.getClusterExpansionZoom(clusterIdProp, (err, zoom) => {
        if (err) return;
        map.easeTo({
          center: (features[0].geometry as GeoJSON.Point).coordinates as [number, number],
          zoom: zoom as number
        });
      });
    });
  }

  private registerPinHover(map: mapboxgl.Map, unclusteredId: string, allPins: ViewportPinDTO[]): void {
    map.on('mouseenter', unclusteredId, (e) => {
      if (!map.getLayer(unclusteredId)) return;
      map.getCanvas().style.cursor = 'pointer';

      const features = map.queryRenderedFeatures(e.point, { layers: [unclusteredId] });
      if (!features.length) return;

      const pin = allPins.find(p => p.id === features[0].properties?.['id']);
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
    allPins: ViewportPinDTO[],
    selectedPin: WritableSignal<PinDataResDTO | null>
  ): void {
    map.on('click', unclusteredId, (e) => {
      if (!map.getLayer(unclusteredId)) return;
      const features = map.queryRenderedFeatures(e.point, { layers: [unclusteredId] });
      if (!features.length) return;

      const pin = allPins.find(p => p.id === features[0].properties?.['id']);
      if (!pin) return;

      const getPin: GetPinsReqDTO = {
        ids: [{ pinId: pin.id }],
        dataRequest: {
          includeGeolocation: true,
          includeAuthor: true,
          includePost: true,
          includeDetails: false,
          includeGroups: true,
        } as PinDataReqDTO
      };

      this.pinHoverPreview.clear();

      this.pinService.getPinPreview(getPin).subscribe({
        next: (res: GetPinsResDTO) => {
          const pin = res.pins[0];
          if (!pin) return;
          selectedPin.set(pin);
          this.popupService.open('pin-preview');
          if (pin.geolocation == null) return;
          map.flyTo({ center: [pin.geolocation.longitude, pin.geolocation.latitude], zoom: 13 });
        },
        error: (err) => console.error('Erro ao carregar pin:', err)
      });
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
    selectedPin: WritableSignal<PinDataResDTO | null>,
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

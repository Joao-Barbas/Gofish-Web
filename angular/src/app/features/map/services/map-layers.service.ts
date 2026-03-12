import { Injectable } from '@angular/core';
import { ViewportPinDTO } from '@gofish/shared/dtos/pin.dto';
import { PinKind } from '@gofish/shared/models/pin.model';

export const PIN_CONFIG = [
  { kind: PinKind.CATCH, color: '#f30000' },
  { kind: PinKind.INFORMATION, color: '#3b82f6' },
  { kind: PinKind.WARNING, color: '#ff6a00' }
];

@Injectable({
  providedIn: 'root',
})
export class MapLayersService {
  updateLayers(map: mapboxgl.Map, allPins: ViewportPinDTO[]): void {
    PIN_CONFIG.forEach(({ kind, color }) => {
      const pinsOfKind = allPins.filter(pin => pin.kind === kind);
      const sourceId = `pins-${kind}`;

      const geojsonData: GeoJSON.FeatureCollection = {
        type: 'FeatureCollection',
        features: pinsOfKind.map(pin => ({
          type: 'Feature',
          geometry: { type: 'Point', coordinates: [pin.longitude, pin.latitude] },
          properties: { id: pin.id, kind: pin.kind }
        }))
      };

      const existingSource = map.getSource(sourceId) as mapboxgl.GeoJSONSource;

      if (existingSource) {
        existingSource.setData(geojsonData);
      } else {
        map.addSource(sourceId, {
          type: 'geojson',
          data: geojsonData,
          cluster: true,
          clusterMaxZoom: 10,
          clusterRadius: 50
        });
        this.addClusterLayers(map, kind, color);
      }
    });
  }

  private addClusterLayers(map: mapboxgl.Map, kind: PinKind, color: string): void {
    map.addLayer({
      id: `clusters-${kind}`,
      type: 'circle',
      source: `pins-${kind}`,
      filter: ['has', 'point_count'],
      paint: {
        'circle-color': color,
        'circle-radius': ['step', ['get', 'point_count'], 15, 10, 20, 50, 25],
        'circle-stroke-width': 2,
        'circle-stroke-color': '#fff',
        'circle-emissive-strength': 1,
      }
    });

    map.addLayer({
      id: `cluster-count-${kind}`,
      type: 'symbol',
      source: `pins-${kind}`,
      filter: ['has', 'point_count'],
      layout: {
        'text-field': ['get', 'point_count_abbreviated'],
        'text-size': 12,
        'text-font': ['DIN Offc Pro Bold']
      },
      paint: { 'text-color': '#ffffff' }
    });

    map.addLayer({
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
}

import { Injectable, WritableSignal } from '@angular/core';
import { ViewportPinDTO } from '@gofish/shared/dtos/pin.dto';
import { PinKind } from '@gofish/shared/models/pin.model';

export const PIN_CONFIG = [
  { kind: PinKind.CATCH, color: '#16A34A', iconUrl: 'assets/images/pins-icons/Kind=Catch.png', icon: 'pin-catch' },
  { kind: PinKind.INFORMATION, color: '#3B82F6', iconUrl: 'assets/images/pins-icons/Kind=Information.png', icon: 'pin-Information' },
  { kind: PinKind.WARNING, color: '#F97316', iconUrl: 'assets/images/pins-icons/Kind=Warning.png', icon: 'pin-Warning' }
];

@Injectable({
  providedIn: 'root',
})
export class MapLayersService {
  updateLayers(map: mapboxgl.Map, allPins: WritableSignal<ViewportPinDTO[]>): void {
    this.loadPinIcons(map);
    PIN_CONFIG.forEach(({ kind, color, icon }) => {
      const pinsOfKind = allPins().filter(pin => pin.kind === kind);
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
        this.addClusterLayers(map, kind, color, icon);
      }
    });
  }

  private addClusterLayers(map: mapboxgl.Map, kind: PinKind, color: string, icon: string): void {
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
      type: 'symbol',
      source: `pins-${kind}`,
      filter: ['!', ['has', 'point_count']],
      layout: {
        'icon-image': icon,
        'icon-size': 0.05,
        'icon-allow-overlap': true,
        'icon-ignore-placement': true
      }
    });
  }

  public loadPinIcons(map: mapboxgl.Map) {
    PIN_CONFIG.forEach(({ icon, iconUrl }) => {
      if (map.hasImage(icon)) return;

      map.loadImage(iconUrl, (error, image) => {
        if (error) {
          console.error(`Error loading icon ${iconUrl}`, error);
          return;
        }

        if (!image) return;

        if (!map.hasImage(icon)) {
          map.addImage(icon, image);
        }
      });
    });
  }

}

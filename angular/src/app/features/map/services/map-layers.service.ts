import { Injectable, WritableSignal } from '@angular/core';
import { PIN_CONFIG } from '@gofish/shared/constants';
import { GetInViewportResDto, PinDto, ViewportPinDTO } from '@gofish/shared/dtos/pin.dto';
import { PinKind } from '@gofish/shared/models/pin.model';



@Injectable({
  providedIn: 'root',
})
export class MapLayersService {
  protected readonly pinConfigs = PIN_CONFIG;
  updateLayers(map: mapboxgl.Map, allPins: WritableSignal<PinDto[]>): void {
    this.loadPinIcons(map);
    this.pinConfigs.forEach(({ kind, color, icon }) => {
      const pinsOfKind = allPins().filter(pin => pin.kind === kind);
      const sourceId = `pins-${kind}`;

      const geojsonData: GeoJSON.FeatureCollection = {
        type: 'FeatureCollection',
        features: pinsOfKind.map(pin => ({
          type: 'Feature',
          geometry: { type: 'Point', coordinates: [pin.geolocation!.longitude, pin.geolocation!.latitude] },
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
        'icon-size': 24 / 128, // Icons .png resolution at 128px and we want 24px size on mapbox
        'icon-allow-overlap': true,
        'icon-ignore-placement': true
      }
    });
  }

  public loadPinIcons(map: mapboxgl.Map) {
    this.pinConfigs.forEach(({ icon, iconUrl }) => {
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

import { Injectable } from '@angular/core';
import mapboxgl from 'mapbox-gl';

@Injectable({ providedIn: 'root' })
export class PreviewMarkerService {
  private previewMarker: mapboxgl.Marker | null = null;

  constructor() { }

  set(map: mapboxgl.Map, lng: number, lat: number): void {
    this.clear();

    this.previewMarker = new mapboxgl.Marker()
      .setLngLat([lng, lat])
      .addTo(map);
    //map.jumpTo({center:[lng,lat]});
  }

  clear(): void {
    this.previewMarker?.remove();
    this.previewMarker = null;
  }
}

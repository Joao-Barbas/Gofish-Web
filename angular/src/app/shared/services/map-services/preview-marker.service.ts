import { Injectable } from '@angular/core';
import mapboxgl from 'mapbox-gl';

@Injectable({ providedIn: 'root' })
export class PreviewMarkerService {
  private previewMarker: mapboxgl.Marker | null = null;

  constructor() { }

  clear(): void {
    if (this.previewMarker) {
      this.previewMarker.remove();
      this.previewMarker = null;
    }
  }


  set(
    map: mapboxgl.Map,
    lng: number,
    lat: number,
    createMarker: (lng: number, lat: number) => mapboxgl.Marker
  ): void {

    this.clear();

    this.previewMarker = createMarker(lng, lat);

    this.previewMarker.addTo(map);
  }
}

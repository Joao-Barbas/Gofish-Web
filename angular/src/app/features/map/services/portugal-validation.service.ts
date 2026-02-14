import { Injectable } from '@angular/core';

@Injectable({
  providedIn: 'root'
})
export class PortugalValidationService {

  private readonly portugalLayers = ['portugal'];
  constructor() { }

  isPortugalAtPoint(map: mapboxgl.Map, point: mapboxgl.PointLike): boolean {
    const features = map.queryRenderedFeatures(point, { layers: this.portugalLayers });
    return features.length > 0;
  }

  isPortugalAtLngLat(map: mapboxgl.Map, lng: number, lat: number): boolean {
    const point = map.project([lng, lat]);
    const features = map.queryRenderedFeatures(point, { layers: this.portugalLayers });

    return features.length > 0;
  }
}

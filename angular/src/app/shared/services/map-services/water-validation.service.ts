import { Injectable } from '@angular/core';
import mapboxgl from 'mapbox-gl';

@Injectable({ providedIn: 'root' })
export class WaterValidationService {

  private readonly waterLayers = ['water'];
  constructor() { }


  isWaterAtPoint(map: mapboxgl.Map, point: mapboxgl.PointLike): boolean {
    const features = map.queryRenderedFeatures(point, { layers: this.waterLayers });
    return features.length > 0;
  }


  isWaterAtLngLat(map: mapboxgl.Map, lng: number, lat: number): boolean {
    const point = map.project([lng, lat]);
    const features = map.queryRenderedFeatures(point, { layers: this.waterLayers });

    return features.length > 0;
  }
}

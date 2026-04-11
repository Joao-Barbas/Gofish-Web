import { Injectable } from '@angular/core';
import mapboxgl from 'mapbox-gl';

/**
 * Service responsible for managing a temporary preview marker on the map.
 *
 * Responsibilities:
 * - Create a single preview marker at a given location
 * - Ensure only one preview marker exists at a time
 * - Remove the preview marker when no longer needed
 */
@Injectable({ providedIn: 'root' })
export class PreviewMarkerService {
  /** Reference to the currently active preview marker. */
  private previewMarker: mapboxgl.Marker | null = null;

  constructor() { }

  /**
   * Creates and displays a preview marker at the specified coordinates.
   *
   * Behavior:
   * - Clears any existing preview marker
   * - Creates a new marker and adds it to the map
   *
   * @param map Mapbox map instance
   * @param lng Longitude of the marker
   * @param lat Latitude of the marker
   */
  set(map: mapboxgl.Map, lng: number, lat: number): void {
    this.clear();

    this.previewMarker = new mapboxgl.Marker()
      .setLngLat([lng, lat])
      .addTo(map);

    // map.jumpTo({ center: [lng, lat] }); // Optional camera movement
  }

  /**
   * Removes the current preview marker from the map.
   */
  clear(): void {
    this.previewMarker?.remove();
    this.previewMarker = null;
  }
}

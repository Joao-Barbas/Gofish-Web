import { Injectable } from '@angular/core';
import { PinHoverPreviewService } from '@gofish/features/map/services/pin-hover-preview.service';
import { ViewportPinDTO } from '@gofish/shared/dtos/pin.dto';

/**
 * Service responsible for managing the lifecycle of map markers
 * associated with viewport pins.
 *
 * Responsibilities:
 * - Keep a registry of currently rendered markers
 * - Remove markers that are no longer visible in the viewport
 * - Update marker positions when pins change
 * - Create and register new markers when needed
 */
@Injectable({ providedIn: 'root' })
export class MarkerRegistryService {
  /** Registry of markers indexed by pin identifier. */
  private markers = new Map<number, mapboxgl.Marker>();

  /**
   * Synchronizes the marker registry with the provided viewport pins.
   *
   * Behavior:
   * - Removes markers for pins that are no longer visible
   * - Updates position of existing markers
   * - Creates and adds new markers for newly visible pins
   *
   * @param map Mapbox map instance
   * @param pins Pins currently visible in the viewport
   * @param createMarker Factory function used to create a marker for a pin
   */
  loadPins(
    map: mapboxgl.Map,
    pins: ViewportPinDTO[],
    createMarker: (pin: ViewportPinDTO) => mapboxgl.Marker
  ): void {
    const visibleIds = new Set(pins.map((p) => p.id));

    for (const [id, marker] of this.markers) {
      if (!visibleIds.has(id)) {
        marker.remove();
        this.markers.delete(id);
      }
    }

    for (const pin of pins) {
      const existing = this.markers.get(pin.id);
      const lngLat: [number, number] = [pin.longitude, pin.latitude];

      if (existing) {
        existing.setLngLat(lngLat);
        continue;
      }

      const marker = createMarker(pin);
      marker.setLngLat(lngLat);
      marker.addTo(map);

      this.markers.set(pin.id, marker);
    }
  }

  /**
   * Removes all registered markers from the map and clears the registry.
   */
  clear(): void {
    for (const marker of this.markers.values()) marker.remove();
    this.markers.clear();
  }
}

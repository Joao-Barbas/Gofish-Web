import { Injectable } from '@angular/core';
import { PinHoverPreviewService } from '@gofish/features/map/services/pin-hover-preview.service';
import { ViewportPinDTO } from '@gofish/shared/dtos/pin.dto';



@Injectable({ providedIn: 'root' })
export class MarkerRegistryService {
  private markers = new Map<number, mapboxgl.Marker>();

  constructor(private pinHoverPreviewService: PinHoverPreviewService) { }

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
      this.pinHoverPreviewService.attach(map, marker, pin);

      this.markers.set(pin.id, marker);
    }
  }


  clear(): void {
    for (const marker of this.markers.values()) marker.remove();
    this.markers.clear();
  }
}

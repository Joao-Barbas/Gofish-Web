import { Injectable } from '@angular/core';
import mapboxgl from 'mapbox-gl';
import { PinDto, ViewportPinDTO } from '@gofish/shared/dtos/pin.dto';
import { PinKind } from '@gofish/shared/models/pin.model';

/**
 * Service responsible for handling hover preview popups for pins on the map.
 *
 * Responsibilities:
 * - Display a lightweight popup when hovering a pin
 * - Prevent hover updates when popup is locked
 * - Clear or close the popup when needed
 * - Generate HTML content for the hover preview
 */
@Injectable({ providedIn: 'root' })
export class PinHoverPreviewService {

  /** Mapbox popup instance used for hover previews. */
  private popup = new mapboxgl.Popup({
    closeButton: false,
    offset: 12,
    maxWidth: '300px',
  });

  /**
   * Displays the hover preview popup for a given pin.
   *
   * @param map Mapbox map instance
   * @param pin Pin to display in the hover preview
   */
  public showHover(map: mapboxgl.Map, pin: PinDto): void {

    this.popup
      .setLngLat([pin.geolocation!.longitude, pin.geolocation!.latitude])
      .setHTML(this.buildHtmlEnter(pin))
      .addTo(map);
  }

  /**
   * Clears the hover popup if it is not locked.
   */
  public clear(): void {
    this.popup.remove();
  }

  /**
   * Forces the popup to close and unlocks hover behavior.
   */
  public closePopup(): void {
    this.popup.remove();
  }

  /**
   * Builds the HTML content displayed inside the hover popup.
   *
   * @param pin Pin used to populate the preview content
   * @returns HTML string representing the popup content
   */
  private buildHtmlEnter(pin: PinDto): string {
    const typeClass = `pin-card--${pin.kind}`;
    const title = this.getFriendlyTitle(pin.kind);

    return `
      <div class="pin-card ${typeClass}">
        <div class="pin-card__content">
          <h3 class="pin-card__title">${title}</h3>
          <div class="pin-card__coords">
            Geolocation: ${pin.geolocation?.latitude.toFixed(5)}, ${pin.geolocation?.longitude.toFixed(5)}
          </div>
        </div>
      </div>
    `;
  }

  /**
   * Maps a pin kind to a user-friendly display title.
   *
   * @param kind Pin kind enum value
   * @returns Human-readable title for the pin
   */
  private getFriendlyTitle(kind: PinKind): string {
    switch (kind) {
      case PinKind.CATCH: return 'Catch Pin';
      case PinKind.INFORMATION: return 'Info Pin';
      case PinKind.WARNING: return 'Warn Pin';
      default: return 'Pin';
    }
  }
}

import { Injectable } from '@angular/core';
import mapboxgl from 'mapbox-gl';
import { ViewportPinDTO } from '@gofish/shared/dtos/pin.dto';
import { PinKind } from '@gofish/shared/models/pin.model';

@Injectable({ providedIn: 'root' })
export class PinHoverPreviewService {
  private isLocked = false;

  private popup = new mapboxgl.Popup({
    closeButton: false,
    offset: 12,
    maxWidth: '300px',
  });

  public showHover(map: mapboxgl.Map, pin: ViewportPinDTO): void {
    if (this.isLocked) return;

    this.popup
      .setLngLat([pin.longitude, pin.latitude])
      .setHTML(this.buildHtmlEnter(pin))
      .addTo(map);
  }

  public clear(): void {
    if (this.isLocked) return;
    this.popup.remove();
  }

  public closePopup(): void {
    this.isLocked = false;
    this.popup.remove();
  }

  private buildHtmlEnter(pin: ViewportPinDTO): string {
    const typeClass = `pin-card--${pin.kind}`;
    const title = this.getFriendlyTitle(pin.kind);

    return `
      <div class="pin-card ${typeClass}">
        <div class="pin-card__content">
          <h3 class="pin-card__title">${title}</h3>
          <div class="pin-card__coords">
            Geolocation: ${pin.latitude.toFixed(5)}, ${pin.longitude.toFixed(5)}
          </div>
        </div>
      </div>
    `;
  }

  private getFriendlyTitle(kind: PinKind): string {
    switch (kind) {
      case PinKind.CATCH: return 'Catch Pin';
      case PinKind.INFORMATION: return 'Info Pin';
      case PinKind.WARNING: return 'Warn Pin';
      default: return 'Pin';
    }
  }
}

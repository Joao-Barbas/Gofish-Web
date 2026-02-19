import { Injectable } from '@angular/core';
import mapboxgl from 'mapbox-gl';
import { ViewportPinDTO } from '@gofish/shared/dtos/pin.dto';
import { PinType } from '@gofish/shared/models/pin.model';

@Injectable({ providedIn: 'root' })
export class PinHoverPreviewService {
  private isLocked = false;

  private popup = new mapboxgl.Popup({
    closeButton: false,
    closeOnClick: false,
    offset: 12,
    maxWidth: '300px',
  });


  public showHover(map: mapboxgl.Map, pin: ViewportPinDTO): void {
    if (this.isLocked) return;

    this.popup
      .setLngLat([pin.longitude, pin.latitude])
      .setHTML(this.buildHtmlEnter(pin))
      .addClassName('popup-is-tip')
      .removeClassName('popup-is-card')
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

  public showCard(map: mapboxgl.Map, pin: ViewportPinDTO): void {
    this.isLocked = false;
    this.popup
      .setLngLat([pin.longitude, pin.latitude])
      .setHTML(this.buildHtmlCard(pin))
      .removeClassName('popup-is-tip')
      .addClassName('popup-is-card')
      .addTo(map);
    this.isLocked = true;
  }

  private buildHtmlCard(pin: ViewportPinDTO): string {
    const typeClass = `pin-card--${pin.pinType}`;
    const title = this.getFriendlyTitle(pin.pinType);
    return `
    <div class="pin-card pin-card--expanded ${typeClass}">
      <div class="pin-card__content">
        <h3 class="pin-card__title">${title}</h3>
        <div class="pin-card__coords">
          Coordenadas: ${pin.latitude.toFixed(5)}, ${pin.longitude.toFixed(5)}
        </div>
        <!-- expandes aqui com mais detalhes do pin -->
      </div>
    </div>
  `;
  }

  private buildHtmlEnter(pin: ViewportPinDTO): string {
    const typeClass = `pin-card--${pin.pinType}`;
    const title = this.getFriendlyTitle(pin.pinType);

    return `
      <div class="pin-card ${typeClass}">
        <div class="pin-card__content">
          <h3 class="pin-card__title">${title}</h3>
          <div class="pin-card__coords">
            Coordenates: ${pin.latitude.toFixed(5)}, ${pin.longitude.toFixed(5)}
          </div>
        </div>
      </div>
    `;
  }

  private getFriendlyTitle(type: PinType): string {
    switch (type) {
      case PinType.CATCH: return 'Pin de Caça';
      case PinType.INFORMATION: return 'Pin Informação';
      case PinType.WARNING: return 'Pin de Aviso';
      default: return 'Pin';
    }
  }
}

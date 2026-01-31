import { Injectable } from '@angular/core';
import mapboxgl from 'mapbox-gl';
import { PinMarkerDTO } from '@gofish/shared/dtos/pin-marker.dto';
import { PinType } from '@gofish/shared/models/pin-types';

type Handlers = {
  enter: () => void;
  leave: () => void;
  click?: () => void;
};

@Injectable({ providedIn: 'root' })
export class PinHoverPreviewService {


  private popup = new mapboxgl.Popup({
    closeButton: false,
    closeOnClick: false,
    offset: 12,
    maxWidth: '260px',
  });


  private handlersByEl = new WeakMap<HTMLElement, Handlers>();

  attach(map: mapboxgl.Map, marker: mapboxgl.Marker, pin: PinMarkerDTO): void {
    const el = marker.getElement();
    el.style.cursor = 'pointer';

    if (this.handlersByEl.has(el)) return;

    const enter = () => {
      this.popup
        .setLngLat([pin.longitude, pin.latitude])
        .setHTML(this.buildHtml(pin))
        .addTo(map);
    };

    const leave = () => {
      this.popup.remove();
    };

    el.addEventListener('mouseenter', enter);
    el.addEventListener('mouseleave', leave);


    this.handlersByEl.set(el, { enter, leave /*, click*/ });
  }

  detach(marker: mapboxgl.Marker): void {
    const el = marker.getElement();
    const handlers = this.handlersByEl.get(el);
    if (!handlers) return;

    el.removeEventListener('mouseenter', handlers.enter);
    el.removeEventListener('mouseleave', handlers.leave);
    if (handlers.click) el.removeEventListener('click', handlers.click);

    this.handlersByEl.delete(el);
  }

  clear(): void {
    this.popup.remove();

  }

  private buildHtml(pin: PinMarkerDTO): string {
    switch (pin.pinType) {
      case PinType.CATCHING:
        return this.buildCatchingPreview(pin);
      case PinType.INFORMATION:
        return this.buildInfoPreview(pin);
      case PinType.WARNING:
        return this.buildWarningPreview(pin);

      default:
        return this.buildDefaultPreview(pin);
    }
  }

  private buildCatchingPreview(pin: PinMarkerDTO): string {
    return `
    <div class="pin-preview pin-preview--catching">
      <div class="pin-preview__title">Catching spot</div>
      <div class="pin-preview__coords">
        ${pin.latitude.toFixed(5)}, ${pin.longitude.toFixed(5)}
      </div>
    </div>
  `;
  }
  private buildInfoPreview(pin: PinMarkerDTO): string {
    return `
    <div class="pin-preview pin-preview--info">
      <div class="pin-preview__title">Information</div>
      <div class="pin-preview__coords">
        ${pin.latitude.toFixed(5)}, ${pin.longitude.toFixed(5)}
      </div>
    </div>
  `;
  }

  private buildWarningPreview(pin: PinMarkerDTO): string {
    return `
    <div class="pin-preview pin-preview--warning">
      <div class="pin-preview__title">Warning</div>
      <div class="pin-preview__coords">
        ${pin.latitude.toFixed(5)}, ${pin.longitude.toFixed(5)}
      </div>
    </div>
  `;
  }

  private buildDefaultPreview(pin: PinMarkerDTO): string {
    return `
    <div class="pin-preview">
      <div class="pin-preview__title">${pin.pinType}</div>
      <div class="pin-preview__coords">
        ${pin.latitude.toFixed(5)}, ${pin.longitude.toFixed(5)}
      </div>
    </div>
  `;
  }




}

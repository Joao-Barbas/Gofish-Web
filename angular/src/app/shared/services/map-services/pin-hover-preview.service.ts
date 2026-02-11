import { Injectable } from '@angular/core';
import mapboxgl from 'mapbox-gl';
import { PinType } from '@gofish/shared/models/pin-types';
import { NearbyPinDTO } from '@gofish/shared/dtos/get-marker.dto';

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

  attach(map: mapboxgl.Map, marker: mapboxgl.Marker, pin: NearbyPinDTO): void {
    const el = marker.getElement();
    el.style.cursor = 'pointer';

    if (this.handlersByEl.has(el)) return;

    const enter = () => {
      this.popup.remove();
      this.popup
        .setLngLat([pin.longitude, pin.latitude])
        .setHTML(`<div class="pin-hover-tip">${this.getFriendlyTitle(pin.pinType)}</div>`)
        .addClassName('popup-is-tip')
        .removeClassName('popup-is-card')
        .addTo(map);
    };

    const leave = () => {
      this.popup.remove();
      //console.log("LEAVE FUNCIONA");
    };

    const click = () => {
      this.popup.remove();
      this.popup
        .setLngLat([pin.longitude, pin.latitude])
        .setHTML(this.buildHtml(pin)) // imagem
        .addClassName('popup-is-card')
        .removeClassName('popup-is-tip')
        .addTo(map);
    };

    el.addEventListener('mouseenter', enter);
    el.addEventListener('mouseleave', leave);
    el.addEventListener('click', click);

    this.handlersByEl.set(el, { enter, leave, click });
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


  private buildHtml(pin: NearbyPinDTO): string {
    const imgUrl = pin.imageUrl;
    console.log(imgUrl);
    const typeClass = `pin-card--${pin.pinType}`;
    const title = this.getFriendlyTitle(pin.pinType);

    return `
    <div class="pin-card ${typeClass}">
      <div class="pin-card__image-wrapper">
        <img src="${imgUrl}" class="pin-card__img" alt="Spot">
      </div>
      <div class="pin-card__content">
        <h3 class="pin-card__title">${title}</h3>
        <h2 class="pin-card__description">${pin.description}</h2>
        <div class="pin-card__coords">
          ${pin.latitude.toFixed(5)}, ${pin.longitude.toFixed(5)}
        </div>
      </div>
    </div>
  `;
  }

  private getFriendlyTitle(type: PinType): string {
    switch (type) {
      case PinType.CATCHING: return 'Zona de Caça';
      case PinType.INFORMATION: return 'Informação';
      case PinType.WARNING: return 'Aviso';
      default: return 'Spot Details';
    }
  }



  /*
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
*/



}

import { Injectable } from '@angular/core';
import mapboxgl from 'mapbox-gl';
import { PinType } from '@gofish/shared/models/pin-types';
import { NearbyPinDTO } from '@gofish/shared/dtos/get-marker.dto';

type Handlers = {
  enter: () => void;
  leave: () => void;
  click?: (e: MouseEvent) => void;
};

@Injectable({ providedIn: 'root' })
export class PinHoverPreviewService {
  private isLocked = false;
  private handlersByEl = new WeakMap<HTMLElement, Handlers>();

  private popup = new mapboxgl.Popup({
    closeButton: false,
    closeOnClick: false,
    offset: 12,
    maxWidth: '300px',
  });

  attach(map: mapboxgl.Map, marker: mapboxgl.Marker, pin: NearbyPinDTO): void {
    const el = marker.getElement();
    el.style.cursor = 'pointer';

    if (this.handlersByEl.has(el)) return;

    //buildHtmlEnter
    const enter = () => {
      if (this.isLocked) return;

      this.popup.remove();
      this.popup
        .setLngLat([pin.longitude, pin.latitude])
        .setHTML(this.buildHtmlEnter(pin))
        .addClassName('popup-is-tip')
        .removeClassName('popup-is-card')
        .addTo(map);
    };

    const leave = () => {
      if (this.isLocked) return;

      this.popup.remove();
      //console.log("LEAVE FUNCIONA");
    };

    // Não está em uso
    const click = (e: MouseEvent) => {
      e.stopPropagation(); // para impedir que feche o popup imediatamente após abrir

      this.isLocked = true;

      this.popup.remove();
      this.popup
        .setLngLat([pin.longitude, pin.latitude])
        .setHTML(this.buildHtmlClick(pin))
        .addClassName('popup-is-card')
        .removeClassName('popup-is-tip')
        .addTo(map);
    };

    el.addEventListener('mouseenter', enter);
    el.addEventListener('mouseleave', leave);
    //el.addEventListener('click', click);

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

  public closePopup(): void {
    this.isLocked = false;
    this.popup.remove();

    if ((window as any).closePinPopup) {
      delete (window as any).closePinPopup;
    }
  }
  private buildHtmlEnter(pin: NearbyPinDTO): string {
    const typeClass = `pin-card--${pin.pinType}`;
    const title = this.getFriendlyTitle(pin.pinType);

    return `
    <div class="pin-card ${typeClass}">
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
      case PinType.CATCHING: return 'Pin de Caça';
      case PinType.INFORMATION: return 'Pin Informação';
      case PinType.WARNING: return 'Pin de Aviso';
      default: return 'DEFAULT';
    }
  }


  // Não está em uso
  private buildHtmlClick(pin: NearbyPinDTO): string {
    const imgUrl = pin.imageUrl || 'assets/images/default-preview.png';
    const username = /*pin.userName ||*/ 'Anonymous';
    const timeAgo = '9 Hours'; // TODO: Implementar lógica de cálculo de tempo
    const score = /*pin.score ||*/ 0;
    const commentsCount = /* pin.commentsCount ||*/ 0;

    // Garantir que a função de fechar está disponível globalmente para o onclick
    (window as any).closePinPopup = () => this.closePopup();

    return `
    <article class="gf-card pin-preview-click">
      <header class="horizontal-flow align-center-center" style="justify-content: space-between; width: 100%;">

        <div class="horizontal-flow gap-8 align-center-center">
          <div class="pin-preview-click__avatar" style="background-color: var(--dark-text-muted); border-radius: 50%; width: 32px; height: 32px;"></div>

          <div class="horizontal-flow gap-4 align-center-center">
            <span class="dark-text text-medium font-main" style="font-size: 14px;">${username}</span>
            <span class="dark-text-muted" style="font-size: 12px;">•</span>
            <span class="dark-text-muted font-main" style="font-size: 12px;">${timeAgo}</span>
          </div>
        </div>

        <button class="gf-btn-icon" onclick="window.closePinPopup()" style="background: none; border: none; color: var(--dark-text-muted); cursor: pointer;">
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round">
            <path d="M18 6L6 18M6 6l12 12"/>
          </svg>
        </button>
      </header>

      <div class="pin-preview-click__image-wrapper">
        <img src="${imgUrl}" class="pin-preview-click__img" alt="Preview">
      </div>

      <footer class="horizontal-flow align-center-center" style="justify-content: space-between; width: 100%;">
        <div class="horizontal-flow gap-8">
          <div class="pin-preview-click__badge">
             <span class="dark-text text-medium" style="font-size: 12px;">👍 ${score}</span>
          </div>
          <div class="pin-preview-click__badge">
             <span class="dark-text text-medium" style="font-size: 12px;">💬 ${commentsCount}</span>
          </div>
        </div>

        <button class="gf-btn-icon" style="background: none; border: none; color: var(--dark-text-muted);">
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
            <path d="M15 3h6v6M10 14L21 3M18 13v6a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h6"/>
          </svg>
        </button>
      </footer>
    </article>
  `;
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

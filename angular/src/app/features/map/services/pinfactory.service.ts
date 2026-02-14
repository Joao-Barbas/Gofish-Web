import { Injectable } from '@angular/core';
import { PinType } from '../../../shared/models/pin-types';
import mapboxgl from 'mapbox-gl';
import { PinIconService } from './pin-icon.service';
import { ViewportPinDTO } from '@gofish/shared/dtos/pin.dto';



@Injectable({
  providedIn: 'root'
})

export class PinfactoryService {

  constructor(private pinIcon: PinIconService) { }

  createPin(pin: ViewportPinDTO): mapboxgl.Marker {
    const el = document.createElement('div');
    el.innerHTML = this.pinIcon.getSvgIcon(pin.pinType);
    el.style.cursor = 'pointer';

    el.style.width = '32px';
    el.style.height = '32px';

    return new mapboxgl.Marker({ element: el })
      .setLngLat([pin.longitude, pin.latitude]);
  }

  createPreviewPin(lng: number, lat: number): mapboxgl.Marker {
    const el = document.createElement('div');
    el.innerHTML = this.pinIcon.getSvgIcon(PinType.DEFAULT);
    el.style.width = '32px';
    el.style.height = '32px';
    el.style.opacity = '0.7';

    return new mapboxgl.Marker({ element: el })
      .setLngLat([lng, lat]);
  }
}

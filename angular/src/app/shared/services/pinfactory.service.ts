import { Injectable } from '@angular/core';
import { PinType } from '../models/pin-types';
import { PinStyleService } from './pin-style.service';
import { PinMarkerDTO } from '../dtos/pin-marker.dto';
import mapboxgl from 'mapbox-gl';

@Injectable({
  providedIn: 'root'
})

export class PinfactoryService {

  constructor(private pinStyle: PinStyleService) { }

  createPin(pin: PinMarkerDTO): mapboxgl.Marker {
    return new mapboxgl.Marker({
      color: this.pinStyle.getColor(pin.pinType),
    }).setLngLat([pin.longitude, pin.latitude]);
  }

  createPreviewPin(longitude: number, latitude: number): mapboxgl.Marker {
    return new mapboxgl.Marker().setLngLat([longitude, latitude]);
  }
}

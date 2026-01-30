import { Injectable } from '@angular/core';
import { Pin } from '../models/pin.model';
import { PinType } from '../models/pin-types';

@Injectable({
  providedIn: 'root'
})
export class PinStyleService {

  constructor() { }

  getColor(pinType: PinType): string {
    switch (pinType) {
      case PinType.CATCHING:
        return '#2ecc71'; // Green
      case PinType.INFORMATION:
        return '#3498db'; // Blue
      case PinType.WARNING:
        return '#e74c3c'; // Red
      default:
        return '#95a5a6'; // Grey
    }
  }

  getIcon(pinType: PinType): string {
    switch (pinType) {
      case PinType.CATCHING:
        return '🎣';
      case PinType.INFORMATION:
        return 'ℹ️';
      case PinType.WARNING:
        return '⚠️';
      default:
        return '📍';
    }
  }

  getLabel(pinType: PinType): string {
    switch (pinType) {
      case PinType.CATCHING:
        return 'Catching';
      case PinType.INFORMATION:
        return 'Info';
      case PinType.WARNING:
        return 'Warning';
      default:
        return 'Pin';
    }
  }

}

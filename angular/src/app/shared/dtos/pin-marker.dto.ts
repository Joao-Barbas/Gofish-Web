import { PinType } from "../models/pin-types";
import { Pin } from "../models/pin.model";

// Serve para renderizar os pins no mapa
export interface PinMarkerDTO {
  id: number;
  latitude: number;
  longitude: number;
  pinType: PinType;
}

export interface GetPinsInViewportResDTO {
  success: boolean;
  pins: PinMarkerDTO[];
}

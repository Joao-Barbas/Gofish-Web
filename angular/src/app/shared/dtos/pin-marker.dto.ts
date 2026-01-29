// Serve para renderizar os pins no mapa
export interface PinMarkerDTO {
  id: number;
  latitude: number;
  longitude: number;
  pinType: number;
}

export interface GetPinsInViewportResDTO {
  success: boolean;
  pins: PinMarkerDTO[];
}

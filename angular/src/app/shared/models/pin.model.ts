export enum PinType {
  CATCH = 0,
  INFORMATION = 1,
  WARNING = 2,
  DEFAULT = 999
}

export interface Pin {
  id: number;
  latitude: number;
  longitude: number;
  description: string;
  pinType: number;
  createdAt: string;
}

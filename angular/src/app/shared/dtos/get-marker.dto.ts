export interface NearbyPinDTO {
  id: number;
  latitude: number;
  longitude: number;
  createdAt: string;
  pinType: number;
  imageUrl: string | null;
  description: string;
}

export interface GetNearbyPinsResDTO {
  success: boolean;
  pins: NearbyPinDTO[];
  errorMessage?: string;
}

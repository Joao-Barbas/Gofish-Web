//Create CatchPin
export interface CreateCatchPinReqDTO {
  latitude: number;
  longitude: number;
  description: string;
  speciesType: number;
  hookSize: number;
  baitType: number;
}
export interface CreateCatchPinResDTO {
  success: boolean;
  id?: number;
  errorMessage?: string;
}

//Create InfoPin
export interface CreateInfoPinReqDTO {

}
export interface CreateInfoPinResDTO {
  success: boolean;
  id: number;
}

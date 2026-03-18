import { Observable } from 'rxjs';
import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { CreateInfoPinReqDTO, CreateWarnPinReqDTO, ViewportPinsResDTO, CreatePinResDTO, GetPinsReqDTO, PinDataResDTO, GetPinsResDTO } from '@gofish/shared/dtos/pin.dto';
import { EnumDTO } from '@gofish/shared/dtos/enum.dto';
import { Api } from '@gofish/shared/constants';

@Injectable({
  providedIn: 'root'
})
export class PinService {
  constructor(private http: HttpClient) { }

  createCatchPin(formData: FormData): Observable<CreatePinResDTO> {
    return this.http.post<CreatePinResDTO>(Api.Pin.action('CreateCatchPin'), formData);
  }

  createInfoPin(dto: CreateInfoPinReqDTO): Observable<CreatePinResDTO> {
    return this.http.post<CreatePinResDTO>(Api.Pin.action('CreateInfoPin'), dto);
  }

  createWarnPin(dto: CreateWarnPinReqDTO): Observable<CreatePinResDTO> {
    return this.http.post<CreatePinResDTO>(Api.Pin.action('CreateWarnPin'), dto);
  }

  deletePin(id: number): Observable<void>{
    return this.http.delete<void>(Api.Pin.action(`DeletePin/${id}`));
  }

  getInViewport(minLat: number, minLng: number, maxLat: number, maxLng: number): Observable<ViewportPinsResDTO> {
    return this.http.get<ViewportPinsResDTO>(Api.Pin.action('GetInViewport'), {
      params: { minLat, minLng, maxLat, maxLng }
    });
  }

  getPinPreview(getPin: GetPinsReqDTO): Observable<GetPinsResDTO> {
    return this.http.post<GetPinsResDTO>(Api.Pin.action('GetPins'), getPin);
  }

  enumeratePinType = () => this.http.get<EnumDTO[]>(Api.Enums.action('PinKind'));
  enumerateBaitType = () => this.http.get<EnumDTO[]>(Api.Enums.action('Bait'));
  enumerateSeaBedType = () => this.http.get<EnumDTO[]>(Api.Enums.action('Seabed'));
  enumerateWarnType = () => this.http.get<EnumDTO[]>(Api.Enums.action('WarningKind'));
  enumerateSpeciesType = () => this.http.get<EnumDTO[]>(Api.Enums.action('Species'));
  enumerateVisibilityType = () => this.http.get<EnumDTO[]>(Api.Enums.action('VisibilityLevel'));
  enumerateAccessDifficultyType = () => this.http.get<EnumDTO[]>(Api.Enums.action('AccessDifficulty'));

}

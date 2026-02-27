import { Observable } from 'rxjs';
import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { CreateInfoPinReqDTO, CreateWarnPinReqDTO, ViewportPinsResDTO, PinPreviewResDTO, CreatePinResDTO, ApiResponse } from '@gofish/shared/dtos/pin.dto';
import { EnumDTO} from '@gofish/shared/dtos/enum.dto';
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

  getInViewport(minLat: number, minLng: number, maxLat: number, maxLng: number) {
    return this.http.get<ApiResponse<ViewportPinsResDTO>>(Api.Pin.action('GetInViewport'), {
      params: { minLat, minLng, maxLat, maxLng }
    });
  }

  getPinPreview(pinId: number) {
    return this.http.get<PinPreviewResDTO>(`${Api.Pin.action('GetPinPreview')}/${pinId}`);
  }

  /* enumeratePinType = () => this.http.get<GetEnumeratorResDTO>(Api.Pin.action('EnumeratePinType'));
  enumerateBaitType = () => this.http.get<GetEnumeratorResDTO>(Api.Pin.action('EnumerateBaitType'));
  enumerateSeaBedType = () => this.http.get<GetEnumeratorResDTO>(Api.Pin.action('EnumerateSeaBedType'));
  enumerateWarnType = () => this.http.get<GetEnumeratorResDTO>(Api.Pin.action('EnumerateWarningType'));
  enumerateSpeciesType = () => this.http.get<GetEnumeratorResDTO>(Api.Pin.action('EnumerateSpeciesType'));
  enumerateVisibilityType = () => this.http.get<GetEnumeratorResDTO>(Api.Pin.action('EnumerateVisibilityType'));
  enumerateAccessDifficultyType = () => this.http.get<GetEnumeratorResDTO>(Api.Pin.action('EnumerateAccessDifficultyType'));
 */
  enumeratePinType = () => this.http.get<EnumDTO[]>(Api.Enums.action('PinKind'));
  enumerateBaitType = () => this.http.get<EnumDTO[]>(Api.Enums.action('Bait'));
  enumerateSeaBedType = () => this.http.get<EnumDTO[]>(Api.Enums.action('Seabed'));
  enumerateWarnType = () => this.http.get<EnumDTO[]>(Api.Enums.action('WarningKind'));
  enumerateSpeciesType = () => this.http.get<EnumDTO[]>(Api.Enums.action('Species'));
  enumerateVisibilityType = () => this.http.get<EnumDTO[]>(Api.Enums.action('VisibilityLevel'));
  enumerateAccessDifficultyType = () => this.http.get<EnumDTO[]>(Api.Enums.action('AccessDifficulty'));


}

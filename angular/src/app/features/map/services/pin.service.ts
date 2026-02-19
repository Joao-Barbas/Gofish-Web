import { environment } from 'environments/environment';
import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { CreateInfoPinReqDTO, CreateWarnPinReqDTO, ViewportPinsResDTO, PinPreviewResDTO, CreatePinResDTO } from '@gofish/shared/dtos/pin.dto';
import { GetEnumeratorResDTO } from '@gofish/shared/dtos/enum.dto';



@Injectable({
  providedIn: 'root'
})
// Tem tudo de HTTP relacionado com Pins
export class PinService {

  private baseUrl = 'Pin';

  constructor(private http: HttpClient) { }


  // Create
  createCatchPin(formData: FormData): Observable<CreatePinResDTO> {
    return this.http.post<CreatePinResDTO>(`${environment.baseApiUrl}/${this.baseUrl}/CreateCatchPin`, formData);
  }

  createInfoPin(dto: CreateInfoPinReqDTO): Observable<CreatePinResDTO> {
    return this.http.post<CreatePinResDTO>(`${environment.baseApiUrl}/${this.baseUrl}/CreateInfoPin`, dto);
  }

  createWarnPin(dto: CreateWarnPinReqDTO): Observable<CreatePinResDTO> {
    return this.http.post<CreatePinResDTO>(`${environment.baseApiUrl}/${this.baseUrl}/CreateWarnPin`, dto);
  }

  getInViewport(minLat: number, minLng: number, maxLat: number, maxLng: number) {
    return this.http.get<ViewportPinsResDTO>(`${environment.baseApiUrl}/${this.baseUrl}/GetInViewport`,
      { params: { minLat, minLng, maxLat, maxLng } });
  }

  getPinPreview(pinId: number) {
    return this.http.get<PinPreviewResDTO>(`${environment.baseApiUrl}/${this.baseUrl}/GetPinPreview/${pinId}`);
  }

  enumeratePinType = () => this.http.get<GetEnumeratorResDTO>(`${environment.baseApiUrl}/${this.baseUrl}/EnumeratePinType`);
  enumerateBaitType = () => this.http.get<GetEnumeratorResDTO>(`${environment.baseApiUrl}/${this.baseUrl}/EnumerateBaitType`);
  enumerateSeaBedType = () => this.http.get<GetEnumeratorResDTO>(`${environment.baseApiUrl}/${this.baseUrl}/EnumerateSeaBedType`);
  enumerateWarnType = () => this.http.get<GetEnumeratorResDTO>(`${environment.baseApiUrl}/${this.baseUrl}/EnumerateWarningType`);
  enumerateSpeciesType = () => this.http.get<GetEnumeratorResDTO>(`${environment.baseApiUrl}/${this.baseUrl}/EnumerateSpeciesType`);
  enumerateVisibilityType = () => this.http.get<GetEnumeratorResDTO>(`${environment.baseApiUrl}/${this.baseUrl}/EnumerateVisibilityType`);
  enumerateAccessDifficultyType = () => this.http.get<GetEnumeratorResDTO>(`${environment.baseApiUrl}/${this.baseUrl}/EnumerateAccessDifficultyType`);

}

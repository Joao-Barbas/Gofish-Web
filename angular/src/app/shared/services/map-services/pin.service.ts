import { environment } from 'environments/environment';
import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';

import { CreateCatchPinReqDTO, CreateInfoPinReqDTO, CreatePinResDTO, CreateWarnPinReqDTO } from '@gofish/shared/dtos/create-pin.dto';
import { Form } from '@angular/forms';
import { GetEnumeratorResDTO } from '@gofish/shared/dtos/enum.dto';
import { GetNearbyPinsResDTO } from '@gofish/shared/dtos/get-marker.dto';


@Injectable({
  providedIn: 'root'
})
// Tem tudo de HTTP relacionado com Pins
export class PinService {

  private baseUrl = 'Pin';

  constructor(private http: HttpClient) { }

  // Ainda nao esta a ser usado
  getAll(): Observable<any> {
    return this.http.get(`${this.baseUrl}/GetAll`);
  }

  getInViewport(minLat: number, minLng: number, maxLat: number, maxLng: number) {
    return this.http.get<GetNearbyPinsResDTO>(`${environment.baseApiUrl}/${this.baseUrl}/GetInViewport`,
      { params: { minLat, minLng, maxLat, maxLng } });
  }

  // Create
  createCatchPin(formData: FormData): Observable<CreatePinResDTO> {
    return this.http.post<CreatePinResDTO>(`${environment.baseApiUrl}/${this.baseUrl}/CreateCatchPin`, formData);
  }

  createInfoPin(dto: CreateInfoPinReqDTO): Observable<CreatePinResDTO> {
    return this.http.post<CreatePinResDTO>(`${environment.baseApiUrl}/${this.baseUrl}/CreateInfoPin`, dto);
  }

  createWarningPin(dto: CreateWarnPinReqDTO): Observable<CreateWarnPinReqDTO> {
    return this.http.post<CreateWarnPinReqDTO>(`${environment.baseApiUrl}/${this.baseUrl}/CreateWarnPin`, dto);
  }

  enumeratePinType = () => this.http.get<GetEnumeratorResDTO>(`${environment.baseApiUrl}/${this.baseUrl}/EnumeratePinType`);
  enumerateBaitType = () => this.http.get<GetEnumeratorResDTO>(`${environment.baseApiUrl}/${this.baseUrl}/EnumerateBaitType`);
  enumerateSeaBedType = () => this.http.get<GetEnumeratorResDTO>(`${environment.baseApiUrl}/${this.baseUrl}/EnumerateSeaBedType`);
  enumerateWarningType = () => this.http.get<GetEnumeratorResDTO>(`${environment.baseApiUrl}/${this.baseUrl}/EnumerateWarningType`);
  enumerateSpeciesType = () => this.http.get<GetEnumeratorResDTO>(`${environment.baseApiUrl}/${this.baseUrl}/EnumerateSpeciesType`);
}

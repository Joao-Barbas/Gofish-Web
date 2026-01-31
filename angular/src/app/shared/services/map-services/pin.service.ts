import { environment } from 'environments/environment';
import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { GetPinsInViewportResDTO } from '@gofish/shared/dtos/pin-marker.dto';
import { CreateCatchPinReqDTO, CreateInfoPinReqDTO, CreatePinResDTO, CreateWarnPinReqDTO } from '@gofish/shared/dtos/create-pin.dto';


@Injectable({
  providedIn: 'root'
})
// Tem tudo de HTTP relacionado com Pins
export class PinService {

  private baseUrl = 'Pin';

  constructor(private http: HttpClient) {}

  // Ainda nao esta a ser usado
  getAll(): Observable<any> {
    return this.http.get(`${this.baseUrl}/GetAll`);
  }

  getInViewport(minLat: number, minLng: number, maxLat: number, maxLng: number) {
  return this.http.get<GetPinsInViewportResDTO>(`${environment.baseApiUrl}/${this.baseUrl}/GetInViewport`,
    { params: { minLat, minLng, maxLat, maxLng } });
  }

  // Create
  createCatchPin(dto: CreateCatchPinReqDTO): Observable<CreatePinResDTO> {
    return this.http.post<CreatePinResDTO>(`${environment.baseApiUrl}/${this.baseUrl}/CreateCatchPin`, dto);
  }

  createInfoPin(dto: CreateInfoPinReqDTO): Observable<CreatePinResDTO> {
    return this.http.post<CreatePinResDTO>(`${environment.baseApiUrl}/${this.baseUrl}/CreateInfoPin`, dto);
  }

  createWarningPin(dto: CreateWarnPinReqDTO): Observable<CreateWarnPinReqDTO> {
    return this.http.post<CreateWarnPinReqDTO>(`${environment.baseApiUrl}/${this.baseUrl}/CreateWarnPin`, dto);
  }


  }

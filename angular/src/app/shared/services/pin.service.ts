import { environment } from 'environments/environment';
import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { CreateCatchPinReqDTO, CreatePinResDTO} from '../dtos/create-pin.dto';
import { GetPinsInViewportResDTO } from '../dtos/pin-marker.dto';

@Injectable({
  providedIn: 'root'
})
export class PinService {

  private baseUrl = 'Pin';

  constructor(private http: HttpClient) {}

  getAll(): Observable<any> {
    return this.http.get(`${this.baseUrl}/GetAll`);
  }

  getInViewport(minLat: number, minLng: number, maxLat: number, maxLng: number) {
  return this.http.get<GetPinsInViewportResDTO>(`${environment.baseApiUrl}/${this.baseUrl}/GetInViewport`,
    { params: { minLat, minLng, maxLat, maxLng } });
  }

  createCatchPin(dto: CreateCatchPinReqDTO): Observable<CreatePinResDTO> {
    return this.http.post<CreatePinResDTO>(`${environment.baseApiUrl}/${this.baseUrl}/CreateCatchPin`, dto);
  }



}

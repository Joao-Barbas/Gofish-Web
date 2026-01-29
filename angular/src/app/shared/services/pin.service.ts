import { environment } from 'environments/environment';
import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { CreateCatchPinReqDTO, CreateCatchPinResDTO} from '../dtos/create-pin.dto';

@Injectable({
  providedIn: 'root'
})
export class PinService {

  private baseUrl = 'Pin';

  constructor(private http: HttpClient) {}

  getAll(): Observable<any> {
    return this.http.get(`${this.baseUrl}/GetAll`);
  }

  createCatchPin(dto: CreateCatchPinReqDTO): Observable<CreateCatchPinResDTO> {
    return this.http.post<CreateCatchPinResDTO>(`${environment.baseApiUrl}/${this.baseUrl}/CreateCatchPin`, dto);
  }
}

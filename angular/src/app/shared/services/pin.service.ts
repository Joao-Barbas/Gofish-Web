import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { CreateCatchingPinDTO } from '../models/create-catching-pin';

@Injectable({
  providedIn: 'root'
})
export class PinService {

  private baseUrl = 'https://localhost:7113/api/Pin';

  constructor(private http: HttpClient) {}

  getAll(): Observable<any> {
    return this.http.get(`${this.baseUrl}/GetAll`);
  }

  createCatchPin(dto: CreateCatchingPinDTO) {
  return this.http.post(`${this.baseUrl}/CreateCatchPin`, dto);
  }
}

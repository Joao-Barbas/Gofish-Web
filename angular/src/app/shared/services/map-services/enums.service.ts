import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable, map } from 'rxjs';
import { environment } from 'environments/environment';
import { PinEnumsResDTO } from '@gofish/shared/dtos/enums.dto';
import {  ApiResponse } from '@gofish/shared/dtos/api-response.dto';

@Injectable({
  providedIn: 'root'
})
export class EnumsService {
  private readonly baseUrl = 'Enums';

  constructor(private http: HttpClient) {}

  getPinEnums(): Observable<PinEnumsResDTO> {
    return this.http
      .get<ApiResponse<PinEnumsResDTO>>(
        `${environment.baseApiUrl}/Enums/GetPinEnums`
      )
      .pipe(
        map(res => {
          if (!res.success || !res.data) {
            throw res.errors ?? 'Failed to load pin enums';
          }
          return res.data;
        })
      );
  }
}

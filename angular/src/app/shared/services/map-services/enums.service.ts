import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { EnumResDto } from '@gofish/shared/dtos/enums.dto';
import { environment } from 'environments/environment';
import { Observable } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class EnumsService {
  private baseUrl = 'Enums';

  constructor(private http: HttpClient) { }

  // SeaBed
  getSeaBedTypes(): Observable<EnumResDto[]> {
    return this.http.get<EnumResDto[]>(`${environment.baseApiUrl}/${this.baseUrl}/GetSeaBedTypes`);
  }

  // Species
  getSpeciesTypes(): Observable<EnumResDto[]> {
    return this.http.get<EnumResDto[]>(`${environment.baseApiUrl}/${this.baseUrl}/GetSpeciesTypes`);
  }

  // Bait
  getBaitTypes(): Observable<EnumResDto[]> {
    return this.http.get<EnumResDto[]>(`${environment.baseApiUrl}/${this.baseUrl}/GetBaitTypes`);
  }

  // WarnType
  getWarnPinTypes(): Observable<EnumResDto[]> {
    return this.http.get<EnumResDto[]>(`${environment.baseApiUrl}/${this.baseUrl}/GetWarnPinTypes`);
  }


}

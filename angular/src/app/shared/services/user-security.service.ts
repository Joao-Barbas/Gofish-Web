import { Observable, tap } from 'rxjs';
import { HttpClient } from '@angular/common/http';
import { computed, inject, Injectable, signal } from '@angular/core';
import { Api } from '@gofish/shared/constants';
import { ChangePasswordReqDTO, ChangePasswordResDTO, SecurityInfoResDTO } from '@gofish/shared/dtos/user-security.dto';
import { SecurityInfo } from '@gofish/shared/models/user-security.models';

@Injectable({
  providedIn: 'root',
})
export class UserSecurityService {
  private readonly http = inject(HttpClient);

  // Api endpoints

  getSecurityInfo(): Observable<SecurityInfoResDTO> {
    return this.http.get<SecurityInfoResDTO>(Api.UserSecurity.action('GetSecurityInfo'));
  }

  changePassword(dto: ChangePasswordReqDTO): Observable<ChangePasswordResDTO> {
    return this.http.post<ChangePasswordResDTO>(Api.UserSecurity.action('ChangePassword'), dto);
  }

  // End api endpoints
}

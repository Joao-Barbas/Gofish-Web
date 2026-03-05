import { Observable } from 'rxjs';
import { HttpClient } from '@angular/common/http';
import { inject, Injectable } from '@angular/core';
import { Api } from '@gofish/shared/constants';
import { ChangePasswordReqDTO, ChangePasswordResDTO, EnableTotpReqDTO, EnableTotpResDTO, GetTotpSetupResDTO, SecurityInfoResDTO } from '@gofish/shared/dtos/user-security.dto';

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

  getTotpSetup(): Observable<GetTotpSetupResDTO> {
    return this.http.get<GetTotpSetupResDTO>(Api.UserSecurity.action('GetTotpSetup'));
  }

  enableTotp(dto: EnableTotpReqDTO): Observable<EnableTotpResDTO> {
    return this.http.post<EnableTotpResDTO>(Api.UserSecurity.action('EnableTotp'), dto);
  }

  disableTotp(dto: EnableTotpReqDTO): Observable<void> {
    return this.http.post<void>(Api.UserSecurity.action('DisableTotp'), dto);
  }

  // End api endpoints
}

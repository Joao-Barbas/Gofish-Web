import { HttpClient } from '@angular/common/http';
import { computed, inject, Injectable, signal } from '@angular/core';
import { ChangePasswordReqDTO, ChangePasswordResDTO, SecurityInfoResDTO } from '@gofish/shared/dtos/user-security.dto';
import { SecurityInfo } from '@gofish/shared/models/user-security.models';
import { environment } from 'environments/environment';
import { Observable, tap } from 'rxjs';

@Injectable({
  providedIn: 'root',
})
export class UserSecurityService {
  private readonly http = inject(HttpClient);
  private readonly url  = 'UserSecurity';

  private _securityInfo = signal<SecurityInfo | null>(null);
  readonly securityInfo = this._securityInfo.asReadonly();

  readonly twoFactorEnabled = computed(() => this.securityInfo()?.twoFactorEnabled ?? false);
  readonly twoFactorMethod  = computed(() => this.securityInfo()?.twoFactorMethod  ?? false);

  // Api endpoints

  getSecurityInfo(): Observable<SecurityInfoResDTO> {
    return this.http
      .get<SecurityInfoResDTO>(`${environment.baseApiUrl}/${this.url}/GetSecurityInfo`)
      .pipe(tap((res) => this._securityInfo.set(res.data ?? null))
    );
  }

  changePassword(data: ChangePasswordReqDTO): Observable<ChangePasswordResDTO> {
    return this.http.post<ChangePasswordResDTO>(`${environment.baseApiUrl}/${this.url}/ChangePassword`, data);
  }

  // End api endpoints
}

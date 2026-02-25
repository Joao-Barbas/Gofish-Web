import { Observable } from 'rxjs';
import { HttpClient } from '@angular/common/http';
import { inject, Injectable } from '@angular/core';
import { DeleteAccountReqDTO } from '@gofish/shared/dtos/user-account.dto';
import { Api } from '@gofish/shared/constants';

@Injectable({
  providedIn: 'root',
})
export class UserAccountService {
  private readonly http = inject(HttpClient);

  // Api endpoints

  downloadPersonalData(): Observable<Blob> {
    return this.http.get(Api.UserAccount.action('DownloadPersonalData'), { responseType: 'blob' });
  }

  deleteAccount(dto: DeleteAccountReqDTO): Observable<void> {
    return this.http.delete<void>(Api.UserAccount.action('DeleteAccount'), { body: dto });
  }

  deletePersonalData(dto: DeleteAccountReqDTO): Observable<void> {
    return this.http.delete<void>(Api.UserAccount.action('DeletePersonalData'), { body: dto });
  }

  // End api endpoints
}

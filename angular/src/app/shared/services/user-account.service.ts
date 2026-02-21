// user-account.service.ts

import { HttpClient } from '@angular/common/http';
import { inject, Injectable } from '@angular/core';
import { environment } from 'environments/environment';
import { Observable } from 'rxjs';
import { DeleteAccountReqDTO } from '@gofish/shared/dtos/user-account.dto';

@Injectable({
  providedIn: 'root',
})
export class UserAccountService {
  private readonly url  = 'UserAccount';
  private readonly http = inject(HttpClient);

  downloadPersonalData(): Observable<Blob> { return this.http.get(`${environment.baseApiUrl}/${this.url}/DownloadPersonalData`, { responseType: 'blob' }); }
  deleteAccount(data: DeleteAccountReqDTO): Observable<void> { return this.http.delete<void>(`${environment.baseApiUrl}/${this.url}/DeleteAccount`, { body: data }); }
}

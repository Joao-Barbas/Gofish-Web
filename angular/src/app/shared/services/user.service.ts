// user.service.ts

import { HttpClient, HttpHeaders } from '@angular/common/http';
import { inject, Injectable } from '@angular/core';
import { environment } from 'environments/environment';
import { AuthService } from '@gofish/shared/services/auth.service';

@Injectable({
  providedIn: 'root'
})
export class UserService {
  private readonly url  = 'User';

  private readonly http = inject(HttpClient);
  private readonly auth = inject(AuthService);

  /**
   * @deprecated
   * Alternative not implemented for now
   */
  getUserProfile() {
    return this.http.get(`${environment.baseApiUrl}/${this.url}/GetProfile`);
  }
}

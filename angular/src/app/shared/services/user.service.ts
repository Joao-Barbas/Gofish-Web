import { HttpClient } from '@angular/common/http';
import { inject, Injectable } from '@angular/core';
import { AuthService } from '@gofish/shared/services/auth.service';
import { Api } from '@gofish/shared/constants';

@Injectable({
  providedIn: 'root'
})
export class UserService {
  private readonly http = inject(HttpClient);
  private readonly auth = inject(AuthService);

  /**
   * @deprecated
   * Alternative not implemented for now
   */
  getUserProfile() {
    return this.http.get(Api.User.action('GetProfile'));
  }
}

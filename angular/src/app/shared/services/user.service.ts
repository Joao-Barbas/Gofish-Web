import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { environment } from 'environments/environment';
import { AuthService } from '@gofish/shared/services/auth.service';

@Injectable({
  providedIn: 'root'
})
export class UserService {
  private readonly baseUserUrl = 'GofishUser';

  constructor(
    private http: HttpClient,
    private authService: AuthService
  ){}

  getUserProfile() {
    return this.http.get(`${environment.baseApiUrl}/${this.baseUserUrl}/GetProfile`);
  }
}

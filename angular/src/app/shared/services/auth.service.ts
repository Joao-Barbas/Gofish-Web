import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { LOCAL_TOKEN_KEY } from '@gofish/const';
import { environment } from 'environments/environment';

@Injectable({
  providedIn: 'root'
})
export class AuthService {
  private readonly baseAuthUrl = 'Auth';

  constructor(private http: HttpClient) { }

  postUser(data: any) {
    return this.http.post(`${environment.baseApiUrl}/${this.baseAuthUrl}/SignUp`, data);
  }

  signInUser(data: any) {
    return this.http.post(`${environment.baseApiUrl}/${this.baseAuthUrl}/SignIn`, data);
  }

  isSignedIn() {
    return this.getToken() != null ? true : false;
  }

  storeToken(token: string): boolean {
    localStorage.setItem(LOCAL_TOKEN_KEY, token);
    return true;
  }

  getToken(): string | null {
    return localStorage.getItem(LOCAL_TOKEN_KEY);
  }

  deleteToken(): boolean {
    localStorage.removeItem(LOCAL_TOKEN_KEY);
    return true;
  }
}

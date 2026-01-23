import { environment } from 'environments/environment';
import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { LOCAL_TOKEN_KEY } from '@gofish/const';
import { SignUpReqDTO, SignUpResDTO } from '@gofish/shared/dtos/signup.dto';
import { SignInReqDTO, SignInResDTO } from '@gofish/shared/dtos/signin.dto';

@Injectable({
  providedIn: 'root'
})
export class AuthService {
  private readonly baseAuthUrl = 'Auth';

  constructor(private http: HttpClient) { }

  postUser(data: SignUpReqDTO): Observable<SignUpResDTO> {
    return this.http.post<SignUpResDTO>(`${environment.baseApiUrl}/${this.baseAuthUrl}/SignUp`, data);
  }

  signInUser(data: SignInReqDTO): Observable<SignInResDTO> {
    return this.http.post<SignInResDTO>(`${environment.baseApiUrl}/${this.baseAuthUrl}/SignIn`, data);
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

import { environment } from 'environments/environment';
import { HttpClient } from '@angular/common/http';
import { inject, Injectable } from '@angular/core';
import { BehaviorSubject, Observable } from 'rxjs';
import { LOCAL_TOKEN_KEY } from '@gofish/shared/constants';
import { SignUpReqDTO, SignUpResDTO } from '@gofish/shared/dtos/signup.dto';
import { SignInReqDTO, SignInResDTO } from '@gofish/shared/dtos/signin.dto';
import { JwtClaim, JwtEncoded, JwtPayload } from '@gofish/shared/models/jwt.model';

@Injectable({
  providedIn: 'root'
})
export class AuthService {
  private readonly http = inject(HttpClient);
  private readonly url  = 'Auth';

  private decodedToken$ = new BehaviorSubject<JwtPayload | null>(null);

  constructor() {
    this.loadToken();
  }

  // Backend api endpoints

  public signUpUser(data: SignUpReqDTO): Observable<SignUpResDTO> { return this.http.post<SignUpResDTO>(`${environment.baseApiUrl}/${this.url}/SignUp`, data); }
  public signInUser(data: SignInReqDTO): Observable<SignInResDTO> { return this.http.post<SignInResDTO>(`${environment.baseApiUrl}/${this.url}/SignIn`, data); }

  // End backend api endpoints
  // Load & decode token

  private decodeToken(token: JwtEncoded): JwtPayload | null {
    try {
      var payload = token.split('.')[1];
      if (!payload) return null;
      var decoded = JSON.parse(atob(payload)); // TODO: npm i jwt-decode
      return decoded as JwtPayload;
    } catch (error) {
      return null;
    }
  }

  private loadToken(): JwtPayload | null {
    var token = this.getEncodedToken();
    if (!token) return null;

    var decoded = this.decodeToken(token);
    if (decoded && decoded.exp && decoded.exp * 1000 > Date.now()) {
      this.decodedToken$.next(decoded);
      return decoded;
    }

    this.signOut();
    return decoded;
  }

  // End load & decode token

  /**
   * @deprecated
   * Use insertToken(token: string) instead
   */
  storeToken(token: string): boolean {
    localStorage.setItem(LOCAL_TOKEN_KEY, token);
    return true;
  }

  /**
   * @deprecated
   * Use getEncodedToken() or getDecodedToken() instead
   */
  getToken(): string | null {
    return localStorage.getItem(LOCAL_TOKEN_KEY);
  }

  /**
   * @deprecated
   * Use removeToken() instead
   */
  deleteToken(): boolean {
    localStorage.removeItem(LOCAL_TOKEN_KEY);
    return true;
  }

  // Token storage

  public insertToken = (token: string): void => localStorage.setItem(LOCAL_TOKEN_KEY, token);
  public removeToken = (): void => localStorage.removeItem(LOCAL_TOKEN_KEY);

  public getEncodedToken = (): JwtEncoded | null => localStorage.getItem(LOCAL_TOKEN_KEY);
  public getDecodedToken = (): JwtPayload | null => this.decodedToken$.value;

  // End token storage
  // Jwt claim getters

  public get userId(): JwtClaim { return this.decodedToken$.value?.sub ?? ''; }
  public get userName(): JwtClaim { return this.decodedToken$.value?.unique_name ?? ''; }
  public get userFirstName(): JwtClaim { return this.decodedToken$.value?.given_name ?? ''; }
  public get userLastName(): JwtClaim { return this.decodedToken$.value?.family_name ?? ''; }
  public get userEmail(): JwtClaim { return this.decodedToken$.value?.email ?? ''; }

  // End jwt claim getters

  public isSignedIn(): boolean {
    var token = this.getEncodedToken();
    if (!token) return false;
    var decoded = this.decodeToken(token);
    if (!decoded) return false;
    var isExpired = decoded.exp && decoded.exp * 1000 < Date.now();
    if (!isExpired) return true;
    this.signOut();
    return false;
  }

  public signOut(): void {
    this.removeToken();
  }
}

// auth.api.ts

import { HttpClient, HttpParams } from "@angular/common/http";
import { inject, Injectable } from "@angular/core";
import { Api } from "@gofish/shared/constants";
import { SignInReqDTO, SignInResDTO, SignUpReqDTO, SignUpResDTO, TwoFactorSignInReqDTO, TwoFactorSignInResDTO } from "@gofish/shared/dtos/auth.dto";
import { Observable } from "rxjs";

@Injectable({
  providedIn: 'root'
})
export class AuthApi {
  private readonly http = inject(HttpClient);

  signUp(dto: SignUpReqDTO): Observable<SignUpResDTO> {
    return this.http.post<SignUpResDTO>(Api.Auth.action('SignUp'), dto);
  }

  signIn(dto: SignInReqDTO): Observable<SignInResDTO> {
    return this.http.post<SignInResDTO>(Api.Auth.action('SignIn'), dto);
  }

  twoFactorSignIn(dto: TwoFactorSignInReqDTO): Observable<TwoFactorSignInResDTO> {
    return this.http.post<TwoFactorSignInResDTO>(Api.Auth.action('TwoFactorSignIn'), dto);
  }

  externalLogin(provider: string): void {
    window.location.href = Api.Auth.action(`ExternalLogin?provider=${encodeURIComponent(provider)}`);
  }
}

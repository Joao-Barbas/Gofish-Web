// user-security.api.ts

import { Observable } from 'rxjs';
import { HttpClient } from '@angular/common/http';
import { inject, Injectable } from '@angular/core';
import { Api } from '@gofish/shared/constants';
import {
  ChangePasswordReqDTO,
  ChangePasswordResDTO,
  CompleteEmailChangeReqDTO,
  EnableTotpReqDTO,
  EnableTotpResDTO,
  GetTotpSetupResDTO,
  InitiateEmailChangeReqDTO,
  InitiateEmailChangeResDTO,
  SecurityInfoResDTO,
  ValidateTwoFactorCodeReqDTO,
  ValidateTwoFactorCodeResDTO,
  VerifyEmailReqDTO,
} from '@gofish/shared/dtos/user-security.dto';

@Injectable({
  providedIn: 'root',
})
export class UserSecurityApi {
  private readonly http = inject(HttpClient);

  getSecurityInfo(): Observable<SecurityInfoResDTO> {
    return this.http.get<SecurityInfoResDTO>(Api.UserSecurity.action('GetSecurityInfo'));
  }

  /**
   * Verifies the user's active 2FA method (TOTP or email code) and returns
   * a short-lived action token (5 min) the frontend must send when performing
   * a sensitive action like changing email.
   * Call this only when the user actually has 2FA enabled.
   */
  validateTwoFactorCode(dto: ValidateTwoFactorCodeReqDTO): Observable<ValidateTwoFactorCodeResDTO> {
    return this.http.post<ValidateTwoFactorCodeResDTO>(Api.UserSecurity.action('ValidateTwoFactorCode'), dto);
  }

  changePassword(dto: ChangePasswordReqDTO): Observable<ChangePasswordResDTO> {
    return this.http.post<ChangePasswordResDTO>(Api.UserSecurity.action('ChangePassword'), dto);
  }

  sendTwoFactorEmail(): Observable<void> {
    return this.http.post<void>(Api.UserSecurity.action('SendTwoFactorEmail'), {});
  }

  // Change email

  /**
   * Initiates an email change.
   * Sends a 6-digit code to the new address and returns a token (encodes userId + newEmail + code, 15 min TTL).
   * The frontend holds the token and asks the user to enter the code.
   */
  initiateEmailChange(dto: InitiateEmailChangeReqDTO): Observable<InitiateEmailChangeResDTO> {
    return this.http.post<InitiateEmailChangeResDTO>(Api.UserSecurity.action('InitiateEmailChange'), dto);
  }

  /**
   * Completes an email change.
   * Confirms the email change using the token returned by InitiateEmailChange
   * and the 6-digit code sent to the new address.
   */
  completeEmailChange(dto: CompleteEmailChangeReqDTO): Observable<void> {
    return this.http.post<void>(Api.UserSecurity.action('CompleteEmailChange'), dto);
  }

  // Email verification

  /**
   * Starts the proccess of email verification.
   * Sends to user's ser email a 6-digit code.
   */
  sendVerificationEmail(): Observable<void> {
    return this.http.post<void>(Api.UserSecurity.action('SendVerificationEmail'), {});
  }

  /**
   * Ends the process of email verification.
   * Verifies the email using the 6-digit code sent by SendVerificationEmail.
   */
  verifyEmail(dto: VerifyEmailReqDTO): Observable<void> {
    return this.http.post<void>(Api.UserSecurity.action('VerifyEmail'), dto);
  }

  // Enable-disable two factors

  getTotpSetup(): Observable<GetTotpSetupResDTO> {
    return this.http.get<GetTotpSetupResDTO>(Api.UserSecurity.action('GetTotpSetup'));
  }

  enableTotp(dto: EnableTotpReqDTO): Observable<EnableTotpResDTO> {
    return this.http.post<EnableTotpResDTO>(Api.UserSecurity.action('EnableTotp'), dto);
  }

  disableTotp(dto: EnableTotpReqDTO): Observable<void> {
    return this.http.post<void>(Api.UserSecurity.action('DisableTotp'), dto);
  }

  enableEmailTwoFactor(): Observable<void> {
    return this.http.post<void>(Api.UserSecurity.action('EnableEmailTwoFactor'), {});
  }

  disableEmailTwoFactor(): Observable<void> {
    return this.http.post<void>(Api.UserSecurity.action('DisableEmailTwoFactor'), {});
  }
}

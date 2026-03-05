import { jwtDecode } from 'jwt-decode';
import { Observable } from 'rxjs';
import { HttpClient } from '@angular/common/http';
import { computed, inject, Injectable, signal } from '@angular/core';
import { Router } from '@angular/router';
import { JwtClaim, JwtEncoded, JwtPayload, JwtRole } from '@gofish/shared/models/jwt.model';
import { Api, LocalStorageKey, Path } from '@gofish/shared/constants';
import { SignUpReqDTO, SignUpResDTO } from '@gofish/shared/dtos/signup.dto';
import { SignInReqDTO, SignInResDTO, TwoFactorSignInReqDTO, TwoFactorSignInResDTO } from '@gofish/shared/dtos/signin.dto';

@Injectable({
  providedIn: 'root'
})
export class AuthService {
  private readonly http   = inject(HttpClient);
  private readonly router = inject(Router)

  private _encodedToken = signal<JwtEncoded | null>(null);
  private _decodedToken = signal<JwtPayload | null>(null);

  readonly encodedToken = this._encodedToken.asReadonly();
  readonly decodedToken = this._decodedToken.asReadonly();

  constructor() {
    const et = localStorage.getItem(LocalStorageKey.TOKEN);
    if (et && this.insertToken(et)) return; // This checks token too
    this.signOut();
  }

  // Api endpoints

  signUpUser(dto: SignUpReqDTO): Observable<SignUpResDTO> {
    return this.http.post<SignUpResDTO>(Api.Auth.action('SignUp'), dto);
  }

  signInUser(dto: SignInReqDTO): Observable<SignInResDTO> {
    return this.http.post<SignInResDTO>(Api.Auth.action('SignIn'), dto);
  }

  signIn2fa(dto: TwoFactorSignInReqDTO): Observable<TwoFactorSignInResDTO> {
    return this.http.post<TwoFactorSignInResDTO>(Api.Auth.action('TwoFactorSignIn'), dto);
  }

  // End Api endpoints
  // Load & decode token

  private checkToken(dt: JwtPayload | null): boolean {
    return !!dt
        && !!dt.exp
        && dt.exp * 1000 > Date.now();
  }

  private decodeToken(et: JwtEncoded): JwtPayload | null {
    try {
      return jwtDecode<JwtPayload>(et);
    } catch {
      return null;
    }
  }

  // End load & decode token
  // Token storage

  insertToken(et: JwtEncoded): boolean {
    const dt = this.decodeToken(et);
    if (!this.checkToken(dt)) return false;
    localStorage.setItem(LocalStorageKey.TOKEN, et);
    this._encodedToken.set(et);
    this._decodedToken.set(dt);
    return true;
  }

  removeToken(): void {
    localStorage.removeItem(LocalStorageKey.TOKEN);
    this._encodedToken.set(null);
    this._decodedToken.set(null);
  }

  getEncodedToken = (): JwtEncoded | null => this.encodedToken();
  getDecodedToken = (): JwtPayload | null => this.decodedToken();

  // End token storage
  // Jwt claim getters

  readonly userId = computed((): JwtClaim => this.decodedToken()?.sub ?? '');
  readonly userName = computed((): JwtClaim => this.decodedToken()?.unique_name ?? '');
  readonly userFirstName = computed((): JwtClaim => this.decodedToken()?.given_name ?? '');
  readonly userLastName = computed((): JwtClaim => this.decodedToken()?.family_name ?? '');
  readonly userEmail = computed((): JwtClaim => this.decodedToken()?.email ?? '');

  // End jwt claim getters
  // Jwt roles getters

  readonly isAdmin = computed((): boolean => this.hasRole('Admin'));
  readonly isUser = computed((): boolean => this.hasRole('User'));

  // End jwt roles getters

  /**
   * Checks if the current user has a specific role.
   * @param role - The role to check against the decoded token.
   * @returns `true` if the user has the given role, `false` otherwise.
   */
  hasRole(role: JwtRole): boolean {
    const r = this.decodedToken()?.role;
    return Array.isArray(r) ? r.includes(role) : r === role;
  }

  /**
   * Checks if the current user has a valid, authenticated session.
   * @param act - If `true`, automatically signs out the user when not authenticated. Defaults to `false`.
   * @returns `true` if authenticated, `false` otherwise.
   */
  isAuthenticated(act: boolean = false): boolean {
    const dt = this.decodedToken();
    if (this.checkToken(dt)) return true;
    if (act) this.signOut();
    return false;
  }

  /**
   * Signs in a user.
   * @param et - The encoded JWT token to store.
   * @returns `true` on success.
   */
  signIn(et: JwtEncoded): boolean {
    return this.insertToken(et); // Just an alias to this
  }

  /**
   * Signs out the current user.
   * Redirects the client to the home page.
   */
  signOut(): void {
    this.removeToken();
    this.router.navigate([Path.HOME]);
  }
}

export type JwtStdKeys  = keyof JwtStdClaims;
export type JwtUserKeys = keyof JwtUserClaims;

export type JwtSubject   = string;
export type JwtId        = string;
export type JwtIssuedAt  = number;
export type JwtNotBefore = number;
export type JwtExpiresAt = number;
export type JwtIssuer    = string;
export type JwtAudience  = string;

export type JwtRole  = 'User' | 'Admin';
export type JwtRoles = JwtRole | JwtRole[];

export type JwtLoginProvider = 'Local' | 'Google';

export type JwtEncoded   = string;
export type JwtDecoded   = string;

export type JwtStdClaims = { // All fields are optional as per 7519
  sub: JwtSubject | null;
  jti: JwtId | null;
  iat: JwtIssuedAt | null;
  nbf: JwtNotBefore | null;
  exp: JwtExpiresAt | null;
  iss: JwtIssuer | null;
  aud: JwtAudience | null;
}

export type JwtUserClaims = {
  unique_name: string;
  given_name: string;
  family_name: string;
  email: string;
  role: JwtRoles;
  login_provider: JwtLoginProvider;
}

export type JwtPayload  = JwtStdClaims & JwtUserClaims;
export type JwtUserInfo = Omit<JwtPayload, keyof JwtStdClaims>;
export type JwtClaim    = JwtPayload[keyof JwtPayload];

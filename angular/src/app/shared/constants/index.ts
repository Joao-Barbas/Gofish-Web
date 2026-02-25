import { environment } from "environments/environment";

/* Local storage keys */

export const LocalStorageKey = {
  TOKEN: 'token',
} as const;

/* Angular route paths */

export const PathSegment = {
  HOME:                   '/',
  SIGN_UP:                'signup',
  SIGN_IN:                'signin',
  MAP:                    'map',
  CREATE_CATCH_PIN:       'create-catch-pin',
  SETTINGS:               'settings',
  GENERAL_SETTINGS:       'general',
  PERSONAL_DATA_SETTINGS: 'personal-data',
  SECURITY_SETTINGS:      'security',
  ABOUT_US:               'about-us',
} as const;

export const Path = {
  HOME:                   '/',
  SIGN_UP:                `/${PathSegment.SIGN_UP}`,
  SIGN_IN:                `/${PathSegment.SIGN_IN}`,
  MAP:                    `/${PathSegment.MAP}`,
  CREATE_CATCH_PIN:       `/${PathSegment.MAP}/${PathSegment.CREATE_CATCH_PIN}`,
  SETTINGS:               `/${PathSegment.SETTINGS}`,
  GENERAL_SETTINGS:       `/${PathSegment.SETTINGS}/${PathSegment.GENERAL_SETTINGS}`,
  PERSONAL_DATA_SETTINGS: `/${PathSegment.SETTINGS}/${PathSegment.PERSONAL_DATA_SETTINGS}`,
  SECURITY_SETTINGS:      `/${PathSegment.SETTINGS}/${PathSegment.SECURITY_SETTINGS}`,
  ABOUT_US:               `/${PathSegment.ABOUT_US}`,
} as const;

/* Backend endpoints */

function buildApi(controller: string) {
  return {
    base: () => `${environment.apiUrl}/${controller}`,
    action: (action: string) => `${environment.apiUrl}/${controller}/${action}`,
  };
}

export const Api = {
  Auth:         buildApi('Auth'),
  Enums:        buildApi('Enumerate'),
  Pin:          buildApi('Pin'),
  User:         buildApi('User'),
  UserAccount:  buildApi('UserAccount'),
  UserSecurity: buildApi('UserSecurity'),
} as const;

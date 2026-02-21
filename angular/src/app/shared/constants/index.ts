// shared\constants\index.ts

/**
 * @deprecated
 * Use LocalStorage.KEY_TOKEN
 */
export const LOCAL_TOKEN_KEY = 'token';

// Browser's local storage keys being used

export const LocalStorageKey = {
  TOKEN: 'token',
} as const;

// Routing

export const PathName = {
  HOME: '',
  SIGN_UP: 'signup',
  SIGN_IN: 'signin',
  MAP: {
    ROOT: 'map',
    CREATE_CATCH_PIN: 'create-catch-pin',
  },
  SETTINGS: {
    ROOT: 'settings',
    GENERAL: 'general',
    PERSONAL_DATA: 'personal-data',
    SECURITY: 'security',
  },
  ABOUT_US: 'about-us',
} as const;

export const Path = {
  HOME: '/',
  SIGN_UP: `/${PathName.SIGN_UP}`,
  SIGN_IN: `/${PathName.SIGN_IN}`,
  MAP: {
    ROOT: `/${PathName.MAP.ROOT}`,
    CREATE_CATCH_PIN: `/${PathName.MAP.ROOT}/${PathName.MAP.CREATE_CATCH_PIN}`,
  },
  SETTINGS: {
    ROOT: `/${PathName.SETTINGS.ROOT}`,
    GENERAL: `/${PathName.SETTINGS.ROOT}/${PathName.SETTINGS.GENERAL}`,
    PERSONAL_DATA: `/${PathName.SETTINGS.ROOT}/${PathName.SETTINGS.PERSONAL_DATA}`,
    SECURITY: `/${PathName.SETTINGS.ROOT}/${PathName.SETTINGS.SECURITY}`,
  },
  ABOUT_US: `/${PathName.ABOUT_US}`,
} as const;

// profile: (username: string) => `/profiles/${username}`,

// {
//   path: 'profiles/:username',
//   loadComponent: () => import('./profiles/profile-page.component').then(m => m.ProfilePageComponent),
// },

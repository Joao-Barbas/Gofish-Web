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

export const RoutePath = {
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

export const Route = {
  HOME: '/',
  SIGN_UP: `/${RoutePath.SIGN_UP}`,
  SIGN_IN: `/${RoutePath.SIGN_IN}`,
  MAP: {
    ROOT: `/${RoutePath.MAP.ROOT}`,
    CREATE_CATCH_PIN: `/${RoutePath.MAP.ROOT}/${RoutePath.MAP.CREATE_CATCH_PIN}`,
  },
  SETTINGS: {
    ROOT: `/${RoutePath.SETTINGS}`,
    GENERAL: `/${RoutePath.SETTINGS}/${RoutePath.SETTINGS.GENERAL}`,
    PERSONAL_DATA: `/${RoutePath.SETTINGS}/${RoutePath.SETTINGS.PERSONAL_DATA}`,
    SECURITY: `/${RoutePath.SETTINGS}/${RoutePath.SETTINGS.SECURITY}`,
  },
  ABOUT_US: `/${RoutePath.ABOUT_US}`,
} as const;

// profile: (username: string) => `/profiles/${username}`,

// {
//   path: 'profiles/:username',
//   loadComponent: () => import('./profiles/profile-page.component').then(m => m.ProfilePageComponent),
// },

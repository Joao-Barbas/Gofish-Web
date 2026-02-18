// shared\constants\index.ts

/**
 * @deprecated
 * Use LocalStorage.KEY_TOKEN
 */
export const LOCAL_TOKEN_KEY = 'token';

// Browser's local storage keys being used

export const LocalStorage = {
  KEY_TOKEN: 'token',
} as const;

// Routing

export const RoutePaths = {
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

export const Routes = {
  HOME: '/',
  SIGN_UP: `/${RoutePaths.SIGN_UP}`,
  SIGN_IN: `/${RoutePaths.SIGN_IN}`,
  MAP: {
    ROOT: `/${RoutePaths.MAP.ROOT}`,
    CREATE_CATCH_PIN: `/${RoutePaths.MAP.ROOT}/${RoutePaths.MAP.CREATE_CATCH_PIN}`,
  },
  SETTINGS: {
    ROOT: `/${RoutePaths.SETTINGS}`,
    GENERAL: `/${RoutePaths.SETTINGS}/${RoutePaths.SETTINGS.GENERAL}`,
    PERSONAL_DATA: `/${RoutePaths.SETTINGS}/${RoutePaths.SETTINGS.PERSONAL_DATA}`,
    SECURITY: `/${RoutePaths.SETTINGS}/${RoutePaths.SETTINGS.SECURITY}`,
  },
  ABOUT_US: `/${RoutePaths.ABOUT_US}`,
} as const;

// profile: (username: string) => `/profiles/${username}`,

// {
//   path: 'profiles/:username',
//   loadComponent: () => import('./profiles/profile-page.component').then(m => m.ProfilePageComponent),
// },

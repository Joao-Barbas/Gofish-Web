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
  SIGN_IN_VERIFY:         'signin/verify',
  MAP:                    'map',
  CREATE_CATCH_PIN:       'create-catch-pin',
  CREATE_INFO_PIN:        'create-info-pin',
  CREATE_WARN_PIN:        'create-warn-pin',
  DELETE_PIN:             'delete-pin/:id',
  SETTINGS:               'settings',
  GENERAL_SETTINGS:       'general',
  PERSONAL_DATA_SETTINGS: 'personal-data',
  SECURITY_SETTINGS:      'security',
  TWOFA_SETUP_SMS:        'setup-sms',
  TWOFA_SETUP_TOTP:       'setup-totp',
  ABOUT_US:               'about-us',
  TERMS:                  'terms-of-service',
  PRIVACY:                'privacy-policy',
  FORUM:                  'forum',
  FORUM_DISCOVER:         'discover',
  FORUM_FROM_FRIENDS:     'from-friends',
  FORUM_MY_GROUPS:        'my-groups',
  FORUM_GROUPS:           'groups',
  FORUM_POST:             'post',
  PROFILE:                'profile',
} as const;

export const Path = {
  HOME:                   '/',
  SIGN_UP:                `/${PathSegment.SIGN_UP}`,
  SIGN_IN:                `/${PathSegment.SIGN_IN}`,
  SIGN_IN_VERIFY:         `/${PathSegment.SIGN_IN_VERIFY}`,
  MAP:                    `/${PathSegment.MAP}`,
  CREATE_CATCH_PIN:       `/${PathSegment.MAP}/${PathSegment.CREATE_CATCH_PIN}`,
  SETTINGS:               `/${PathSegment.SETTINGS}`,
  GENERAL_SETTINGS:       `/${PathSegment.SETTINGS}/${PathSegment.GENERAL_SETTINGS}`,
  PERSONAL_DATA_SETTINGS: `/${PathSegment.SETTINGS}/${PathSegment.PERSONAL_DATA_SETTINGS}`,
  SECURITY_SETTINGS:      `/${PathSegment.SETTINGS}/${PathSegment.SECURITY_SETTINGS}`,
  TWOFA_SETUP_SMS:        `/${PathSegment.SETTINGS}/${PathSegment.SECURITY_SETTINGS}/${PathSegment.TWOFA_SETUP_SMS}`,
  TWOFA_SETUP_TOTP:       `/${PathSegment.SETTINGS}/${PathSegment.SECURITY_SETTINGS}/${PathSegment.TWOFA_SETUP_TOTP}`,
  ABOUT_US:               `/${PathSegment.ABOUT_US}`,
  TERMS:                  `/${PathSegment.TERMS}`,
  PRIVACY:                `/${PathSegment.PRIVACY}`,
  FORUM:                  `/${PathSegment.FORUM}`,
  FORUM_DISCOVER:         `/${PathSegment.FORUM}/${PathSegment.FORUM_DISCOVER}`,
  FORUM_FROM_FRIENDS:     `/${PathSegment.FORUM}/${PathSegment.FORUM_FROM_FRIENDS}`,
  FORUM_MY_GROUPS:        `/${PathSegment.FORUM}/${PathSegment.FORUM_MY_GROUPS}`,
  FORUM_GROUPS:           `/${PathSegment.FORUM}/${PathSegment.FORUM_GROUPS}`,

  // /forum/groups/:id?tab=posts
  FORUM_GROUPS_test_posts:   '/forum/groups/group-posts-placeholder/posts',
  // /forum/groups/:id?tab=members
  FORUM_GROUPS_test_members: '/forum/groups/group-posts-placeholder/members',

  FORUM_POST:           (id: string) => `/${PathSegment.FORUM}/${PathSegment.FORUM_POST}/${id}`,

  PROFILE:                (id: string) => `/profile/${id}`,
  PROFILE_FRIENDS:        (id: string) => `/profile/${id}/friends`,
  PROFILE_PINS:           (id: string) => `/profile/${id}/pins`,
  PROFILE_GROUPS:         (id: string) => `/profile/${id}/groups`,
  FORUM_GROUP:            (id: string) => `/forum/groups/${id}`,
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
  Post:         buildApi('Post'),
} as const;

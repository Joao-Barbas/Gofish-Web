// app.routes.ts

import { Routes } from '@angular/router';
import { PathSegment } from '@gofish/shared/constants';
import { authGuard } from '@gofish/shared/guards/auth.guard';
import { noTotpGuard } from '@gofish/shared/guards/no-totp.guard';

export const routes: Routes = [
  {
    path: '',
    loadComponent: () => import('@gofish/features/home/home.component').then(m => m.HomeComponent)
  },
  {
    path: PathSegment.SIGN_UP,
    loadComponent: () => import('@gofish/features/user/auth/signup/signup.component').then(m => m.SignupComponent)
  },
  {
    path: PathSegment.SIGN_IN,
    loadComponent: () => import('@gofish/features/user/auth/signin/signin.component').then(m => m.SigninComponent)
  },
  {
    path: PathSegment.SIGN_IN_VERIFY,
    loadComponent: () => import('@gofish/features/user/auth/signin-verify/signin-verify.component').then(m => m.SigninVerifyComponent)
  },
  {
    path: 'auth/callback',
    loadComponent: () => import('@gofish/features/user/auth/auth-callback/auth-callback.component').then(m => m.AuthCallbackComponent)
  },
  {
    path: PathSegment.SETTINGS,
    loadComponent: () => import('@gofish/features/user/settings/settings.component').then(m => m.SettingsComponent),
    canActivate: [authGuard],
    children: [
      { path: '', redirectTo: 'general', pathMatch: 'full' },
      { path: 'general', loadComponent: () => import('@gofish/features/user/settings/components/general/general.component').then(m => m.GeneralComponent) },
      { path: 'personal-data', loadComponent: () => import('@gofish/features/user/settings/components/personal-data/personal-data.component').then(m => m.PersonalDataComponent) },
      {
        path: 'security',
        loadComponent: () => import('@gofish/features/user/settings/components/security/security.component').then(m => m.SecurityComponent),
        children: [
          /*  {
             path: 'setup-sms',
           }, */
          {
            path: 'setup-totp',
            loadComponent: () => import('@gofish/features/user/settings/components/security/components/setup-totp/setup-totp.component').then(m => m.SetupTotpComponent),
            canActivate: [noTotpGuard]
          }
        ]
      }
    ]
  },
  {
    path: PathSegment.MAP,
    loadComponent: () => import('@gofish/features/map/map.component').then(m => m.MapComponent),
    canActivate: [authGuard],
    children: [
      { path: PathSegment.CREATE_CATCH_PIN, loadComponent: () => import('@gofish/features/map/components/create-pin-modals/catch-pin-modal/catch-pin-modal.component').then(c => c.CatchPinModalComponent) },
      { path: PathSegment.CREATE_INFO_PIN, loadComponent: () => import('@gofish/features/map/components/create-pin-modals/info-pin-modal/info-pin-modal.component').then(c => c.InfoPinModalComponent) },
      { path: PathSegment.CREATE_WARN_PIN, loadComponent: () => import('@gofish/features/map/components/create-pin-modals/warn-pin-modal/warn-pin-modal.component').then(c => c.WarnPinModalComponent) },
      { path: PathSegment.DELETE_PIN, loadComponent: () => import('@gofish/features/map/components/delete-pin/delete-pin.component').then(c => c.DeletePinComponent) }
    ]
  },
  {
    path: PathSegment.ABOUT_US,
    loadComponent: () => import('@gofish/features/about/about.component').then(a => a.AboutComponent),
  },
  {
    path: PathSegment.TERMS,
    loadComponent: () => import('@gofish/features/terms-of-service/terms-of-service.component').then(t => t.TermsOfServiceComponent),
  },
  {
    path: PathSegment.PRIVACY,
    loadComponent: () => import('@gofish/features/privacy-policy/privacy-policy.component').then(p => p.PrivacyPolicyComponent),
  },
  {
    path: 'forum',
    loadComponent: () => import('@gofish/features/forum/forum.component').then(f => f.ForumComponent),
    children: [
      { path: '', redirectTo: PathSegment.FORUM_DISCOVER, pathMatch: 'full' },
      { path: PathSegment.FORUM_DISCOVER, loadComponent: () => import('@gofish/features/forum/children/discover/discover.component').then(d => d.DiscoverComponent) },
      { path: PathSegment.FORUM_FROM_FRIENDS, loadComponent: () => import('@gofish/features/forum/children/from-friends/from-friends.component').then(f => f.FromFriendsComponent) },
      { path: `${PathSegment.FORUM_MY_GROUPS}/${PathSegment.CREATE_GROUP}`, loadComponent: () => import('@gofish/features/forum/children/my-groups/group-create/group-create.component').then(m => m.GroupCreateComponent) },
      { path: PathSegment.FORUM_MY_GROUPS, loadComponent: () => import('@gofish/features/forum/children/my-groups/my-groups.component').then(m => m.MyGroupsComponent) },


      // Rota do grupo com filhos (posts e members)
      {
        path: `${PathSegment.FORUM_MY_GROUPS}/:id`,
        loadComponent: () => import('@gofish/features/forum/children/groups/groups.component').then(g => g.GroupsComponent),
        /* children: [
          { path: '', redirectTo: 'posts', pathMatch: 'full' },
          { path: 'posts', loadComponent: () => import('@gofish/features/forum/children/groups/children/group-posts-placeholder/group-posts-placeholder.component').then(c => c.GroupPostsPlaceholderComponent) },
          { path: 'members', loadComponent: () => import('@gofish/features/forum/children/groups/children/group-members-placeholder/group-members-placeholder.component').then(c => c.GroupMembersPlaceholderComponent) },
        ] */
      },

      // TODO: Remove - testing purposes
      {
        path: PathSegment.FORUM_GROUPS, loadComponent: () => import('@gofish/features/forum/children/groups/groups.component').then(g => g.GroupsComponent),
        children: [
          { path: '', redirectTo: 'group-post-redirect-testing', pathMatch: 'full' },
          { path: 'group-post-redirect-testing', loadComponent: () => import('@gofish/features/forum/children/groups/children/group-posts-placeholder/group-posts-placeholder.component').then(c => c.GroupPostsPlaceholderComponent) },
        ]

      },
      { path: 'post/:id', loadComponent: () => import('@gofish/features/forum/children/post-id-placeholder/post-id-placeholder.component').then(p => p.PostIdPlaceholderComponent) },
    ]
  },
  {
    path: 'statistics',
    loadComponent: () => import('@gofish/features/statistics/statistics.component').then(f => f.StatisticsComponent),
    children: [ // unfinished
      { path: '', redirectTo: 'home', pathMatch: 'full' },
      { path: 'home', loadComponent: () => import('@gofish/features/statistics/children/stats-home/stats-home.component').then(d => d.StatsHomeComponent) },
      { path: 'reports', loadComponent: () => import('@gofish/features/statistics/children/stats-reports/stats-reports.component').then(d => d.StatsReportsComponent) },

    ]
  },
  {
    path: 'test-page',
    loadComponent: () => import('@gofish/features/test-delete-after/test-delete-after.component').then(a => a.TestDELETEAFTERComponent), /* TODO: remove */
  },
];

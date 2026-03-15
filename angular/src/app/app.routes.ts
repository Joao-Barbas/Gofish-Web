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
            canActivate: [ noTotpGuard ]
          }
        ]
      }
    ]
  },
  {
    path: 'map',
    loadComponent: () => import('@gofish/features/map/map.component').then(m => m.MapComponent),
    canActivate: [authGuard],
    children: [
      { path: 'create-catch-pin', loadComponent: () => import('@gofish/features/map/components/create-pin-modals/catch-pin-modal/catch-pin-modal.component').then(c => c.CatchPinModalComponent) },
      { path: 'create-info-pin', loadComponent: () => import('@gofish/features/map/components/create-pin-modals/info-pin-modal/info-pin-modal.component').then(c => c.InfoPinModalComponent) },
      { path: 'create-warn-pin', loadComponent: () => import('@gofish/features/map/components/create-pin-modals/warn-pin-modal/warn-pin-modal.component').then(c => c.WarnPinModalComponent) },
      { path: 'delete-pin/:id', loadComponent: () => import ('@gofish/features/map/components/delete-pin/delete-pin.component').then(c => c.DeletePinComponent) }
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
  canActivate: [authGuard],
  children: [
    { path: '', redirectTo: PathSegment.FORUM_DISCOVER, pathMatch: 'full' },
    { path: PathSegment.FORUM_DISCOVER,     loadComponent: () => import('@gofish/features/forum/children/discover/discover.component').then(d => d.DiscoverComponent) },
    { path: PathSegment.FORUM_FROM_FRIENDS, loadComponent: () => import('@gofish/features/forum/children/from-friends/from-friends.component').then(f => f.FromFriendsComponent) },
    { path: PathSegment.FORUM_MY_GROUPS,    loadComponent: () => import('@gofish/features/forum/children/my-groups/my-groups.component').then(m => m.MyGroupsComponent) },

    // Rota do grupo com filhos (posts e members)
    {
      path: `${PathSegment.FORUM_GROUPS}/:id`,
      loadComponent: () => import('@gofish/features/forum/children/groups/groups.component').then(g => g.GroupsComponent),
      children: [
        { path: '', redirectTo: 'posts', pathMatch: 'full' },
        { path: 'posts',   loadComponent: () => import('@gofish/features/forum/children/groups/children/group-posts-placeholder/group-posts-placeholder.component').then(c => c.GroupPostsPlaceholderComponent) },
        { path: 'members', loadComponent: () => import('@gofish/features/forum/children/groups/children/group-members-placeholder/group-members-placeholder.component').then(c => c.GroupMembersPlaceholderComponent) },
      ]
    },

    // TODO: Remove - testing purposes
    { path: PathSegment.FORUM_GROUPS, loadComponent: () => import('@gofish/features/forum/children/groups/groups.component').then(g => g.GroupsComponent) },
    { path: 'post/:id',               loadComponent: () => import('@gofish/features/forum/children/post-id-placeholder/post-id-placeholder.component').then(p => p.PostIdPlaceholderComponent) },
  ]
},
/*
  {
    path: 'forum',
    loadComponent: () => import('@gofish/features/forum/forum.component').then(f => f.ForumComponent),
    canActivate: [authGuard],
    children: [
      { path: '', redirectTo: PathSegment.FORUM_DISCOVER, pathMatch: 'full' },
      { path: PathSegment.FORUM_DISCOVER, loadComponent: () => import('@gofish/features/forum/children/discover/discover.component').then(d => d.DiscoverComponent) },
      { path: PathSegment.FORUM_FROM_FRIENDS, loadComponent: () => import('@gofish/features/forum/children/from-friends/from-friends.component').then(f => f.FromFriendsComponent) },
      { path: PathSegment.FORUM_MY_GROUPS, loadComponent: () => import('@gofish/features/forum/children/my-groups/my-groups.component').then(m => m.MyGroupsComponent) },
      { path: `${PathSegment.FORUM_GROUPS}/:id`, loadComponent: () => import('@gofish/features/forum/children/groups/groups.component').then(g => g.GroupsComponent) },

       // Testing purposes
       // TODO: Remove

      { path: `${PathSegment.FORUM_GROUPS}`, loadComponent: () => import('@gofish/features/forum/children/groups/groups.component').then(g => g.GroupsComponent) },
      {
        path: 'groups/:id', loadComponent: () => import('@gofish/features/forum/children/groups/groups.component').then(g => g.GroupsComponent), children: [
          { path: '', redirectTo: 'posts', pathMatch: 'full' },
          { path: 'posts', loadComponent: () => import('').then(c => c.GroupPostsPlaceholderComponent) },
          { path: 'members', loadComponent: () => import('').then(c => c.GroupMembersPlaceholderComponent) },
        ]
      },
      {
        path: 'groups/:id', loadComponent: () => import('@gofish/features/forum/children/groups/groups.component').then(g => g.GroupsComponent),
        children: [
          { path: '', redirectTo: 'posts', pathMatch: 'full' },

          // /forum/groups/:id?tab=posts
          { path: 'posts', loadComponent: () => import('').then(c => c.GroupPostsPlaceholderComponent) },

          // /forum/groups/:id?tab=members
          { path: 'members', loadComponent: () => import('@gofish/features/forum/children/groups/children/group-members-placeholder/group-members-placeholder.component').then(c => c.GroupMembersPlaceholderComponent) },

        ]
      },
      { path: 'post/:id', loadComponent: () => import('@gofish/features/forum/children/post-id-placeholder/post-id-placeholder.component').then(p => p.PostIdPlaceholderComponent) },
    ]
  },
*/
];

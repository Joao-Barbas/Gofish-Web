// app.routes.ts

import { Routes } from '@angular/router';
import { FooterVariant } from '@gofish/features/footer/footer.component';
import { HeaderVariant } from '@gofish/features/header/header.component';
import { PathSegment } from '@gofish/shared/constants';
import { authGuard } from '@gofish/shared/guards/auth.guard';
import { noTotpGuard } from '@gofish/shared/guards/no-totp.guard';

export const routes: Routes = [
  {
    path: '',
    loadComponent: () => import('@gofish/features/home/home.component').then(m => m.HomeComponent),
    data: {
      header: 'flat' as HeaderVariant,
      footer: 'big' as FooterVariant
    }
  },
  {
    path: 'leaderboard',
    loadComponent: () => import('@gofish/features/leaderboard/leaderboard.component').then(m => m.LeaderboardComponent),
    canActivate: [authGuard],
    data: {
      header: 'flat' as HeaderVariant,
      footer: 'small' as FooterVariant
    }
  },
  {
    path: 'search',
    canActivate: [authGuard],
    data: {
      header: 'flat' as HeaderVariant,
      footer: 'small' as FooterVariant
    },
    children: [
      {
        path: '',
        loadComponent: () => import('@gofish/features/search/search.component').then(m => m.SearchComponent),
        pathMatch: 'full'
      },
      {
        path: 'users',
        loadComponent: () => import('@gofish/features/search/pages/users-list/users-list.component').then(m => m.UsersListComponent),
      },
      {
        path: 'groups',
        loadComponent: () => import('@gofish/features/search/pages/groups-list/groups-list.component').then(m => m.GroupsListComponent),
      },
    ]
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
    path: PathSegment.FORGOT_PASSWORD,
    loadComponent: () => import('@gofish/features/user/auth/reset-password/reset-password.component').then(m => m.ResetPasswordComponent)
  },
  {
    path: 'auth/callback',
    loadComponent: () => import('@gofish/features/user/auth/auth-callback/auth-callback.component').then(m => m.AuthCallbackComponent)
  },
  {
    path: 'profile/:id',
    loadComponent: () => import('@gofish/features/user/profile/profile-shell.component').then(m => m.ProfileShellComponent),
    canActivate: [authGuard],
    data: {
      header: 'flat' as HeaderVariant,
      footer: 'small' as FooterVariant
    },
    children: [
      {
        path: '',
        loadComponent: () => import('@gofish/features/user/profile/pages/overview/overview.component').then(m => m.OverviewComponent),
      },
      {
        path: 'friends',
        loadComponent: () => import('@gofish/features/user/profile/pages/friends/friends.component').then(m => m.FriendsComponent),
      },
      {
        path: 'groups',
        loadComponent: () => import('@gofish/features/user/profile/pages/groups/groups.component').then(m => m.GroupsComponent),
      },
      {
        path: 'pins',
        loadComponent: () => import('@gofish/features/user/profile/pages/pins/pins.component').then(m => m.PinsComponent),
      },
    ]
  },
  {
    path: PathSegment.SETTINGS,
    loadComponent: () => import('@gofish/features/user/settings/settings.component').then(m => m.SettingsComponent),
    canActivate: [authGuard],
    data: {
      header: 'flat' as HeaderVariant,
      footer: 'small' as FooterVariant
    },
    children: [
      {
        path: '',
        redirectTo: 'general',
        pathMatch: 'full'
      },
      {
        path: 'general',
        loadComponent: () => import('@gofish/features/user/settings/components/general/general.component').then(m => m.GeneralComponent)
      },
      {
        path:
          'personal-data',
        loadComponent: () => import('@gofish/features/user/settings/components/personal-data/personal-data.component').then(m => m.PersonalDataComponent)
      },
      {
        path: 'security',
        loadComponent: () => import('@gofish/features/user/settings/components/security/security.component').then(m => m.SecurityComponent),
        children: [
          /*
          {
            path: 'setup-sms',
          },
          */
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
    data: {
      header: 'overlay' as HeaderVariant,
      footer: 'none' as FooterVariant
    },
    children: [
      { path: PathSegment.CREATE_CATCH_PIN, loadComponent: () => import('@gofish/features/map/components/create-pin-modals/catch-pin-modal/catch-pin-modal.component').then(c => c.CatchPinModalComponent) },
      { path: PathSegment.CREATE_INFO_PIN, loadComponent: () => import('@gofish/features/map/components/create-pin-modals/info-pin-modal/info-pin-modal.component').then(c => c.InfoPinModalComponent) },
      { path: PathSegment.CREATE_WARN_PIN, loadComponent: () => import('@gofish/features/map/components/create-pin-modals/warn-pin-modal/warn-pin-modal.component').then(c => c.WarnPinModalComponent) },
      { path: PathSegment.DELETE_PIN, loadComponent: () => import('@gofish/features/map/components/delete-pin/delete-pin.component').then(c => c.DeletePinComponent) },
      { path: PathSegment.REPORT_PIN, loadComponent: () => import('@gofish/shared/components/report-pin/report-pin.component').then(c => c.ReportPinComponent) }
    ]
  },
  {
    path: PathSegment.ABOUT_US,
    loadComponent: () => import('@gofish/features/about/about.component').then(a => a.AboutComponent),
    data: {
      header: 'flat' as HeaderVariant,
      footer: 'big' as FooterVariant
    }
  },
  {
    path: PathSegment.TERMS,
    loadComponent: () => import('@gofish/features/terms-of-service/terms-of-service.component').then(t => t.TermsOfServiceComponent),
    data: {
      header: 'flat' as HeaderVariant,
      footer: 'big' as FooterVariant
    }
  },
  {
    path: PathSegment.PRIVACY,
    loadComponent: () => import('@gofish/features/privacy-policy/privacy-policy.component').then(p => p.PrivacyPolicyComponent),
    data: {
      header: 'flat' as HeaderVariant,
      footer: 'big' as FooterVariant
    }
  },
  {
    path: 'forum',
    loadComponent: () => import('@gofish/features/forum/forum.component').then(f => f.ForumComponent),
    data: {
      header: 'flat' as HeaderVariant,
      footer: 'small' as FooterVariant
    },
    children: [
      {
        path: '',
        redirectTo: PathSegment.FORUM_DISCOVER,
        pathMatch: 'full'
      },
      {
        path: PathSegment.FORUM_DISCOVER,
        loadComponent: () => import('@gofish/features/forum/features/discover/discover.component').then(d => d.DiscoverComponent)
      },
      {
        path: PathSegment.FORUM_FROM_FRIENDS,
        loadComponent: () => import('@gofish/features/forum/features/from-friends/from-friends.component').then(f => f.FromFriendsComponent)
      },
      {
        path: `${PathSegment.FORUM_MY_GROUPS}/${PathSegment.CREATE_GROUP}`,
        loadComponent: () => import('@gofish/features/forum/modals/group-create/group-create.component').then(m => m.GroupCreateComponent)
      },
      {
        path: PathSegment.FORUM_MY_GROUPS,
        loadComponent: () => import('@gofish/features/forum/features/my-groups/my-groups.component').then(m => m.MyGroupsComponent)
      },


      // Rota do grupo com filhos (posts e members)
      {
        path: `${PathSegment.FORUM_MY_GROUPS}/:id`,
        loadComponent: () => import('@gofish/features/forum/features/groups/groups.component').then(g => g.GroupsComponent),
        children: [
          { path: '', redirectTo: 'posts', pathMatch: 'full' },
          { path: 'posts', loadComponent: () => import('@gofish/features/forum/features/groups/children/group-posts-placeholder/group-posts-placeholder.component').then(c => c.GroupPostsPlaceholderComponent) },
          { path: 'members', loadComponent: () => import('@gofish/features/forum/features/groups/children/members-group/members-group.component').then(c => c.MembersGroupComponent) },
          { path: 'invite', loadComponent: () => import('@gofish/features/forum/modals/group-invite/group-invite.component').then(m => m.GroupInviteComponent) },
          { path: 'delete', loadComponent: () => import('@gofish/features/forum/modals/delete-group/delete-group.component').then(m => m.DeleteGroupComponent) },
          { path: 'exit',   loadComponent: () => import('@gofish/features/forum/modals/exit-group/exit-group.component').then(m => m.ExitGroupComponent) },
        ]
      },

      // TODO: Remove - testing purposes
      {
        path: PathSegment.FORUM_GROUPS, loadComponent: () => import('@gofish/features/forum/features/groups/groups.component').then(g => g.GroupsComponent),
        children: [
          { path: '', redirectTo: 'group-post-redirect-testing', pathMatch: 'full' },
          { path: 'group-post-redirect-testing', loadComponent: () => import('@gofish/features/forum/features/groups/children/group-posts-placeholder/group-posts-placeholder.component').then(c => c.GroupPostsPlaceholderComponent) },
        ]

      },
      { path: 'post/:id', loadComponent: () => import('@gofish/features/forum/features/post/post-id-placeholder/post-id-placeholder.component').then(p => p.PostIdPlaceholderComponent) },

      { path: PathSegment.DELETE_POST, loadComponent: () => import('@gofish/features/forum/modals/delete-post/delete-post.component').then(p => p.DeletePostComponent) },
      { path: PathSegment.DELETE_COMMENT, loadComponent: () => import('@gofish/features/forum/modals/delete-comment/delete-comment.component').then(c => c.DeleteCommentComponent) },
      { path: PathSegment.REPORT_COMMENT, loadComponent: () => import('@gofish/shared/components/report-comment/report-comment.component').then(c => c.ReportCommentComponent) },
      { path: PathSegment.REPORT_PIN, loadComponent: () => import('@gofish/shared/components/report-pin/report-pin.component').then(c => c.ReportPinComponent) }
    ]
  },
  {
    path: 'stats', redirectTo: 'statistics/home',
  },
  {
    path: 'statistics',
    loadComponent: () => import('@gofish/features/statistics/statistics.component').then(f => f.StatisticsComponent),
    data: {
      header: 'flat' as HeaderVariant,
      footer: 'small' as FooterVariant
    },
    children: [ // unfinished
      { path: '', redirectTo: 'home', pathMatch: 'full' },
      { path: 'home', loadComponent: () => import('@gofish/features/statistics/children/stats-home/stats-home.component').then(d => d.StatsHomeComponent) },
      { path: 'reports', loadComponent: () => import('@gofish/features/statistics/children/stats-reports/stats-reports.component').then(d => d.StatsReportsComponent),
        children: [
          { path: '', redirectTo: 'pins', pathMatch: 'full' },
          { path: 'pins', loadComponent: () =>import('@gofish/features/statistics/children/reported-pins/reported-pins.component').then(d => d.ReportedPinsComponent)},
          { path: 'comments', loadComponent: () => import('@gofish/features/statistics/children/reported-comments/reported-comments.component').then(d => d.ReportedCommentsComponent)},
          { path: 'pins/:id', loadComponent: () => import('@gofish/features/statistics/children/reported-pin-page/reported-pin-page.component').then(d => d.ReportedPinPageComponent)},
          { path: 'comments/:id', loadComponent: () => import('@gofish/features/statistics/children/reported-comment-page/reported-comment-page.component').then(d => d.ReportedCommentPageComponent)}
        ]
      }

    ]
  },

  // Test Components - Do not delete
  {
    path: 'test',
    loadComponent: () => import('@gofish/features/test-delete-after/test-delete-after.component').then(f => f.TestDELETEAFTERComponent),
  },

];

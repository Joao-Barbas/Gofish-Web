// app.routes.ts

import { Routes } from '@angular/router';
import { authGuard } from '@gofish/shared/guards/auth.guard';
import { noTotpGuard } from '@gofish/shared/guards/no-totp.guard';

export const routes: Routes = [
  {
    path: '',
    loadComponent: () => import('@gofish/features/home/home.component').then(m => m.HomeComponent)
  },
  {
    path: 'signup',
    loadComponent: () => import('@gofish/features/user/auth/signup/signup.component').then(m => m.SignupComponent)
  },
  {
    path: 'signin',
    loadComponent: () => import('@gofish/features/user/auth/signin/signin.component').then(m => m.SigninComponent)
  },
  {
    path: 'signin/verify',
    loadComponent: () => import('@gofish/features/user/auth/signin-verify/signin-verify.component').then(m => m.SigninVerifyComponent)
  },
  {
    path: 'settings',
    loadComponent: () => import('@gofish/features/user/settings/settings.component').then(m => m.SettingsComponent),
    canActivate: [ authGuard ],
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
    canActivate: [ authGuard ],
    children: [
      { path: 'create-catch-pin', loadComponent: () => import('@gofish/features/map/components/create-pin-modals/catch-pin-modal/catch-pin-modal.component').then(c => c.CatchPinModalComponent) },
      { path: 'create-info-pin', loadComponent: () => import('@gofish/features/map/components/create-pin-modals/info-pin-modal/info-pin-modal.component').then(c => c.InfoPinModalComponent) },
      { path: 'create-warn-pin', loadComponent: () => import('@gofish/features/map/components/create-pin-modals/warn-pin-modal/warn-pin-modal.component').then(c => c.WarnPinModalComponent) },
      { path: 'delete-pin/:id', loadComponent: () => import ('@gofish/features/map/components/delete-pin/delete-pin.component').then(c => c.DeletePinComponent) }
    ]
  },
  {
    path: 'about-us',
    loadComponent: () => import('@gofish/features/about/about.component').then(a => a.AboutComponent),
  },
  {
    path: 'terms-of-service',
    loadComponent: () => import('@gofish/features/about/about.component').then(a => a.AboutComponent), /* TODO: Component */
  },
  {
    path: 'privacy-policy',
    loadComponent: () => import('@gofish/features/about/about.component').then(a => a.AboutComponent), /* TODO: Component */
  },
];

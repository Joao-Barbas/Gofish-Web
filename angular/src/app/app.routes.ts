// app.routes.ts

import { Routes } from '@angular/router';
import { authGuard } from '@gofish/shared/guards/auth.guard';

export const routes: Routes = [
  {
    path: '',
    loadComponent: () => import('@gofish/features/home/home.component').then(m => m.HomeComponent)
  },
  {
    path: 'signup',
    loadComponent: () => import('@gofish/features/user/signup/signup.component').then(m => m.SignupComponent)
  },
  {
    path: 'signin',
    loadComponent: () => import('@gofish/features/user/signin/signin.component').then(m => m.SigninComponent)
  },
  {
    path: 'settings',
    loadComponent: () => import('@gofish/features/user/settings/settings.component').then(m => m.SettingsComponent),
    canActivate: [ authGuard ],
    children: [
      { path: '', redirectTo: 'general', pathMatch: 'full' },
      { path: 'general', loadComponent: () => import('@gofish/features/user/settings/components/general/general.component').then(m => m.GeneralComponent) },
      { path: 'personal-data', loadComponent: () => import('@gofish/features/user/settings/components/personal-data/personal-data.component').then(m => m.PersonalDataComponent) },
      { path: 'security', loadComponent: () => import('@gofish/features/user/settings/components/security/security.component').then(m => m.SecurityComponent) }
    ]
  },
  {
    path: 'map',
    loadComponent: () => import('@gofish/features/map/map.component').then(m => m.MapComponent),
    canActivate: [ authGuard ],
    children: [
      { path: 'create-catch-pin', loadComponent: () => import('@gofish/features/map/components/modals/catch-pin-modal/catch-pin-modal.component').then(c => c.CatchPinModalComponent) }
    ]
  },
  {
    path: 'about-us',
    loadComponent: () => import('@gofish/features/about/about.component').then(a => a.AboutComponent),
  },
];

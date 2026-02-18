import { Routes } from '@angular/router';
import { authGuard } from '@gofish/shared/guards/auth.guard';

export const routes: Routes = [
  {
    path: '',
    loadComponent: () => import('@gofish/features/home/home.component').then(m => m.HomeComponent)
  },
  {
    path: 'user', loadComponent: () => import('@gofish/features/user/user.component').then(m => m.UserComponent),
    children: [
      { path: 'signup', loadComponent: () => import('@gofish/features/user/components/signup/signup.component').then(m => m.SignupComponent) },
      { path: 'signin', loadComponent: () => import('@gofish/features/user/components/signin/signin.component').then(m => m.SigninComponent) },
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

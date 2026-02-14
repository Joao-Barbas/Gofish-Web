import { Routes } from '@angular/router';
import { authGuard } from '@gofish/shared/guards/auth.guard';

export const routes: Routes = [
  {
    path: '',
    loadComponent: () => import('@gofish/features/home/home.component').then(m => m.HomeComponent)
  },
  {
    path: 'user', loadComponent: () => import('./user/user.component').then(m => m.UserComponent),
    children: [
      { path: 'signup', loadComponent: () => import('./user/signup/signup.component').then(m => m.SignupComponent) },
      { path: 'signin', loadComponent: () => import('./user/signin/signin.component').then(m => m.SigninComponent) },
    ]
  },
  {
    path: 'map',
    loadComponent: () => import('@gofish/features/map/map.component').then(m => m.MapComponent),
    canActivate: [ authGuard ]
  },
  {
    path: 'about-us',
    loadComponent: () => import('@gofish/features/about/about.component').then(a => a.AboutComponent),
  }
];

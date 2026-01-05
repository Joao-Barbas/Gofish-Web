import { Routes } from '@angular/router';
import { authGuard } from './shared/guards/auth.guard';

export const routes: Routes = [
  {
    path: 'user', loadComponent: () => import('./user/user.component').then(m => m.UserComponent),
    children: [
      { path: 'signup', loadComponent: () => import('./user/signup/signup.component').then(m => m.SignupComponent) },
      { path: 'signin', loadComponent: () => import('./user/signin/signin.component').then(m => m.SigninComponent) },
    ]
  },
  {
    path: 'map',
    loadComponent: () => import('./map/map.component').then(m => m.MapComponent),
    canActivate: [ authGuard ]
  }
];

// header-actions.component.ts

import { Component, inject } from '@angular/core';
import { Router } from '@angular/router';
import { Path, PathSegment } from '@gofish/shared/constants';
import { AuthService } from '@gofish/shared/services/auth.service';
import { PopupService } from '@gofish/shared/services/popup.service';
import { UserPopoverComponent } from "../user-popover/user-popover.component";
import { NavPopoverComponent } from '@gofish/features/header/components/nav-popover/nav-popover.component';

@Component({
  selector: 'gf-header-actions',
  imports: [
    UserPopoverComponent,
    NavPopoverComponent
  ],
  templateUrl: './header-actions.component.html',
  styleUrl: './header-actions.component.css',
})
export class HeaderActionsComponent {
  readonly router       = inject(Router);
  readonly popupService = inject(PopupService);
  readonly authService  = inject(AuthService);

  UserPopoverComponent = UserPopoverComponent;
  NavPopoverComponent = NavPopoverComponent;

  Path        = Path;
  PathSegment = PathSegment;

  onSignInClick(event: Event) {
    this.router.navigate([Path.SIGN_IN]);
  }

  onNavClick(event: Event): void {
    this.popupService.toggle(NavPopoverComponent.Key);
    event.stopPropagation();
  }

  onUserClick(event: Event): void {
    this.popupService.toggle(UserPopoverComponent.Key);
    event.stopPropagation();
  }

  onAdminClick(event: Event): void {
    this.popupService.toggle('header-admin-popup');
    event.stopPropagation();
  }
}

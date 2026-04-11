// header-actions.component.ts

import { Component, inject } from '@angular/core';
import { Router } from '@angular/router';
import { Path, PathSegment } from '@gofish/shared/constants';
import { AuthService } from '@gofish/shared/services/auth.service';
import { PopupService } from '@gofish/shared/services/popup.service';
import { UserPopoverComponent } from "../user-popover/user-popover.component";
import { NavPopoverComponent } from '@gofish/features/header/components/nav-popover/nav-popover.component';
import { AdminPopoverComponent } from "@gofish/features/header/components/admin-popover/admin-popover.component";

/**
 * Header actions component responsible for handling user interactions
 * in the application header.
 *
 * Responsibilities:
 * - Handle navigation to authentication and search pages
 * - Toggle header-related popovers (navigation, user, admin)
 * - Expose shared navigation paths to the template
 */
@Component({
  selector: 'gf-header-actions',
  imports: [
    UserPopoverComponent,
    NavPopoverComponent,
    AdminPopoverComponent
  ],
  templateUrl: './header-actions.component.html',
  styleUrl: './header-actions.component.css',
})
export class HeaderActionsComponent {
  /** Router used for navigation actions. */
  readonly router = inject(Router);

  /** Service used to control popover visibility. */
  readonly popupService = inject(PopupService);

  /** Service used to access authentication state. */
  readonly authService = inject(AuthService);

  /** Exposes user popover component to the template. */
  UserPopoverComponent = UserPopoverComponent;

  /** Exposes navigation popover component to the template. */
  NavPopoverComponent = NavPopoverComponent;

  /** Exposes admin popover component to the template. */
  AdminPopoverComponent = AdminPopoverComponent;

  /** Shared route path constants used in templates. */
  Path = Path;

  /** Shared route path segment constants used in templates. */
  PathSegment = PathSegment;

  /**
   * Navigates to the sign-in page.
   *
   * @param event DOM event that triggered the action
   */
  onSignInClick(event: Event) {
    this.router.navigate([Path.SIGN_IN]);
  }

  /**
   * Toggles the navigation popover.
   *
   * @param event DOM event that triggered the action
   */
  onNavClick(event: Event): void {
    this.popupService.toggle(NavPopoverComponent.Key);
    event.stopPropagation();
  }

  /**
   * Toggles the user popover.
   *
   * @param event DOM event that triggered the action
   */
  onUserClick(event: Event): void {
    this.popupService.toggle(UserPopoverComponent.Key);
    event.stopPropagation();
  }

  /**
   * Toggles the admin popover.
   *
   * @param event DOM event that triggered the action
   */
  onAdminClick(event: Event): void {
    this.popupService.toggle(AdminPopoverComponent.Key);
    event.stopPropagation();
  }

  /**
   * Navigates to the search page.
   *
   * @param event DOM event that triggered the action
   */
  onSearchClick(event: Event): void {
    this.router.navigate(['/search']);
  }
}

// nav-popover.component.ts

import { CommonModule } from '@angular/common';
import { Component, inject } from '@angular/core';
import { Router, RouterLink, RouterLinkActive } from '@angular/router';
import { UserProfileApi } from '@gofish/shared/api/user-profile.api';
import { Path, PathSegment } from '@gofish/shared/constants';
import { PopupController } from '@gofish/shared/core/popup-controller';
import { ClickOutsideDirective } from '@gofish/shared/directives/click-outside.directive';
import { AuthService } from '@gofish/shared/services/auth.service';

/**
 * Popover component used for main navigation in the header.
 *
 * Responsibilities:
 * - Display navigation links for different application sections
 * - Provide access to authentication and profile-related data
 * - Close automatically when clicking outside the popover
 */
@Component({
  selector: 'gf-nav-popover',
  hostDirectives: [
    {
      directive: ClickOutsideDirective,
      outputs: ['clickOutside'],
    }
  ],
  host: {
    'animate.enter': "on-enter",
    'animate.leave': "on-leave",
    '(clickOutside)': "popupController.close()"
  },
  imports: [
    CommonModule,
    RouterLinkActive,
    RouterLink
  ],
  templateUrl: './nav-popover.component.html',
  styleUrl: './nav-popover.component.css',
})
export class NavPopoverComponent {
  /** Unique key used to identify this popup instance. */
  static readonly Key = 'header-nav-popover';

  /** Service used to access authentication state and user data. */
  readonly authService = inject(AuthService);

  /** API used to retrieve or interact with user profile data. */
  readonly userProfileApi = inject(UserProfileApi);

  /** Router instance used for navigation actions. */
  readonly router = inject(Router);

  /** Controller used to manage the popup open and close state. */
  readonly popupController = new PopupController(NavPopoverComponent.Key);

  /** Shared route path constants used in templates. */
  readonly Path = Path;

  /** Shared route path segment constants used in templates. */
  readonly PathSegment = PathSegment;
}

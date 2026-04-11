// admin-popover.component.ts

import { CommonModule } from '@angular/common';
import { Component, inject } from '@angular/core';
import { Router, RouterLink, RouterLinkActive } from '@angular/router';
import { UserProfileApi } from '@gofish/shared/api/user-profile.api';
import { Path, PathSegment } from '@gofish/shared/constants';
import { PopupController } from '@gofish/shared/core/popup-controller';
import { ClickOutsideDirective } from '@gofish/shared/directives/click-outside.directive';
import { AuthService } from '@gofish/shared/services/auth.service';
import { AvatarService } from '@gofish/shared/services/avatar.service';

/**
 * Popover component displayed for administrator actions in the header.
 *
 * Responsibilities:
 * - Expose admin-related navigation links
 * - Provide access to authentication and profile services
 * - Close automatically when clicking outside the popover
 */
@Component({
  selector: 'gf-admin-popover',
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
    ClickOutsideDirective,
    RouterLinkActive,
    RouterLink
  ],
  templateUrl: './admin-popover.component.html',
  styleUrl: './admin-popover.component.css',
})
export class AdminPopoverComponent {
  /** Unique key used to identify this popup instance. */
  static readonly Key = 'header-admin-popover';

  /** Service used to access authentication state and user data. */
  readonly authService = inject(AuthService);

  /** API used to retrieve or interact with user profile data. */
  readonly userProfileApi = inject(UserProfileApi);

  /** Router instance used for admin navigation actions. */
  readonly router = inject(Router);

  /** Controller used to manage the popup open and close state. */
  readonly popupController = new PopupController(AdminPopoverComponent.Key);

  /** Shared route path constants used in templates. */
  readonly Path = Path;

  /** Shared route path segment constants used in templates. */
  readonly PathSegment = PathSegment;
}

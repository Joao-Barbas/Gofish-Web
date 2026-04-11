// user-popover.component.ts

import { CommonModule } from '@angular/common';
import { Component, inject, resource } from '@angular/core';
import { Router, RouterLink } from '@angular/router';
import { UserProfileApi } from '@gofish/shared/api/user-profile.api';
import { Path, PathSegment } from '@gofish/shared/constants';
import { PopupController } from '@gofish/shared/core/popup-controller';
import { ClickOutsideDirective } from '@gofish/shared/directives/click-outside.directive';
import { AuthService } from '@gofish/shared/services/auth.service';
import { AvatarService } from '@gofish/shared/services/avatar.service';
import { firstValueFrom } from 'rxjs';

/**
 * Popover component displayed for authenticated user actions in the header.
 *
 * Responsibilities:
 * - Display user-related navigation options
 * - Fetch and display the user's avatar
 * - Provide sign-out functionality
 * - Close automatically when clicking outside the popover
 */
@Component({
  selector: 'gf-user-popover',
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
    RouterLink
  ],
  templateUrl: './user-popover.component.html',
  styleUrl: './user-popover.component.css',
})
export class UserPopoverComponent {
  /** Unique key used to identify this popup instance. */
  static readonly Key = 'header-user-popover';

  /** Service used to access authentication state and user data. */
  readonly authService = inject(AuthService);

  /** API used to retrieve user profile data. */
  readonly userProfileApi = inject(UserProfileApi);

  /** Service used to resolve avatar image URLs. */
  readonly avatarService = inject(AvatarService);

  /** Router instance used for navigation actions. */
  readonly router = inject(Router);

  /** Controller used to manage the popup open and close state. */
  readonly popupController = new PopupController(UserPopoverComponent.Key);

  /** Shared route path constants used in templates. */
  readonly Path = Path;

  /** Shared route path segment constants used in templates. */
  readonly PathSegment = PathSegment;

  /**
   * Reactive resource used to fetch the user's avatar URL.
   * Automatically reloads when the authenticated user changes.
   */
  avatarUrl = resource({
    params: () => this.authService.userId()!,
    loader: ({ params: id }) => firstValueFrom(this.userProfileApi.getUserAvatar(id))
  });

  /**
   * Signs out the current user and closes the popover.
   */
  onSignOutClick() {
    this.authService.signOut();
    this.popupController.close();
  }
}

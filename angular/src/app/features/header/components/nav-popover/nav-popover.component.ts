// nav-popover.component.ts

import { CommonModule } from '@angular/common';
import { Component, inject } from '@angular/core';
import { Router, RouterLink, RouterLinkActive } from '@angular/router';
import { UserProfileApi } from '@gofish/shared/api/user-profile.api';
import { Path, PathSegment } from '@gofish/shared/constants';
import { PopupController } from '@gofish/shared/core/popup-controller';
import { ClickOutsideDirective } from '@gofish/shared/directives/click-outside.directive';
import { AuthService } from '@gofish/shared/services/auth.service';

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
    '(clickOutside)':"popupController.close()"
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
  static readonly Key = 'header-nav-popover';

  readonly authService    = inject(AuthService);
  readonly userProfileApi = inject(UserProfileApi);
  readonly router         = inject(Router);

  readonly popupController = new PopupController(NavPopoverComponent.Key);

  readonly Path        = Path;
  readonly PathSegment = PathSegment;
}

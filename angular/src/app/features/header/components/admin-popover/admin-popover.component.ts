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
    '(clickOutside)':"popupController.close()"
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
  static readonly Key = 'header-admin-popover';

  readonly authService    = inject(AuthService);
  readonly userProfileApi = inject(UserProfileApi);
  readonly router         = inject(Router);

  readonly popupController = new PopupController(AdminPopoverComponent.Key);

  readonly Path        = Path;
  readonly PathSegment = PathSegment;
}

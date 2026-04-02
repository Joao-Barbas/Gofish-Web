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
    '(clickOutside)':"popupController.close()"
  },
  imports: [
    CommonModule,
    RouterLink
  ],
  templateUrl: './user-popover.component.html',
  styleUrl: './user-popover.component.css',
})
export class UserPopoverComponent {
  static readonly Key = 'header-user-popover';

  readonly authService    = inject(AuthService);
  readonly userProfileApi = inject(UserProfileApi);
  readonly avatarService  = inject(AvatarService);
  readonly router         = inject(Router);

  readonly popupController = new PopupController(UserPopoverComponent.Key);

  readonly Path        = Path;
  readonly PathSegment = PathSegment;

  avatarUrl = resource({
    params: () => this.authService.userId()!,
    loader: ({ params: id }) => firstValueFrom(this.userProfileApi.getUserAvatar(id))
  })

  onSignOutClick() {
    this.authService.signOut();
    this.popupController.close();
  }
}

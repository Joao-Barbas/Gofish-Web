// profile-actions-popover.component.ts

import { CommonModule } from '@angular/common';
import { Component, inject } from '@angular/core';
import { Router, RouterLink } from '@angular/router';
import { ProfileShowMoreModalComponent } from '@gofish/features/user/profile/pages/overview/components/profile-show-more-modal/profile-show-more-modal.component';
import { ProfileContext } from '@gofish/features/user/profile/services/profile-context.service';
import { UserApi } from '@gofish/shared/api/user.api';
import { Path, ProfileFriendsTab, ProfileGroupsTab } from '@gofish/shared/constants';
import { toast } from 'ngx-sonner';
import { PopoverController, PopoverKey } from '@gofish/shared/core/popover-controller';
import { ClickOutsideDirective } from '@gofish/shared/directives/click-outside.directive';
import { FriendshipState } from '@gofish/shared/enums/friendship-state.enum';
import { ModalService } from '@gofish/shared/services/modal.service';
import { InviteToGroupsModalComponent } from '@gofish/shared/components/invite-to-groups-modal/invite-to-groups-modal.component';

@Component({
  selector: 'gf-profile-actions-popover',
  hostDirectives: [
    {
      directive: ClickOutsideDirective,
      outputs: ['clickOutside'],
    }
  ],
  host: {
    'animate.enter': "on-enter",
    'animate.leave': "on-leave",
    '(clickOutside)':"controller.close()"
  },
  imports: [
    CommonModule
  ],
  templateUrl: './profile-actions-popover.component.html',
  styleUrl: './profile-actions-popover.component.css',
})
export class ProfileActionsPopoverComponent {
  static readonly Key: PopoverKey = 'gf-profile-actions-popover';

  readonly modalService    = inject(ModalService);
  readonly profileContext  = inject(ProfileContext);
  readonly userApi         = inject(UserApi);
  readonly router          = inject(Router);

  readonly controller = new PopoverController(ProfileActionsPopoverComponent.Key);

  readonly Path = Path;
  readonly FriendshipState = FriendshipState;
  readonly toast = toast;

  onUnfriend() {
    this.controller.close();
    let friendship = this.profileContext.userProfile().friendship;
    if (!friendship) return;
    this.userApi.deleteFriendship(friendship.id).subscribe({
      next: () => {
        this.profileContext.unfriend();
        this.toast.info(`You are no longer friends with ${this.profileContext.userProfile().userName}`);
      },
      error: () => {
        this.toast.error('Something went wrong while trying to unfriend');
      }
    });
  }

  onFriendshipCancel() {
    this.controller.close();
    let friendship = this.profileContext.userProfile().friendship;
    if (!friendship) return;
    this.userApi.deleteFriendship(friendship.id).subscribe({
      next: () => {
        this.profileContext.unfriend();
        this.toast.info(`You are no longer seeking friendship with ${this.profileContext.userProfile().userName}`);
      },
      error: () => {
        this.toast.error('Something went wrong while trying to cancel friendship request');
      }
    });
  }

  onFriends() {
    this.controller.close();
    this.router.navigate([Path.PROFILE_FRIENDS(this.profileContext.userProfileId())]);
  }

  onPins() {
    this.controller.close();
    this.router.navigate([Path.PROFILE_PINS(this.profileContext.userProfileId())]);
  }

  onGroups() {
    this.controller.close();
    this.router.navigate([Path.PROFILE_GROUPS(this.profileContext.userProfileId())]);
  }

  onShowMore() {
    this.controller.close();
    this.modalService.open(ProfileShowMoreModalComponent.Key)
  }

  onInviteToGroup() {
    this.controller.close();
    this.modalService.open(InviteToGroupsModalComponent.Key);
  }

  onFriendRequests() {
    this.controller.close();
    this.router.navigate(
      [Path.PROFILE_FRIENDS(this.profileContext.userProfileId())],
      { queryParams: { tab: ProfileFriendsTab.REQUESTS } }
    );
  }

  onGroupInvites() {
    this.controller.close();
    this.router.navigate(
      [Path.PROFILE_GROUPS(this.profileContext.userProfileId())],
      { queryParams: { tab: ProfileGroupsTab.INVITES } }
    );
  }
}

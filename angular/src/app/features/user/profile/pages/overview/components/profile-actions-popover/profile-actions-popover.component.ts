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

/**
 * Popover component that exposes profile-related actions for the current user profile.
 *
 * Responsibilities:
 * - Display profile action shortcuts
 * - Handle friendship actions such as unfriend and cancel request
 * - Navigate to profile sections such as friends, pins, and groups
 * - Open related modals for profile details and group invites
 */
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
  /** Unique key used to identify this popover instance. */
  static readonly Key: PopoverKey = 'gf-profile-actions-popover';

  /** Service used to open and manage modals. */
  readonly modalService    = inject(ModalService);

  /** Profile context service for accessing current profile state. */
  readonly profileContext  = inject(ProfileContext);

  /** API used to manage user-related actions. */
  readonly userApi         = inject(UserApi);

  /** Router instance used for profile navigation actions. */
  readonly router          = inject(Router);

  /** Controller used to manage the open and close state of the popover. */
  readonly controller = new PopoverController(ProfileActionsPopoverComponent.Key);

  /** Shared route path constants used in templates and navigation. */
  readonly Path = Path;

  /** Friendship state enum exposed to the template. */
  readonly FriendshipState = FriendshipState;

  /** Toast API exposed to the component and template. */
  readonly toast = toast;

  /**
   * Removes the current friendship relation with the profile user.
   */
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

  /**
   * Cancels the current pending friendship request.
   */
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

  /**
   * Navigates to the friends section of the current profile.
   */
  onFriends() {
    this.controller.close();
    this.router.navigate([Path.PROFILE_FRIENDS(this.profileContext.userProfileId())]);
  }

  /**
   * Navigates to the pins section of the current profile.
   */
  onPins() {
    this.controller.close();
    this.router.navigate([Path.PROFILE_PINS(this.profileContext.userProfileId())]);
  }

  /**
   * Navigates to the groups section of the current profile.
   */
  onGroups() {
    this.controller.close();
    this.router.navigate([Path.PROFILE_GROUPS(this.profileContext.userProfileId())]);
  }

  /**
   * Opens the modal with additional profile information.
   */
  onShowMore() {
    this.controller.close();
    this.modalService.open(ProfileShowMoreModalComponent.Key)
  }

  /**
   * Opens the modal used to invite the profile user to a group.
   */
  onInviteToGroup() {
    this.controller.close();
    this.modalService.open(InviteToGroupsModalComponent.Key);
  }

  /**
   * Navigates to the profile friends page with the requests tab selected.
   */
  onFriendRequests() {
    this.controller.close();
    this.router.navigate(
      [Path.PROFILE_FRIENDS(this.profileContext.userProfileId())],
      { queryParams: { tab: ProfileFriendsTab.REQUESTS } }
    );
  }

  /**
   * Navigates to the profile groups page with the invites tab selected.
   */
  onGroupInvites() {
    this.controller.close();
    this.router.navigate(
      [Path.PROFILE_GROUPS(this.profileContext.userProfileId())],
      { queryParams: { tab: ProfileGroupsTab.INVITES } }
    );
  }
}

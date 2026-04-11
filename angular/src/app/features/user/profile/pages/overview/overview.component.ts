// overview.component.ts

import { Component, computed, effect, ElementRef, inject, resource, signal, viewChild } from '@angular/core';
import { ProfileContext } from '@gofish/features/user/profile/services/profile-context.service';
import { UserProfileApi } from '@gofish/shared/api/user-profile.api';
import { UserApi } from '@gofish/shared/api/user.api';
import { AuthService } from '@gofish/shared/services/auth.service';
import { finalize, firstValueFrom, forkJoin } from 'rxjs';
import { LoadingSpinnerComponent } from "@gofish/shared/components/loading-spinner/loading-spinner.component";
import { AvatarService } from '@gofish/shared/services/avatar.service';
import { AsyncButtonComponent } from "@gofish/shared/components/async-button-2/async-button-2.component";
import { BusyState } from '@gofish/shared/core/busy-state';
import { FriendshipDTO } from '@gofish/shared/dtos/user.dto';
import { Router, RouterLink } from '@angular/router';
import { toast } from 'ngx-sonner';
import { FriendshipState } from '@gofish/shared/enums/friendship-state.enum';
import { SmallFriendshipCarouselCardComponent } from "./components/small-friendship-carousel-card/small-friendship-carousel-card.component";
import { CommonModule } from '@angular/common';
import { ProfileActionsPopoverComponent } from "./components/profile-actions-popover/profile-actions-popover.component";
import { SmallGroupCarouselCardComponent } from "./components/small-group-carousel-card/small-group-carousel-card.component";
import { LoadingErrorModalComponent } from "@gofish/shared/components/loading-error-modal/loading-error-modal.component";
import { Path } from '@gofish/shared/constants';
import { UserRankIconComponent } from "@gofish/shared/components/user-rank-icon/user-rank-icon.component";
import { UserTitleComponent } from "@gofish/shared/components/user-title/user-title.component";
import { PopoverService } from '@gofish/shared/services/popover.service';
import { ModalService } from '@gofish/shared/services/modal.service';
import { ProfileShowMoreModalComponent } from '@gofish/features/user/profile/pages/overview/components/profile-show-more-modal/profile-show-more-modal.component';
import { rxResource } from '@angular/core/rxjs-interop';
import { InviteToGroupsModalComponent } from '@gofish/shared/components/invite-to-groups-modal/invite-to-groups-modal.component';
import { PinApi } from '@gofish/shared/api/pin.api';
import { ProfileCatchPinCardComponent } from "./components/profile-catch-pin-card/profile-catch-pin-card.component";

/**
 * Profile overview page component.
 *
 * Responsibilities:
 * - Load aggregated overview data for the selected profile
 * - Expose friends, groups, and pins to the template
 * - Manage UI state for bio collapsing and overflow detection
 * - Handle friendship and profile action interactions
 * - Open related popovers and modals
 */
@Component({
  selector: 'app-overview',
  imports: [
    LoadingSpinnerComponent,
    AsyncButtonComponent,
    RouterLink,
    SmallFriendshipCarouselCardComponent,
    CommonModule,
    ProfileActionsPopoverComponent,
    SmallGroupCarouselCardComponent,
    LoadingErrorModalComponent,
    UserRankIconComponent,
    UserTitleComponent,
    ProfileShowMoreModalComponent,
    InviteToGroupsModalComponent,
    ProfileCatchPinCardComponent
  ],
  templateUrl: './overview.component.html',
  styleUrl: './overview.component.css',
})
export class OverviewComponent {
  /** API used to retrieve user-related data. */
  readonly userApi = inject(UserApi);

  /** API used to retrieve pin-related data. */
  readonly pinApi = inject(PinApi);

  /** API used to retrieve profile-specific data. */
  readonly userProfileApi = inject(UserProfileApi);

  /** Profile context used to access the currently viewed profile. */
  readonly profileContext = inject(ProfileContext);

  /** Service used to access authentication state. */
  readonly authService = inject(AuthService);

  /** Service used to resolve avatar image URLs. */
  readonly avatarService = inject(AvatarService);

  /** Service used to control popover visibility. */
  readonly popoverService = inject(PopoverService);

  /** Service used to control modal visibility. */
  readonly modalService = inject(ModalService);

  /** Router instance used for navigation actions. */
  readonly router = inject(Router);

  /** Busy state used while async actions are in progress. */
  readonly busyState = new BusyState();

  /** Shared route path constants used in templates and navigation. */
  readonly Path = Path;

  /** Friendship state enum exposed to the template. */
  readonly FriendshipState = FriendshipState;

  /** Exposes the invite-to-group modal component to the template. */
  readonly InviteToGroupModalComponent = InviteToGroupsModalComponent;

  /** Exposes the profile actions popover component to the template. */
  readonly ProfileActionsPopoverComponent = ProfileActionsPopoverComponent;

  /** Exposes the profile show-more modal component to the template. */
  readonly ProfileShowMoreModalComponent = ProfileShowMoreModalComponent;

  /**
   * Reactive resource used to load the profile overview data.
   *
   * Loaded data:
   * - Accepted friendships
   * - User groups
   * - User pins
   */
  overviewData = rxResource({
    params: () => this.profileContext.userProfileId(),
    stream: ({ params: id }) => forkJoin({
      friends: this.userApi.getFriendships({ userId: id, state: FriendshipState.Accepted, maxResults: 8 }),
      groups: this.userApi.getUserGroups({ userId: id, maxResults: 8 }),
      pins: this.pinApi.getPins({ ids: [{ authorId: id }], dataRequest: { includeDetails: true, includeStats: true, includeUgc: true, IncludeInformation: false, IncludeWarning: false }, maxResults: 50 })
    })
  });

  /** Reference to the bio text container element. */
  bioTextRef = viewChild<ElementRef>('bioText');

  /** Reference to the bio toggle element. */
  bioToggleRef = viewChild<ElementRef>('bioToggle');

  /** Reference to the friends carousel container. */
  friendsCarouselRef = viewChild<ElementRef>('friendsCarousel');

  /** Reference to the groups carousel container. */
  groupsCarouselRef = viewChild<ElementRef>('groupsCarousel');

  /** Indicates whether the bio is currently collapsed. */
  bioCollapsed = signal(true);

  /** Indicates whether the bio content overflows its container. */
  bioOverflows = signal(false);

  /** Stores friendship entries used in the overview UI. */
  friendshipList = signal<FriendshipDTO[]>([]);

  /**
   * Initializes reactive UI behavior for bio overflow detection.
   */
  constructor() {
    effect(() => {
      const el = this.bioTextRef();
      if (el) this.bioOverflows.set(el.nativeElement.scrollHeight > el.nativeElement.clientHeight);
    });
  }

  // Events

  /**
   * Sends a friendship request to the currently viewed profile.
   */
  onSendFriendshipRequest(): void {
    this.busyState.setBusy(true);
    this.userApi.requestFriendship({
      receiverId: this.profileContext.userProfileId() // Also userId
    }).pipe(finalize(() => {
      this.busyState.setBusy(false);
    })).subscribe({
      next: (res) => {
        this.profileContext.befriends(res);
      },
      error: (err) => {
        toast.error('Something went wrong. Try again later.');
      }
    });
  }

  /**
   * Toggles the profile actions popover.
   *
   * @param event DOM event that triggered the action
   */
  onProfilePopoverClick(event: Event): void {
    this.popoverService.toggle(ProfileActionsPopoverComponent.Key);
    event.stopPropagation();
  }

  /**
   * Reloads the page after confirming the error modal.
   */
  onErrorModalPositive() {
    window.location.reload();
  }

  /**
   * Navigates back to the home page after declining the error modal.
   */
  onErrorModalNegative() {
    this.router.navigate([Path.HOME]);
  }

  // End events
}

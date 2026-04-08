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
  readonly userApi = inject(UserApi);
  readonly pinApi = inject(PinApi);
  readonly userProfileApi = inject(UserProfileApi);
  readonly profileContext = inject(ProfileContext);
  readonly authService = inject(AuthService);
  readonly avatarService = inject(AvatarService);
  readonly popoverService = inject(PopoverService);
  readonly modalService = inject(ModalService);
  readonly router = inject(Router);

  readonly busyState = new BusyState();
  readonly Path = Path;
  readonly FriendshipState = FriendshipState;
  readonly InviteToGroupModalComponent = InviteToGroupsModalComponent;
  readonly ProfileActionsPopoverComponent = ProfileActionsPopoverComponent;
  readonly ProfileShowMoreModalComponent = ProfileShowMoreModalComponent;

  overviewData = rxResource({
    params: () => this.profileContext.userProfileId(),
    stream: ({ params: id }) => forkJoin({
      friends: this.userApi.getFriendships({ userId: id, state: FriendshipState.Accepted, maxResults: 8 }),
      groups: this.userApi.getUserGroups({ userId: id, maxResults: 8 }),
      pins: this.pinApi.getPins({ ids: [{ authorId: id }], dataRequest: { includeDetails: true, includeStats: true, includeUgc: true, IncludeInformation: false, IncludeWarning: false }, maxResults: 50 })
  })});

  bioTextRef         = viewChild<ElementRef>('bioText');
  bioToggleRef       = viewChild<ElementRef>('bioToggle');
  friendsCarouselRef = viewChild<ElementRef>('friendsCarousel');
  groupsCarouselRef  = viewChild<ElementRef>('groupsCarousel');

  bioCollapsed = signal(true);
  bioOverflows = signal(false);

  friendshipList = signal<FriendshipDTO[]>([]);

  constructor() {
    effect(() => {
      const el = this.bioTextRef();
      if (el) this.bioOverflows.set(el.nativeElement.scrollHeight > el.nativeElement.clientHeight);
    });
  }

  // Events

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

  onProfilePopoverClick(event: Event): void {
    this.popoverService.toggle(ProfileActionsPopoverComponent.Key);
    event.stopPropagation();
  }

  onErrorModalPositive() {
    window.location.reload();
  }

  onErrorModalNegative() {
    this.router.navigate([Path.HOME]);
  }

  // End events
}

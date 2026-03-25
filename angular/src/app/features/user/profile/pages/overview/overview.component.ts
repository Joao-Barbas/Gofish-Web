// overview.component.ts

import { Component, computed, effect, ElementRef, inject, resource, signal, viewChild } from '@angular/core';
import { ProfileContext } from '@gofish/features/user/profile/services/profile-context.service';
import { UserProfileApi } from '@gofish/shared/api/user-profile.api';
import { UserApi } from '@gofish/shared/api/user.api';
import { AuthService } from '@gofish/shared/services/auth.service';
import { finalize, firstValueFrom } from 'rxjs';
import { LoadingSpinnerComponent } from "@gofish/shared/components/loading-spinner/loading-spinner.component";
import { AvatarService } from '@gofish/shared/services/avatar.service';
import { AsyncButtonComponent } from "@gofish/shared/components/async-button-2/async-button-2.component";
import { BusyState } from '@gofish/shared/core/busy-state';
import { FriendshipDTO } from '@gofish/shared/dtos/user.dto';
import { RouterLink } from '@angular/router';
import { toast } from 'ngx-sonner';
import { FriendshipState } from '@gofish/shared/enums/friendship-state.enum';
import { SmallFriendshipCarouselCardComponent } from "./components/small-friendship-carousel-card/small-friendship-carousel-card.component";
import { CommonModule } from '@angular/common';
import { PopupService } from '@gofish/shared/services/popup.service';
import { ProfileActionsPopoverComponent } from "./components/profile-actions-popover/profile-actions-popover.component";
import { SmallGroupCarouselCardComponent } from "./components/small-group-carousel-card/small-group-carousel-card.component";

@Component({
  selector: 'app-overview',
  imports: [
    LoadingSpinnerComponent,
    AsyncButtonComponent,
    RouterLink,
    SmallFriendshipCarouselCardComponent,
    CommonModule,
    ProfileActionsPopoverComponent,
    SmallGroupCarouselCardComponent
],
  templateUrl: './overview.component.html',
  styleUrl: './overview.component.css',
})
export class OverviewComponent {
  readonly userApi        = inject(UserApi);
  readonly userProfileApi = inject(UserProfileApi);
  readonly profileContext = inject(ProfileContext);
  readonly authService    = inject(AuthService);
  readonly avatarService  = inject(AvatarService);
  readonly popupService   = inject(PopupService);

  readonly busyState = new BusyState();

  readonly hasProfileActions = computed(() =>
    // Add more conditions here with || as new actions are introduced
    this.profileContext.isFriend()
  );

  userProfile = resource({
    params: () => this.profileContext.profileId(),
    loader: ({ params: id }) => firstValueFrom(this.userProfileApi.getUserProfile(id))
  });

  userFriends = resource({
    params: () => this.profileContext.profileId(),
    loader: ({ params: id }) => firstValueFrom(this.userApi.getFriendships({ userId: id, state: FriendshipState.Accepted, maxResults: 8 }))
  })

  userGroups = resource({
    params: () => this.profileContext.profileId(),
    loader: ({ params: id }) => firstValueFrom(this.userApi.getUserGroups({ userId: id, maxResults: 8 }))
  })

  bioTextRef         = viewChild<ElementRef>('bioText');
  bioToggleRef       = viewChild<ElementRef>('bioToggle');
  friendsCarouselRef = viewChild<ElementRef>('friendsCarousel');
  groupsCarouselRef  = viewChild<ElementRef>('groupsCarousel');

  bioCollapsed = signal(true);
  bioOverflows = signal(false);

  friendshipList   = signal<FriendshipDTO[]>([]);
  isFriendshipSent = signal(false);

  constructor() {
    effect(() => {
      const el = this.bioTextRef();
      if (el) this.bioOverflows.set(el.nativeElement.scrollHeight > el.nativeElement.clientHeight);
    });
  }

  // Events

  onSendFriendshipRequest(): void {
    if (!this.userProfile.hasValue()) return;
    if (!this.userProfile.value().userId) return;

    this.busyState.setBusy(true);
    this.userApi.requestFriendship({
      receiverId: this.userProfile.value().userId
    }).pipe(finalize(() => {
      this.busyState.setBusy(false);
    })
    ).subscribe({
      next: () => {
        this.isFriendshipSent.set(true);
      },
      error: (err) => {
        toast.error('Something went wrong. Try again later');
      }
    });
  }

  onProfilePopoverClick(event: Event): void {
    this.popupService.toggle('gf-profile-actions-popover');
    event.stopPropagation();
  }

  // End events

}

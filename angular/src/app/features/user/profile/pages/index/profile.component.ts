// profile.component.ts

import { RouterLink } from '@angular/router';
import { AfterRenderOptions, AfterViewInit, Component, ElementRef, afterRenderEffect, computed, effect, inject, signal, viewChild } from '@angular/core';
import { FlatHeaderComponent } from "@gofish/features/header/flat-header/flat-header.component";
import { FooterComponent } from "@gofish/features/footer/footer.component";
import { Path, PathSegment } from '@gofish/shared/constants';
import { AsyncButtonComponent } from "@gofish/shared/components/async-button-2/async-button-2.component";
import { FriendCardComponent } from "./components/friend-card/friend-card.component";
import { GroupCardComponent } from '@gofish/features/user/profile/pages/index/components/group-card/group-card.component';
import { UserApi } from '@gofish/shared/api/user.api';
import { UserProfileApi } from '@gofish/shared/api/user-profile.api';
import { AuthService } from '@gofish/shared/services/auth.service';
import { LoadingState } from '@gofish/shared/core/loading-state';
import { BusyState } from '@gofish/shared/core/busy-state';
import { HttpErrorResponse } from '@angular/common/http';
import { GetUserProfileResDTO } from '@gofish/shared/dtos/user-profile.dto';
import { FriendshipDTO, FriendshipUserDTO, GetFriendshipsResDTO } from '@gofish/shared/dtos/user.dto';

@Component({
  selector: 'app-profile',
  imports: [
    FlatHeaderComponent,
    FooterComponent,
    RouterLink,
    AsyncButtonComponent,
    FriendCardComponent,
    GroupCardComponent
  ],
  templateUrl: './profile.component.html',
  styleUrl: './profile.component.css',
})
export class ProfileComponent {
  readonly defaultAvatar = 'assets/vectors/avatar-template-dark.clr.svg';

  private readonly userApi        = inject(UserApi);
  private readonly userProfileApi = inject(UserProfileApi);
  readonly authService            = inject(AuthService);

  readonly loadingState: LoadingState = new LoadingState();
  readonly busyState: BusyState       = new BusyState();

  bioTextRef         = viewChild<ElementRef>('bioText');
  bioToggleRef       = viewChild<ElementRef>('bioToggle');
  friendsCarouselRef = viewChild<ElementRef>('friendsCarousel');
  groupsCarouselRef  = viewChild<ElementRef>('groupsCarousel');

  public bioCollapsed = signal(true);
  public bioOverflows = signal(false);

  public Path        = Path;
  public PathSegment = PathSegment;

  readonly friendsList    = signal<FriendshipDTO[] | null>(null);
  readonly groupsList     = signal<null>(null);
  readonly userProfile    = signal<GetUserProfileResDTO | null>(null);
  readonly friendshipSent = signal<boolean>(false);

  readonly friendsListLoadingState = new LoadingState();
  readonly groupsListLoadingState  = new LoadingState();

  constructor() {
    this.fetchProfile();

    effect(() => {
      let e = this.friendsCarouselRef();
      if (!e || this.friendsListLoadingState.isReady()) return;
      this.fetchFriendships();
    });

    /* effect(() => {
      let e = this.groupsCarouselRef();
      if (!e || this.groupsListLoadingState.isReady()) return;
      this.fetchGroups();
    }); */

    effect(() => {
      const el = this.bioTextRef();
      if (el) this.bioOverflows.set(el.nativeElement.scrollHeight > el.nativeElement.clientHeight);
    });
  }

  // Api calls

  fetchProfile() {
    this.loadingState.start();
    this.userProfileApi.getUserProfile(this.authService.userId()!).subscribe({
      next: (res: GetUserProfileResDTO) => {
        this.userProfile.set(res);
        this.loadingState.success();
      },
      error: (err: HttpErrorResponse) => {
        this.loadingState.fail('Something went wrong.');
      }
    })
  }

  fetchFriendships() {
    this.friendsListLoadingState.start();
    this.userApi.getFriendships({
      includeFriends: true,
      maxResults: 8,
    }).subscribe({
      next: (res: GetFriendshipsResDTO) => {
        this.friendsList.set(res.friendships);
        this.friendsListLoadingState.success();
      },
      error: (err: HttpErrorResponse) => {
        this.friendsListLoadingState.fail('Something went wrong.');
      }
    });
  }

  fetchGroups() {}

  // End api calls
  // Dom events

  onFriendRequest() {
    this.busyState.setBusy(true);
    this.userApi.requestFriendship(this.userProfile()?.userId!).subscribe({
      next: (res) => {
        this.busyState.setBusy(false);
        this.friendshipSent.set(true);
      },
      error: (err) => {
        this.busyState.setBusy(false);
      }
    })
  }

  onEditProfile() {

  }

  // End dom event

  trackByCompositeKey(item: FriendshipDTO): string {
    return `${item.requesterUserId}-${item.receiverUserId}`;
  }

  getOtherUser(friendship: FriendshipDTO): FriendshipUserDTO {
    return friendship.requesterUserId === this.authService.userId()
      ? friendship.receiver!
      : friendship.requester!;
  }

  readonly displayName = computed(() => {
    const p = this.userProfile();
    return `${p?.firstName ?? ''} ${p?.lastName ?? ''}`.trim();
  });
}


/*

// profile.store.ts
@Injectable()
export class ProfileStore {
  readonly userProfile = signal<GetUserProfileResDTO | null>(null);
  readonly friendsList = signal<FriendshipDTO[] | null>(null);
  // ...load methods here
}

*/

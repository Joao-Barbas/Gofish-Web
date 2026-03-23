// friends.component.ts

import { JsonPipe } from '@angular/common';
import { HttpErrorResponse } from '@angular/common/http';
import { Component, effect, inject, input, resource, signal } from '@angular/core';
import { RouterLink } from '@angular/router';
import { ProfileContext } from '@gofish/features/user/profile/services/profile-context.service';
import { UserApi } from '@gofish/shared/api/user.api';
import { LoadingState } from '@gofish/shared/core/loading-state';
import { FriendshipDTO, GetFriendshipsReqDTO, GetFriendshipsResDTO } from '@gofish/shared/dtos/user.dto';
import { FriendshipState } from '@gofish/shared/enums/friendship-state.enum';
import { AuthService } from '@gofish/shared/services/auth.service';
import { firstValueFrom } from 'rxjs';
import { FriendshipCardComponent } from "../../components/friendship-card/friendship-card.component";

@Component({
  selector: 'app-friends',
  imports: [
    RouterLink,
    FriendshipCardComponent
],
  templateUrl: './friends.component.html',
  styleUrl: './friends.component.css',
})
export class FriendsComponent {
  readonly activeTab = input<string | undefined>(undefined, { alias: 'tab' }); // Signal-based input given from ?tab=

  readonly userApi        = inject(UserApi);
  readonly profileContext = inject(ProfileContext);
  readonly authService    = inject(AuthService);

  private readonly pageSize = 20;

  readonly moreFriendsLoading  = new LoadingState();
  readonly moreRequestsLoading = new LoadingState();

  friendsCursor   = signal<string | undefined>(undefined);
  requestsCursor  = signal<string | undefined>(undefined);
  friendsHasMore  = signal(true);
  requestsHasMore = signal(true);
  friendsList     = signal<FriendshipDTO[]>([]);
  requestsList    = signal<FriendshipDTO[]>([]);

  user = resource({
    params: () => this.profileContext.profileId(),
    loader: ({ params: id }) => firstValueFrom(this.userApi.getUser(id))
  });

  friends = resource({
    params: () => this.activeTab() ?? 'friends' === 'friends' ? this.profileContext.profileId() : undefined,
    loader: ({ params: id }) => firstValueFrom(this.userApi.getFriendships({ userId: id, state: FriendshipState.Accepted, maxResults: 1, lastTimestamp: undefined }))
  });

  requests = resource({
    params: () => this.activeTab() === 'requests' ? this.profileContext.profileId() : undefined,
    loader: ({ params: id }) => firstValueFrom(this.userApi.getFriendships({ userId: id, state: FriendshipState.Pending, maxResults: 1, lastTimestamp: undefined }))
  });

  constructor() {
    effect(() => {
      if (!this.friends.hasValue()) return;
      this.friendsList.set(this.friends.value().friendships);
      this.friendsHasMore.set(this.friends.value().hasMoreResults);
      this.friendsCursor.set(this.friends.value().lastTimestamp);
    })
    effect(() => {
      if (!this.requests.hasValue()) return;
      this.requestsList.set(this.requests.value().friendships);
      this.requestsHasMore.set(this.requests.value().hasMoreResults);
      this.requestsCursor.set(this.requests.value().lastTimestamp);
    })
  }

  loadMoreFriends() {
    let profileId = this.profileContext.profileId();
    this.moreFriendsLoading.start();

    this.userApi.getFriendships({
      userId: profileId,
      state: FriendshipState.Accepted,
      maxResults: 1,
      lastTimestamp: this.friendsCursor()
    }).subscribe({
      next: (res: GetFriendshipsResDTO) => {
        this.friendsList.update(list => [...list, ...res.friendships]);
        this.friendsHasMore.set(res.hasMoreResults);
        this.friendsCursor.set(res.lastTimestamp);
        this.moreFriendsLoading.success();
      },
      error: (err: HttpErrorResponse) => {
        this.moreFriendsLoading.fail('Something went wrong while trying to load friends.');
      }
    })
  }

  loadMoreRequests() {
    let profileId = this.profileContext.profileId();
    this.moreRequestsLoading.start();

    this.userApi.getFriendships({
      userId: profileId,
      state: FriendshipState.Pending,
      maxResults: 1,
      lastTimestamp: this.requestsCursor()
    }).subscribe({
      next: (res: GetFriendshipsResDTO) => {
        this.requestsList.update(list => [...list, ...res.friendships]);
        this.requestsCursor.set(res.lastTimestamp ?? undefined);
        this.requestsHasMore.set(res.hasMoreResults);
        this.moreRequestsLoading.success();
      },
      error: (err: HttpErrorResponse) => {
        this.moreRequestsLoading.fail('Something went wrong while trying to load friend requests.');
      }
    })
  }
}

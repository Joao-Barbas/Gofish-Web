// requests-list.component.ts

import { HttpErrorResponse } from '@angular/common/http';
import { Component, effect, inject, resource, signal } from '@angular/core';
import { FriendshipCardComponent } from '@gofish/features/user/profile/components/friendship-card/friendship-card.component';
import { ProfileContext } from '@gofish/features/user/profile/services/profile-context.service';
import { UserApi } from '@gofish/shared/api/user.api';
import { AsyncButtonComponent } from '@gofish/shared/components/async-button-2/async-button-2.component';
import { BusyState } from '@gofish/shared/core/busy-state';
import { LoadingState } from '@gofish/shared/core/loading-state';
import { FriendshipDTO, GetFriendshipsResDTO } from '@gofish/shared/dtos/user.dto';
import { FriendshipState } from '@gofish/shared/enums/friendship-state.enum';
import { firstValueFrom } from 'rxjs';

@Component({
  selector: 'app-friends-list',
  imports: [
    FriendshipCardComponent,
    AsyncButtonComponent
  ],
  template: `
    @if (friends.isLoading()) {
      <div class="loading-container gf-flow-vertical gf-center-axes">
        <svg animate.enter="spinner-enter" xmlns="http://www.w3.org/2000/svg"
            width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor"
            stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
          <path d="M12 2v4"/><path d="m16.2 7.8 2.9-2.9"/>
          <path d="M18 12h4"/><path d="m16.2 16.2 2.9 2.9"/>
          <path d="M12 18v4"/><path d="m4.9 19.1 2.9-2.9"/>
          <path d="M2 12h4"/><path d="m4.9 4.9 2.9 2.9"/>
        </svg>
        <span>Loading...</span>
      </div>
    }
    @if (friends.hasValue()) {
      <div class="list">
        @for (friend of friendsList(); track friend.id) {
          <app-friendship-card
            [friendship]="friend"
            [small]="false"
            [actions]="false"
          ></app-friendship-card>
        } @empty {
          @if (!friends.isLoading() && !loadingState.isLoading()) {
            <p>{{ 'No friends yet. :(' }}</p>
          }
        }
      </div>
      @if (loadingState.isLoading()) {
        <div class="loading-container gf-flow-vertical gf-center-axes">
          <svg animate.enter="spinner-enter" xmlns="http://www.w3.org/2000/svg"
              width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor"
              stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
            <path d="M12 2v4"/><path d="m16.2 7.8 2.9-2.9"/>
            <path d="M18 12h4"/><path d="m16.2 16.2 2.9 2.9"/>
            <path d="M12 18v4"/><path d="m4.9 19.1 2.9-2.9"/>
            <path d="M2 12h4"/><path d="m4.9 4.9 2.9 2.9"/>
          </svg>
          <span>Loading...</span>
        </div>
      } @else if (friendsHasMore()) {
        <gf-async-button
          [labels]="{ idle: 'Load more', busy: 'Loading...' }"
          [states]="{ busy: busyState.isBusy() }"
          (click)="loadMoreFriends()"
        ></gf-async-button>
      }
    }
    @if (friends.error()) {
      <div class="failed-container gf-flow-vertical gf-center-axes">
        <span>{{ friends.error() }}</span>
        <button (click)="friends.reload()">Try Again</button>
      </div>
    }
  `,
  styleUrl: '../../friends.component.css',
})
export class FriendsListComponent {
  readonly profileContext = inject(ProfileContext);
  readonly userApi        = inject(UserApi);

  readonly loadingState  = new LoadingState();
  readonly busyState     = new BusyState();

  friendsCursor  = signal<string | undefined>(undefined);
  friendsHasMore = signal(true);
  friendsList    = signal<FriendshipDTO[]>([]);

  friends = resource({
    params: () => this.profileContext.profileId(),
    loader: ({ params: id }) => firstValueFrom(this.userApi.getFriendships({ userId: id, state: FriendshipState.Accepted, maxResults: 1, lastTimestamp: undefined }))
  });

  constructor() {
    effect(() => {
      if (!this.friends.hasValue()) return;
      this.friendsList.set(this.friends.value().friendships);
      this.friendsHasMore.set(this.friends.value().hasMoreResults);
      this.friendsCursor.set(this.friends.value().lastTimestamp);
    })
  }

  loadMoreFriends() {
    let profileId = this.profileContext.profileId();
    this.loadingState.start();
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
        this.loadingState.success();
      },
      error: (err: HttpErrorResponse) => {
        this.loadingState.fail('Something went wrong while trying to load friends.');
      }
    })
  }
}

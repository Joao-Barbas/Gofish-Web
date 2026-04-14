// requests-list.component.ts

import { HttpErrorResponse } from '@angular/common/http';
import { Component, effect, inject, resource, signal } from '@angular/core';
import { ProfileContext } from '@gofish/features/user/profile/services/profile-context.service';
import { UserApi } from '@gofish/shared/api/user.api';
import { AsyncButtonComponent } from '@gofish/shared/components/async-button-2/async-button-2.component';
import { BusyState } from '@gofish/shared/core/busy-state';
import { LoadingState } from '@gofish/shared/core/loading-state';
import { FriendshipDTO, GetFriendshipsResDTO } from '@gofish/shared/dtos/user.dto';
import { FriendshipState } from '@gofish/shared/enums/friendship-state.enum';
import { firstValueFrom } from 'rxjs';
import { LoadingSpinnerComponent } from "@gofish/shared/components/loading-spinner/loading-spinner.component";
import { FriendshipListCardComponent } from '@gofish/features/user/profile/pages/friends/components/friendship-list-card/friendship-list-card.component';
import { Path } from '@gofish/shared/constants';
import { Router } from '@angular/router';
import { LoadingErrorModalComponent } from "@gofish/shared/components/loading-error-modal/loading-error-modal.component";

@Component({
  selector: 'app-friends-list',
  imports: [
    FriendshipListCardComponent,
    AsyncButtonComponent,
    LoadingSpinnerComponent,
    LoadingErrorModalComponent
],
  templateUrl: './friends-list.component.html',
  styleUrl: './friends-list.component.css',
})
export class FriendsListComponent {
  readonly profileContext = inject(ProfileContext);
  readonly userApi        = inject(UserApi);
  readonly router         = inject(Router);

  readonly loadingState = new LoadingState();
  readonly busyState    = new BusyState();

  readonly Path = Path;
  readonly window = window;

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
    this.busyState.setBusy(true);
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
        this.busyState.setBusy(false);
      },
      error: (err: HttpErrorResponse) => {
        this.loadingState.fail('Something went wrong while trying to load friends.');
        this.busyState.setBusy(false);
      }
    })
  }
}

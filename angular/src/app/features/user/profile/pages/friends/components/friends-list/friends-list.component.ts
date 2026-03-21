import { HttpErrorResponse } from '@angular/common/http';
import { Component, inject, signal } from '@angular/core';
import { FriendCardComponent } from '@gofish/features/user/profile/pages/friends/components/friend-card/friend-card.component';
import { UserApi } from '@gofish/shared/api/user.api';
import { AsyncButtonComponent } from '@gofish/shared/components/async-button/async-button.component';
import { BusyState } from '@gofish/shared/core/busy-state';
import { LoadingState } from '@gofish/shared/core/loading-state';
import { FriendshipDTO, FriendshipUserDTO, GetFriendshipsResDTO } from '@gofish/shared/dtos/user.dto';
import { AuthService } from '@gofish/shared/services/auth.service';

@Component({
  selector: 'app-friends-list',
  imports: [
    FriendCardComponent,
    AsyncButtonComponent
  ],
  templateUrl: './friends-list.component.html',
  styleUrl: '../../friends.component.css',
})
export class FriendsListComponent {
  private readonly userApi = inject(UserApi);
  private readonly authService = inject(AuthService);

  public readonly loadingState: LoadingState = new LoadingState();
  public readonly busyState: BusyState = new BusyState();

  readonly friendsList = signal<FriendshipDTO[]>([]);
  readonly hasMore = signal(true);

  private lastTimestamp?: string;
  private pageSize: number = 20;

  constructor() {
    this.loadInitial();
  }

  public loadInitial() {
    this.loadingState.start();
    this.fetchFriendships(true);
  }

  public loadMore() {
    this.busyState.setBusy(true);
    this.fetchFriendships(false);
  }

  private fetchFriendships(isInitial: boolean) {
    this.userApi.getFriendships({
      includeFriends: true,
      maxResults: this.pageSize,
      lastTimestamp: this.lastTimestamp
    }).subscribe({
      next: (res: GetFriendshipsResDTO) => {
        if (isInitial) {
          this.friendsList.set(res.friendships);
          this.loadingState.success();
        } else {
          this.friendsList.update(current => [...current, ...res.friendships]);
          this.busyState.setBusy(false);
        }
        this.hasMore.set(res.hasMoreResults);
        this.lastTimestamp = res.friendships.at(-1)?.createdAt;
      },
      error: (err: HttpErrorResponse) => {
        if (isInitial) {
          this.loadingState.fail('Something went wrong while trying to load friends.');
        } else {
          this.busyState.setBusy(false);
        }
      }
    });
  }

  trackByCompositeKey(item: FriendshipDTO): string {
    return `${item.requesterUserId}-${item.receiverUserId}`;
  }

  getOtherUser(friendship: FriendshipDTO): FriendshipUserDTO {
    return friendship.requesterUserId === this.authService.userId()
      ? friendship.receiver!
      : friendship.requester!;
  }
}

import { A } from '@angular/cdk/keycodes';
import { HttpErrorResponse } from '@angular/common/http';
import { Component, inject, signal } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { ProfileContext } from '@gofish/features/user/profile/services/profile-context.service';
import { UserApi } from '@gofish/shared/api/user.api';
import { BusyState } from '@gofish/shared/core/busy-state';
import { LoadingState } from '@gofish/shared/core/loading-state';
import { FriendshipDTO, GetFriendshipsResDTO } from '@gofish/shared/dtos/user.dto';
import { FriendshipState } from '@gofish/shared/enums/friendship-state.enum';
import { GroupsService } from '@gofish/shared/services/groups.service';

@Component({
  selector: 'gf-group-invite',
  imports: [],
  templateUrl: './group-invite.component.html',
  styleUrl: './group-invite.component.css',
})
export class GroupInviteComponent {
  readonly profileContext = inject(ProfileContext);
  private readonly userApi = inject(UserApi);
  private readonly router = inject(Router);
  private readonly route = inject(ActivatedRoute);
  private readonly groupsService = inject(GroupsService);
  readonly loadingState = new LoadingState();
  readonly busyState = new BusyState();
  friendsCursor = signal<string | undefined>(undefined);
  friendsHasMore = signal(true);
  friendsList = signal<FriendshipDTO[]>([]);
  selectedFriendIds = signal<string[]>([]);

  ngOnInit() {
    this.loadMoreFriends();
  }

  toggleFriend(id: string) {
    this.selectedFriendIds.update(ids =>ids.includes(id) ? [] : [id]);
  }

  onScroll(event: any) {
    const element = event.target;
    const atBottom = element.scrollHeight - element.scrollTop <= element.clientHeight + 50;

    if (atBottom && this.friendsHasMore() && !this.busyState.isBusy()) {
      this.loadMoreFriends();
    }
  }


  onCancel() {
    window.history.back();
  }

  onSendInvites() {
    const selectedIds = this.selectedFriendIds();
    const receiverId = selectedIds[0];
    const groupId = Number(this.route.snapshot.params['id']);

    if (!receiverId || !groupId) return;

    this.busyState.setBusy(true);


    this.groupsService.createGroupInvite({
      groupId: groupId,
      receiverUserId: receiverId
    }).subscribe({
      next: () => {
        this.busyState.setBusy(false);
        this.onCancel();
      },
      error: (err: HttpErrorResponse) => {
        this.loadingState.fail(err.error || 'Failed to send invite.');
        this.busyState.setBusy(false);
      }
    });
  }

  private loadMoreFriends() {
    let profileId = this.profileContext.userProfileId();
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

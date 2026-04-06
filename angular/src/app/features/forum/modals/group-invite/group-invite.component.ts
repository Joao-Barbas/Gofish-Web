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
import { AuthService } from '@gofish/shared/services/auth.service';
import { GroupsService } from '@gofish/shared/services/groups.service';

@Component({
  selector: 'gf-group-invite',
  imports: [],
  templateUrl: './group-invite.component.html',
  styleUrl: './group-invite.component.css',
})
export class GroupInviteComponent {
  readonly profileContext = inject(ProfileContext);
  protected readonly authService = inject(AuthService);
  private readonly userApi = inject(UserApi);
  private readonly router = inject(Router);
  private readonly route = inject(ActivatedRoute);
  private readonly groupsService = inject(GroupsService);
  readonly loadingState = new LoadingState();
  readonly busyState = new BusyState();
  groupMemberIds = signal<string[]>([]);
  friendsCursor = signal<string | undefined>(undefined);
  friendsHasMore = signal(true);
  friendsList = signal<FriendshipDTO[]>([]);
  sentInviteIds = signal<string[]>([]);

  ngOnInit() {
    this.loadMoreFriends();
    this.loadGroupMembers();
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

  sendInvite(friendId: string) {
    const groupId = Number(this.route.parent?.snapshot.params['id']);
    if (!groupId || this.busyState.isBusy()) return;

    this.busyState.setBusy(true);

    this.groupsService.createGroupInvite({
      groupId: groupId,
      receiverUserId: friendId
    }).subscribe({
      next: () => {
        this.busyState.setBusy(false);
        this.sentInviteIds.update(ids => [...ids, friendId]);
      },
      error: (err: HttpErrorResponse) => {
        this.busyState.setBusy(false);
        this.loadingState.fail(err.error || 'Failed to send invite.');
      }
    });
  }

  private loadGroupMembers() {
    const groupId = Number(this.route.parent?.snapshot.params['id']);
    console.log('groupId:', groupId);
    this.groupsService.getGroupMembers({ groupId: groupId }).subscribe({
      next: (res) => {
        this.groupMemberIds.set(res.members.map(m => m.userId));
      }
    });
  }

  private loadMoreFriends() {
    const userId = this.profileContext.userProfile()?.userId;
    this.loadingState.start();
    this.busyState.setBusy(true);
    this.userApi.getFriendships({
      userId: userId,
      state: FriendshipState.Accepted,
      maxResults: 10,
      lastTimestamp: this.friendsCursor()
    }).subscribe({
      next: (res: GetFriendshipsResDTO) => {
        console.log('friendships:', res.friendships);
        this.friendsList.update(list => [...list, ...res.friendships]);
        this.friendsHasMore.set(res.hasMoreResults);
        this.friendsCursor.set(res.lastTimestamp);
        this.loadingState.success();
        this.busyState.setBusy(false);
      },
      error: (err: HttpErrorResponse) => {
        this.loadingState.fail('Something went wrong while trying to load friends.' + err.message);
        this.busyState.setBusy(false);
      }
    })
  }
}

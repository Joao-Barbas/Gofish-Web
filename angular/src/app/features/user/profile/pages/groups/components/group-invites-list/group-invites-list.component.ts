import { Component, effect, inject, signal } from '@angular/core';
import { HttpErrorResponse } from '@angular/common/http';
import { Router } from '@angular/router';
import { rxResource } from '@angular/core/rxjs-interop';
import { toast } from 'ngx-sonner';
import { finalize } from 'rxjs';
import { LoadingErrorModalComponent } from "@gofish/shared/components/loading-error-modal/loading-error-modal.component";
import { LoadingSpinnerComponent } from "@gofish/shared/components/loading-spinner/loading-spinner.component";
import { AsyncButtonComponent } from "@gofish/shared/components/async-button-3/async-button-3.component";
import { ProfileContext } from '@gofish/features/user/profile/services/profile-context.service';
import { GroupInvitesCardComponent } from '@gofish/features/user/profile/pages/groups/components/group-invites-card/group-invites-card.component';
import { GroupInviteDTO } from '@gofish/shared/dtos/group.dto';
import { GetGroupInvitesResDTO } from '@gofish/shared/dtos/user.dto';
import { UserApi } from '@gofish/shared/api/user.api';
import { GroupApi } from '@gofish/shared/api/group.api';
import { Path } from '@gofish/shared/constants';
import { BusyState } from '@gofish/shared/core/busy-state';
import { FriendshipState } from '@gofish/shared/enums/friendship-state.enum';

@Component({
  selector: 'gf-group-invites-list',
  imports: [LoadingErrorModalComponent, LoadingSpinnerComponent, GroupInvitesCardComponent, AsyncButtonComponent],
  templateUrl: './group-invites-list.component.html',
  styleUrl: './group-invites-list.component.css',
})
export class GroupInvitesListComponent {
  readonly profileContext = inject(ProfileContext);
  readonly userApi        = inject(UserApi);
  readonly groupApi       = inject(GroupApi);
  readonly router         = inject(Router);

  readonly busyState = new BusyState();

  readonly Path = Path;
  readonly window = window;
  readonly toast = toast;

  groupInvitesList    = signal<GroupInviteDTO[]>([]);
  groupInvitesHasMore = signal(true);
  groupInvitesCursor  = signal<string | undefined>(undefined);

  groupInvites = rxResource({
    params: () => this.profileContext.profileId(),
    stream: () => this.userApi.getGroupInvites({ state: FriendshipState.Pending, maxResults: 20, lastTimestamp: undefined })
  });

  constructor() {
    effect(() => {
      if (!this.groupInvites.hasValue()) return;
      this.groupInvitesList.set(this.groupInvites.value().invites);
      this.groupInvitesHasMore.set(this.groupInvites.value().hasMoreResults);
      this.groupInvitesCursor.set(this.groupInvites.value().lastTimestamp);
    })
  }

  loadMoreGroupInvites() {
    this.busyState.setBusy(true);
    this.userApi.getGroupInvites({
      state: FriendshipState.Pending,
      maxResults: 20,
      lastTimestamp: this.groupInvitesCursor()
    }).pipe(finalize(() => {
      this.busyState.setBusy(false);
    })).subscribe({
      next: (res: GetGroupInvitesResDTO) => {
        this.groupInvitesList.update(list => [...list, ...res.invites]);
        this.groupInvitesHasMore.set(res.hasMoreResults);
        this.groupInvitesCursor.set(res.lastTimestamp);
      },
      error: (err: HttpErrorResponse) => {
        this.toast.error('Something went wrong while trying to load group invites. Try again later');
      }
    })
  }

  onGroupInviteDecline(groupInvite: GroupInviteDTO) {
    console.log(groupInvite);
    this.groupInvitesList.update(list => list.filter(f => f.id !== groupInvite.id));
    this.groupApi.ignoreGroupInvite(groupInvite.id).subscribe();
  }
}

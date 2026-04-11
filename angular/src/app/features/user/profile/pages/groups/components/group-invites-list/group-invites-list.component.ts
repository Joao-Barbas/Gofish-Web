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

/**
 * Displays the list of pending group invites for the current user.
 *
 * Responsibilities:
 * - Load the initial list of pending group invites
 * - Maintain pagination state for additional invites
 * - Expose invite data to the template
 * - Handle incremental loading and invite decline actions
 */
@Component({
  selector: 'gf-group-invites-list',
  imports: [LoadingErrorModalComponent, LoadingSpinnerComponent, GroupInvitesCardComponent, AsyncButtonComponent],
  templateUrl: './group-invites-list.component.html',
  styleUrl: './group-invites-list.component.css',
})
export class GroupInvitesListComponent {
  /** Profile context used to identify the current profile. */
  readonly profileContext = inject(ProfileContext);

  /** API used to retrieve user-related data such as group invites. */
  readonly userApi = inject(UserApi);

  /** API used to manage group invite actions. */
  readonly groupApi = inject(GroupApi);

  /** Router instance used for navigation actions. */
  readonly router = inject(Router);

  /** Busy state used while loading additional invites. */
  readonly busyState = new BusyState();

  /** Shared route path constants used in templates. */
  readonly Path = Path;

  /** Exposes the global window object to the template if needed. */
  readonly window = window;

  /** Toast API exposed to the component and template. */
  readonly toast = toast;

  /** Stores the currently loaded group invites. */
  groupInvitesList = signal<GroupInviteDTO[]>([]);

  /** Indicates whether more group invites are available to load. */
  groupInvitesHasMore = signal(true);

  /** Cursor used to paginate group invites by timestamp. */
  groupInvitesCursor = signal<string | undefined>(undefined);

  /**
   * Reactive resource used to load the initial batch of pending group invites.
   */
  groupInvites = rxResource({
    params: () => this.profileContext.userProfileId(),
    stream: () => this.userApi.getGroupInvites({ state: FriendshipState.Pending, maxResults: 20, lastTimestamp: undefined })
  });

  /**
   * Synchronizes the loaded resource data into local signals
   * used by the template and pagination flow.
   */
  constructor() {
    effect(() => {
      if (!this.groupInvites.hasValue()) return;
      this.groupInvitesList.set(this.groupInvites.value().invites);
      this.groupInvitesHasMore.set(this.groupInvites.value().hasMoreResults);
      this.groupInvitesCursor.set(this.groupInvites.value().lastTimestamp);
    })
  }

  /**
   * Loads the next batch of pending group invites.
   */
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

  /**
   * Handles the decline action for a specific group invite.
   *
   * @param groupInvite Group invite selected for decline
   */
  onGroupInviteDecline(groupInvite: GroupInviteDTO) {
    console.log(groupInvite);
    this.groupInvitesList.update(list => list.filter(f => f.id !== groupInvite.id));
    this.groupApi.ignoreGroupInvite(groupInvite.id).subscribe();
  }
}

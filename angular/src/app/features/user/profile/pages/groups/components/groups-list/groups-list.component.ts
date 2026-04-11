// groups-list.component.ts

import { HttpErrorResponse } from '@angular/common/http';
import { Component, effect, inject, resource, signal } from '@angular/core';
import { ProfileContext } from '@gofish/features/user/profile/services/profile-context.service';
import { UserApi } from '@gofish/shared/api/user.api';
import { BusyState } from '@gofish/shared/core/busy-state';
import { LoadingState } from '@gofish/shared/core/loading-state';
import { GetUserGroupResDTO, UserGroupDTO } from '@gofish/shared/dtos/user.dto';
import { firstValueFrom } from 'rxjs';
import { GroupListCardComponent } from "../group-list-card/group-list-card.component";
import { LoadingSpinnerComponent } from "@gofish/shared/components/loading-spinner/loading-spinner.component";
import { AsyncButtonComponent } from "@gofish/shared/components/async-button-2/async-button-2.component";
import { LoadingErrorModalComponent } from "@gofish/shared/components/loading-error-modal/loading-error-modal.component";
import { Path } from '@gofish/shared/constants';
import { Router } from '@angular/router';

/**
 * Displays the list of groups associated with the current profile.
 *
 * Responsibilities:
 * - Load the initial list of user groups
 * - Maintain pagination state for additional groups
 * - Expose group data to the template
 * - Track loading and busy states during pagination
 */
@Component({
  selector: 'gf-groups-list',
  imports: [
    GroupListCardComponent,
    LoadingSpinnerComponent,
    AsyncButtonComponent,
    LoadingErrorModalComponent
  ],
  templateUrl: './groups-list.component.html',
  styleUrl: './groups-list.component.css',
})
export class GroupsListComponent {
  /** Profile context used to identify the current profile. */
  readonly profileContext = inject(ProfileContext);

  /** API used to retrieve user-related data such as groups. */
  readonly userApi = inject(UserApi);

  /** Router instance used for navigation actions. */
  readonly router = inject(Router);

  /** Loading state used for UI feedback during pagination. */
  readonly loadingState = new LoadingState();

  /** Busy state used to prevent overlapping load operations. */
  readonly busyState = new BusyState();

  /** Shared route path constants used in templates. */
  readonly Path = Path;

  /** Exposes the global window object to the template if needed. */
  readonly window = window;

  /** Cursor used to paginate groups by timestamp. */
  groupsCursor = signal<string | undefined>(undefined);

  /** Indicates whether more groups are available to load. */
  groupsHasMore = signal(true);

  /** Stores the currently loaded list of groups. */
  groupsList = signal<UserGroupDTO[]>([]);

  /**
   * Reactive resource used to load the initial batch of groups
   * for the current profile.
   */
  groups = resource({
    params: () => this.profileContext.userProfileId(),
    loader: ({ params: id }) => firstValueFrom(this.userApi.getUserGroups({ userId: id, maxResults: 20, lastTimestamp: undefined }))
  });

  /**
   * Synchronizes the loaded resource data into local signals
   * used by the template and pagination flow.
   */
  constructor() {
    effect(() => {
      if (!this.groups.hasValue()) return;
      this.groupsList.set(this.groups.value().groups);
      this.groupsHasMore.set(this.groups.value().hasMoreResults);
      this.groupsCursor.set(this.groups.value().lastTimestamp);
    })
  }

  /**
   * Loads the next batch of groups for the current profile.
   */
  loadMoreGroups() {
    let profileId = this.profileContext.userProfileId();
    this.loadingState.start();
    this.busyState.setBusy(true);
    this.userApi.getUserGroups({
      userId: profileId,
      maxResults: 20,
      lastTimestamp: this.groupsCursor()
    }).subscribe({
      next: (res: GetUserGroupResDTO) => {
        this.groupsList.update(list => [...list, ...res.groups]);
        this.groupsHasMore.set(res.hasMoreResults);
        this.groupsCursor.set(res.lastTimestamp);
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

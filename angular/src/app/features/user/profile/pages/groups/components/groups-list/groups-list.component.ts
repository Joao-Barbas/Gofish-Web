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
  readonly profileContext = inject(ProfileContext);
  readonly userApi        = inject(UserApi);
  readonly router         = inject(Router);

  readonly loadingState = new LoadingState();
  readonly busyState    = new BusyState();

  readonly Path = Path;
  readonly window = window;

  groupsCursor  = signal<string | undefined>(undefined);
  groupsHasMore = signal(true);
  groupsList    = signal<UserGroupDTO[]>([]);

  groups = resource({
    params: () => this.profileContext.profileId(),
    loader: ({ params: id }) => firstValueFrom(this.userApi.getUserGroups({ userId: id, maxResults: 20, lastTimestamp: undefined }))
  });

  constructor() {
    effect(() => {
      if (!this.groups.hasValue()) return;
      this.groupsList.set(this.groups.value().groups);
      this.groupsHasMore.set(this.groups.value().hasMoreResults);
      this.groupsCursor.set(this.groups.value().lastTimestamp);
    })
  }

  loadMoreGroups() {
    let profileId = this.profileContext.profileId();
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

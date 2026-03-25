// groups-list.component.ts

import { HttpErrorResponse } from '@angular/common/http';
import { Component, effect, inject, resource, signal } from '@angular/core';
import { ProfileContext } from '@gofish/features/user/profile/services/profile-context.service';
import { UserApi } from '@gofish/shared/api/user.api';
import { BusyState } from '@gofish/shared/core/busy-state';
import { LoadingState } from '@gofish/shared/core/loading-state';
import { GetUserGroupReqDTO, GetUserGroupResDTO, UserGroupDTO } from '@gofish/shared/dtos/user.dto';
import { firstValueFrom } from 'rxjs';
import { GroupListCardComponent } from "../group-list-card/group-list-card.component";
import { LoadingSpinnerComponent } from "@gofish/shared/components/loading-spinner/loading-spinner.component";
import { AsyncButtonComponent } from "@gofish/shared/components/async-button-2/async-button-2.component";

@Component({
  selector: 'gf-groups-list',
  imports: [
    GroupListCardComponent,
    LoadingSpinnerComponent,
    AsyncButtonComponent
  ],
  template: `
    @if (groups.isLoading()) {
      <gf-loading-spinner></gf-loading-spinner>
    }
    @if (groups.hasValue()) {
      <div class="list">
        @for (group of groupsList(); track group.id) {
          <gf-group-list-card
            [group]="group"
            [actions]="false"
          ></gf-group-list-card>
        } @empty {
          @if (!groups.isLoading() && !loadingState.isLoading()) {
            <p>{{ 'You are not in any group' }}</p>
          }
        }
      </div>
      @if (groupsHasMore()) {
        <gf-async-button
          [labels]="{ idle: 'Load more', busy: 'Loading...' }"
          [states]="{ busy: busyState.isBusy() }"
          (click)="loadMoreGroups()"
        ></gf-async-button>
      }
    }
    @if (groups.error()) {
      <div class="failed-container gf-flow-vertical gf-center-axes">
        <span>{{ groups.error() }}</span>
        <button (click)="groups.reload()">Try Again</button>
      </div>
    }
  `,
  styleUrl: '../../groups.component.css',
})
export class GroupsListComponent {
  readonly profileContext = inject(ProfileContext);
  readonly userApi        = inject(UserApi);

  readonly loadingState = new LoadingState();
  readonly busyState    = new BusyState();

  groupsCursor  = signal<string | undefined>(undefined);
  groupsHasMore = signal(true);
  groupsList    = signal<UserGroupDTO[]>([]);

  groups = resource({
    params: () => this.profileContext.profileId(),
    loader: ({ params: id }) => firstValueFrom(this.userApi.getUserGroups({ userId: id, maxResults: 1, lastTimestamp: undefined }))
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
      maxResults: 1,
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

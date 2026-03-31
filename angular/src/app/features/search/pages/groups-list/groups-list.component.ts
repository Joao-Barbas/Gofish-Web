// groups-list.component.ts

import { HttpErrorResponse } from '@angular/common/http';
import { Component, effect, inject, input, resource, signal } from '@angular/core';
import { GroupApi } from '@gofish/shared/api/group.api';
import { BusyState } from '@gofish/shared/core/busy-state';
import { LoadingState } from '@gofish/shared/core/loading-state';
import { SearchGroupDTO, SearchGroupsResDTO } from '@gofish/shared/dtos/group.dto';
import { firstValueFrom, map, catchError, of } from 'rxjs';
import { GroupsListCardComponent } from "../../components/groups-list-card/groups-list-card.component";
import { LoadingSpinnerComponent } from "@gofish/shared/components/loading-spinner/loading-spinner.component";
import { AsyncButtonComponent } from "@gofish/shared/components/async-button-2/async-button-2.component";

@Component({
  selector: 'gf-groups-list',
  imports: [
    GroupsListCardComponent,
    LoadingSpinnerComponent,
    AsyncButtonComponent
  ],
  templateUrl: './groups-list.component.html',
  styleUrl: './groups-list.component.css',
})
export class GroupsListComponent {
  readonly query = input<string | undefined>(undefined, { alias: 'query' });

  readonly groupApi = inject(GroupApi);

  readonly loadingState = new LoadingState();
  readonly busyState    = new BusyState();

  groupsList    = signal<SearchGroupDTO[]>([]);
  groupsHasMore = signal(true);
  groupsCursor  = signal<string | undefined>(undefined);

  groups = resource({
    params: () => this.query(),
    loader: () => firstValueFrom(
      this.groupApi.searchGroups({
        query: this.query()!,
        maxResults: 20
      }).pipe(
        map(res => res ?? null),
        catchError(() => of(null))
      )
    )
  });

  constructor() {
    effect(() => {
      if (!this.query()) throw new Error('Profile requires a route :id param.');
    });
    effect(() => {
      if (!this.groups.hasValue()) return;
      this.groupsList.set(this.groups.value()?.groups ?? []);
      this.groupsHasMore.set(this.groups.value()?.hasMoreResults ?? false);
      this.groupsCursor.set(this.groups.value()?.lastGroupName ?? undefined);
    });
  }

  loadMoreUsers() {
    this.loadingState.start();
    this.busyState.setBusy(true);
    this.groupApi.searchGroups({
      query: this.query()!,
      maxResults: 20,
      lastGroupName: this.groupsCursor()
    }).subscribe({
      next: (res: SearchGroupsResDTO) => {
        this.groupsList.update(list => [...list, ...res.groups ?? []]);
        this.groupsHasMore.set(res.hasMoreResults ?? false);
        this.groupsCursor.set(res.lastGroupName ?? undefined);
        this.loadingState.success();
        this.busyState.setBusy(false);
      },
      error: (err: HttpErrorResponse) => {
        this.loadingState.fail('Something went wrong while searching.');
        this.busyState.setBusy(false);
      }
    })
  }
}

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

/**
 * Displays a searchable list of groups and supports incremental loading.
 *
 * Responsibilities:
 * - Load groups matching the provided search query
 * - Expose search results to the template
 * - Maintain pagination state for additional results
 * - Track loading and busy states during search operations
 */
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
  /**
   * Search query provided to the component.
   * The input is aliased as "query".
   */
  readonly query = input<string | undefined>(undefined, { alias: 'query' });

  /** API used to search groups. */
  readonly groupApi = inject(GroupApi);

  /** Loading state used for UI feedback during search operations. */
  readonly loadingState = new LoadingState();

  /** Busy state used to prevent overlapping load operations. */
  readonly busyState = new BusyState();

  /** Stores the currently loaded group search results. */
  groupsList = signal<SearchGroupDTO[]>([]);

  /** Indicates whether more search results are available. */
  groupsHasMore = signal(true);

  /** Cursor used to request the next page of results. */
  groupsCursor = signal<string | undefined>(undefined);

  /**
   * Reactive resource used to load the initial group search results
   * whenever the query changes.
   */
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

  /**
   * Initializes reactive effects for query validation and synchronization
   * of loaded resource data into local signals.
   */
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

  /**
   * Loads the next batch of groups using the current pagination cursor.
   */
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
    });
  }
}

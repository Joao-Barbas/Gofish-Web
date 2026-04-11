// users-list.component.ts

import { HttpErrorResponse } from '@angular/common/http';
import { Component, effect, inject, input, resource, signal } from '@angular/core';
import { ProfileContext } from '@gofish/features/user/profile/services/profile-context.service';
import { UserApi } from '@gofish/shared/api/user.api';
import { AsyncButtonComponent } from '@gofish/shared/components/async-button-2/async-button-2.component';
import { BusyState } from '@gofish/shared/core/busy-state';
import { LoadingState } from '@gofish/shared/core/loading-state';
import { FriendshipDTO, GetFriendshipsResDTO, SearchUserDTO, SearchUsersResDTO } from '@gofish/shared/dtos/user.dto';
import { FriendshipState } from '@gofish/shared/enums/friendship-state.enum';
import { catchError, firstValueFrom, map, of } from 'rxjs';
import { LoadingSpinnerComponent } from "@gofish/shared/components/loading-spinner/loading-spinner.component";
import { FriendshipListCardComponent } from '@gofish/features/user/profile/pages/friends/components/friendship-list-card/friendship-list-card.component';
import { UsersListCardComponent } from "@gofish/features/search/components/users-list-card/users-list-card.component";
import { AuthService } from '@gofish/shared/services/auth.service';

/**
 * Displays a searchable list of users and supports incremental loading.
 *
 * Responsibilities:
 * - Load users matching the provided search query
 * - Expose search results to the template
 * - Maintain pagination state for additional results
 * - Track loading and busy states during search operations
 */
@Component({
  selector: 'gf-users-list',
  imports: [
    AsyncButtonComponent,
    LoadingSpinnerComponent,
    UsersListCardComponent
  ],
  templateUrl: './users-list.component.html',
  styleUrl: './users-list.component.css',
})
export class UsersListComponent {
  /**
   * Search query provided to the component.
   * The input is aliased as "query".
   */
  readonly query = input<string | undefined>(undefined, { alias: 'query' });

  /** API used to search users. */
  readonly userApi = inject(UserApi);

  /** Loading state used for UI feedback during search operations. */
  readonly loadingState = new LoadingState();

  /** Busy state used to prevent overlapping load operations. */
  readonly busyState = new BusyState();

  /** Stores the currently loaded user search results. */
  usersList = signal<SearchUserDTO[]>([]);

  /** Indicates whether more search results are available. */
  usersHasMore = signal(true);

  /** Cursor used to request the next page of results. */
  usersCursor = signal<string | undefined>(undefined);

  /**
   * Reactive resource used to load the initial user search results
   * whenever the query changes.
   */
  users = resource({
    params: () => this.query(),
    loader: () => firstValueFrom(
      this.userApi.searchUsers({
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
      if (!this.users.hasValue()) return;
      this.usersList.set(this.users.value()?.users ?? []);
      this.usersHasMore.set(this.users.value()?.hasMoreResults ?? false);
      this.usersCursor.set(this.users.value()?.lastUsername ?? undefined);
    });
  }

  /**
   * Loads the next batch of users using the current pagination cursor.
   */
  loadMoreUsers() {
    this.loadingState.start();
    this.busyState.setBusy(true);

    this.userApi.searchUsers({
      query: this.query()!,
      maxResults: 20,
      lastUsername: this.usersCursor()
    }).subscribe({
      next: (res: SearchUsersResDTO) => {
        this.usersList.update(list => [...list, ...res.users ?? []]);
        this.usersHasMore.set(res.hasMoreResults ?? false);
        this.usersCursor.set(res.lastUsername ?? undefined);
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

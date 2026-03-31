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
  readonly query = input<string | undefined>(undefined, { alias: 'query' }); // Signal-based input given from :id

  readonly userApi     = inject(UserApi);
  readonly authService = inject(AuthService);

  readonly loadingState = new LoadingState();
  readonly busyState    = new BusyState();

  usersList    = signal<SearchUserDTO[]>([]);
  usersHasMore = signal(true);
  usersCursor  = signal<string | undefined>(undefined);

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
    })
  }
}

// requests-list.component.ts

import { HttpErrorResponse } from '@angular/common/http';
import { Component, effect, inject, resource, signal } from '@angular/core';
import { FriendshipCardComponent } from '@gofish/features/user/profile/components/friendship-card/friendship-card.component';
import { ProfileContext } from '@gofish/features/user/profile/services/profile-context.service';
import { UserApi } from '@gofish/shared/api/user.api';
import { AsyncButtonComponent } from '@gofish/shared/components/async-button-2/async-button-2.component';
import { BusyState } from '@gofish/shared/core/busy-state';
import { LoadingState } from '@gofish/shared/core/loading-state';
import { FriendshipDTO, GetFriendshipsResDTO } from '@gofish/shared/dtos/user.dto';
import { FriendshipState } from '@gofish/shared/enums/friendship-state.enum';
import { firstValueFrom } from 'rxjs';
import { LoadingSpinnerComponent } from "@gofish/shared/components/loading-spinner/loading-spinner.component";

@Component({
  selector: 'app-requests-list',
  imports: [
    FriendshipCardComponent,
    AsyncButtonComponent,
    LoadingSpinnerComponent
],
  template: `
    @if (requests.isLoading()) {
      <gf-loading-spinner></gf-loading-spinner>
    }
    @if (requests.hasValue()) {
      <div class="list">
        @for (requests of requestsList(); track requests.id) {
          <app-friendship-card
            [friendship]="requests"
            [small]="false"
            [actions]="true"
          ></app-friendship-card>
        } @empty {
          @if (!requests.isLoading() && !loadingState.isLoading()) {
            <p>{{ 'No requests yet. :(' }}</p>
          }
        }
      </div>
      @if (requestsHasMore()) {
        <gf-async-button
          [labels]="{ idle: 'Load more', busy: 'Loading...' }"
          [states]="{ busy: busyState.isBusy() }"
          (click)="loadMoreFriends()"
        ></gf-async-button>
      }
    }
    @if (requests.error()) {
      <div class="failed-container gf-flow-vertical gf-center-axes">
        <span>{{ requests.error() }}</span>
        <button (click)="requests.reload()">Try Again</button>
      </div>
    }
  `,
  styleUrl: '../../friends.component.css',
})
export class RequestsListComponent {
  readonly profileContext = inject(ProfileContext);
  readonly userApi        = inject(UserApi);

  readonly loadingState = new LoadingState();
  readonly busyState    = new BusyState();

  requestsCursor  = signal<string | undefined>(undefined);
  requestsHasMore = signal(true);
  requestsList    = signal<FriendshipDTO[]>([]);

  requests = resource({
    params: () => this.profileContext.profileId(),
    loader: ({ params: id }) => firstValueFrom(this.userApi.getFriendships({ userId: id, state: FriendshipState.Pending, maxResults: 1, lastTimestamp: undefined }))
  });

  constructor() {
    effect(() => {
      if (!this.requests.hasValue()) return;
      this.requestsList.set(this.requests.value().friendships);
      this.requestsHasMore.set(this.requests.value().hasMoreResults);
      this.requestsCursor.set(this.requests.value().lastTimestamp);
    })
  }

  loadMoreFriends() {
    let profileId = this.profileContext.profileId();
    this.loadingState.start();
    this.busyState.setBusy(true);
    this.userApi.getFriendships({
      userId: profileId,
      state: FriendshipState.Pending,
      maxResults: 1,
      lastTimestamp: this.requestsCursor()
    }).subscribe({
      next: (res: GetFriendshipsResDTO) => {
        this.requestsList.update(list => [...list, ...res.friendships]);
        this.requestsHasMore.set(res.hasMoreResults);
        this.requestsCursor.set(res.lastTimestamp);
        this.loadingState.success();
        this.busyState.setBusy(false);
      },
      error: (err: HttpErrorResponse) => {
        this.loadingState.fail('Something went wrong while trying to load friends.');
        this.busyState.setBusy(false);
      }
    })
  }

  onDecline(friendship: FriendshipDTO) {
    this.requestsList.update(list => list.filter(f => f.id === friendship.id));
    this.userApi.ignoreFriendship(friendship.id).subscribe();
  }
}
